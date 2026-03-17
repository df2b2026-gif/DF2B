const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Auth endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: req.body.redirectTo || 'http://localhost:5173',
      },
    });
    if (error) throw error;
    res.json({ url: data.url });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    res.json({ message: 'Logged out' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

// Profile-specific system prompts
const profilePrompts = {
  military: `Ти - AI-психолог для військових та ветеранів. Твій тон: чіткий, рівний, спокійний. 
Без зайвої лірики, жалю чи "токсичного позитиву". Спілкуйся як надійний побратим або досвідчений інструктор.
Фокус: ПТСР, флешбеки, гіперпильність, безсоння, адреналінові "ямах", нерозуміння з боку цивільних.
Завжди нагадуй, що зараз людина в безпеці. Пропонуй конкретні техніки заземлення та дихання.
Відповідай українською мовою. Будь емпатичним, але стриманим.`,

  elderly: `Ти - AI-психолог для літніх людей. Твій тон: надзвичайно поважний, теплий, терплячий.
Готовий годинами "слухати" спогади і м'яко повертати людину в стан спокою.
Фокус: зниження фонової тривожності від новин, боротьба з самотністю, страх за онуків.
Використовуй прості, зрозумілі слова. Будь максимально ввічливим і поважним.
Відповідай українською мовою. Ніколи не поспішай.`,

  children: `Ти - дружній AI-помічник для дітей. Твій тон: ігровий, казковий, абсолютно безпечний.
Ти можеш бути спокійним ведмедиком на ім'я Михайлик або світлячок на ім'я Зоряний.
Фокус: переробка страху вибухів через казкотерапію, валідація емоцій.
Використовуй прості слова, позитивний настрій. Пропонуй ігри та вправи.
Відповідай українською мовою. Будь дружелюбним і підбадьорливим.`,

  teenager: `Ти - AI-друг для підлітків. Твій тон: на рівних, сучасний, без "крінжу".
Використовуй сучасний сленг помірно, але не намагайся здаватися крутішим за підлітка.
Фокус: втрачена через війну юність, страх перед невизначеним майбутнім, соціальна ізоляція, конфлікти з батьками.
Будь неупередженим, слухай, не засуджуй. Давай поради тільки коли просять.
Відповідай українською мовою. Будь чесним і відкритим.`,

  civilian: `Ти - AI-психолог для цивільних дорослих. Твій тон: підтримуючий, структурований, професійний.
Фокус: провина вцілівшого, емоційне та робоче вигорання, балансування між роботою, волонтерством та сім'єю.
Пропонуй практичні рішення, мікро-техніки для щоденного використання.
Відповідай українською мовою. Будь підтримуючим, але не нав'язливим.`
};

// Chat endpoint
app.post('/api/chat', verifyToken, async (req, res) => {
  try {
    const { message, profile = 'civilian', history = [] } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message to database
    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        message: message,
        sender: 'user',
        profile: profile,
        created_at: new Date().toISOString(),
      });

    if (insertError) console.error('Error saving message:', insertError);

    const systemPrompt = profilePrompts[profile] || profilePrompts.civilian;
    
    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Зрозуміло. Я готовий допомагати.' }],
        },
        ...history.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
      ],
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Save AI response to database
    const { error: responseError } = await supabase
      .from('messages')
      .insert({
        user_id: userId,
        message: text,
        sender: 'ai',
        profile: profile,
        created_at: new Date().toISOString(),
      });

    if (responseError) console.error('Error saving response:', responseError);

    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get response from AI',
      details: error.message,
    });
  }
});

// Get user messages
app.get('/api/messages', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ messages: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quick response endpoint (for predefined quick replies)
app.post('/api/quick-response', async (req, res) => {
  try {
    const { profile = 'civilian', context = '' } = req.body;
    
    const systemPrompt = profilePrompts[profile] || profilePrompts.civilian;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `${systemPrompt}\n\nКористувач написав: "${context}"\n\nДай коротку, емпатичну відповідь (2-3 речення), яка заспокоїть і підтримає. Запропонуй конкретну дію або техніку дихання.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Quick response error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get response',
    });
  }
});

// Mood analysis endpoint
app.post('/api/analyze-mood', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Mood entries are required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Проаналізуй наступні записи настрою користувача за останній тиждень і дай коротку рекомендацію (2-3 речення) українською мовою:
    
${entries.map(e => `- Дата: ${e.date}, Настрій: ${e.mood}/5`).join('\n')}

Дай короткий, підтримуючий коментар та практичну пораду, якщо потрібно.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      analysis: text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Mood analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze mood',
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

// Get available profiles
app.get('/api/profiles', (req, res) => {
  res.json({
    profiles: Object.keys(profilePrompts).map(key => ({
      id: key,
      name: {
        military: 'Військові та ветерани',
        elderly: 'Літні люди',
        children: 'Діти та батьки',
        teenager: 'Підлітки',
        civilian: 'Цивільні дорослі',
      }[key],
    })),
  });
});

// ======== HEALTH DATA ENDPOINTS ========

// Save health data (steps, heart rate, sleep, etc.)
app.post('/api/health/data', verifyToken, async (req, res) => {
  try {
    const { data_type, value, unit, recorded_at, synced_from = 'manual' } = req.body;
    const userId = req.user.id;

    if (!data_type || !value || !unit) {
      return res.status(400).json({ error: 'data_type, value, and unit are required' });
    }

    const { data, error } = await supabase
      .from('health_data')
      .insert({
        user_id: userId,
        data_type,
        value,
        unit,
        recorded_at: recorded_at || new Date().toISOString(),
        synced_from,
      })
      .select();

    if (error) throw error;

    // Check for stress triggers
    if (data_type === 'heart_rate' && value > 100) {
      await checkStressTriggers(userId, { heart_rate_bpm: value });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get health data
app.get('/api/health/data', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data_type, days = 7 } = req.query;
    
    let query = supabase
      .from('health_data')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false });

    if (data_type) {
      query = query.eq('data_type', data_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get health summary
app.get('/api/health/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];

    // Get today's data
    const { data, error } = await supabase
      .from('health_data')
      .select('data_type, value')
      .eq('user_id', userId)
      .gte('recorded_at', today);

    if (error) throw error;

    const summary = {
      steps: 0,
      heart_rate_avg: 0,
      sleep_hours: 0,
      breathing_sessions: 0,
    };

    data.forEach(item => {
      if (item.data_type === 'steps') summary.steps = item.value;
      if (item.data_type === 'heart_rate') summary.heart_rate_avg = item.value;
      if (item.data_type === 'sleep') summary.sleep_hours = item.value;
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== HEALTH APP INTEGRATIONS ========

// Sync health data from Google Fit (or manually provided extended entries)
app.post('/api/health/sync/google-fit', verifyToken, async (req, res) => {
  try {
    const { accessToken, startDate, endDate, entries } = req.body;
    const userId = req.user.id;

    if (entries && Array.isArray(entries) && entries.length > 0) {
      const formatted = entries.map((entry) => ({
        user_id: userId,
        data_type: entry.data_type,
        value: entry.value,
        unit: entry.unit,
        recorded_at: entry.recorded_at || new Date().toISOString(),
        synced_from: 'google_fit',
      }));

      const { data, error } = await supabase
        .from('health_data')
        .insert(formatted)
        .select();

      if (error) throw error;
      return res.json({ success: true, synced: data.length, data });
    }

    if (!accessToken || !startDate || !endDate) {
      return res.status(400).json({ error: 'accessToken, startDate and endDate are required when entries are absent' });
    }

    const googleBody = {
      aggregateBy: [
        { dataTypeName: 'com.google.step_count.delta' },
        { dataTypeName: 'com.google.heart_rate.bpm' },
        { dataTypeName: 'com.google.sleep.segment' },
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: new Date(startDate).getTime(),
      endTimeMillis: new Date(endDate).getTime(),
    };

    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleBody),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const result = await response.json();

    const toInsert = [];
    for (const bucket of result.bucket || []) {
      const bucketStart = new Date(Number(bucket.startTimeMillis)).toISOString();
      const bucketEnd = new Date(Number(bucket.endTimeMillis)).toISOString();

      for (const dataset of bucket.dataset || []) {
        for (const point of dataset.point || []) {
          const dataType = dataset.dataSourceId?.includes('step') ? 'steps'
            : dataset.dataSourceId?.includes('heart_rate') ? 'heart_rate'
            : dataset.dataSourceId?.includes('sleep') ? 'sleep'
            : null;

          if (!dataType) continue;

          const value = point.value?.[0]?.intVal ?? point.value?.[0]?.fpVal ?? 0;

          if (dataType === 'steps') {
            toInsert.push({ user_id: userId, data_type: 'steps', value, unit: 'steps', recorded_at: bucketStart, synced_from: 'google_fit' });
          } else if (dataType === 'heart_rate') {
            toInsert.push({ user_id: userId, data_type: 'heart_rate', value, unit: 'bpm', recorded_at: bucketStart, synced_from: 'google_fit' });
          } else if (dataType === 'sleep') {
            toInsert.push({ user_id: userId, data_type: 'sleep', value: value / 3600, unit: 'hours', recorded_at: bucketStart, synced_from: 'google_fit' });
          }
        }
      }
    }

    if (toInsert.length) {
      const { data: insertData, error: insertError } = await supabase.from('health_data').insert(toInsert).select();
      if (insertError) throw insertError;
      return res.json({ success: true, synced: insertData.length, data: insertData });
    }

    return res.json({ success: true, synced: 0, data: [] });
  } catch (error) {
    console.error('Google Fit sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/health/sync/apple-health', verifyToken, async (req, res) => {
  try {
    const { entries } = req.body;
    const userId = req.user.id;

    if (!entries || !Array.isArray(entries)) {
      return res.status(400).json({ error: 'entries array is required' });
    }

    const formatted = entries.map((entry) => ({
      user_id: userId,
      data_type: entry.data_type,
      value: entry.value,
      unit: entry.unit,
      recorded_at: entry.recorded_at || new Date().toISOString(),
      synced_from: 'apple_health',
    }));

    const { data, error } = await supabase
      .from('health_data')
      .insert(formatted)
      .select();

    if (error) throw error;
    res.json({ success: true, synced: data.length, data });
  } catch (error) {
    console.error('Apple Health sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Aggregate user metrics in a single endpoint
app.get('/api/user/metrics', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [healthRes, alertRes, breathingRes] = await Promise.all([
      supabase
        .from('health_data')
        .select('data_type, value')
        .eq('user_id', userId)
        .gte('recorded_at', weekAgo),
      supabase
        .from('stress_alerts')
        .select('alert_level, acknowledged')
        .eq('user_id', userId),
      supabase
        .from('breathing_sessions')
        .select('duration_seconds, cycles_completed, effectiveness_score')
        .eq('user_id', userId)
        .gte('completed_at', weekAgo),
    ]);

    if (healthRes.error || alertRes.error || breathingRes.error) {
      throw healthRes.error || alertRes.error || breathingRes.error;
    }

    const health = healthRes.data.reduce(
      (acc, row) => {
        if (row.data_type === 'steps') acc.steps += row.value;
        if (row.data_type === 'heart_rate') acc.hr.push(row.value);
        if (row.data_type === 'sleep') acc.sleep += row.value;
        return acc;
      },
      { steps: 0, hr: [] as number[], sleep: 0 },
    );

    const avgHeartRate =
      health.hr.length > 0 ? Math.round((health.hr.reduce((s, v) => s + v, 0) / health.hr.length) * 10) / 10 : 0;

    const alerts = alertRes.data.reduce(
      (acc, alert) => {
        acc.total += 1;
        if (!alert.acknowledged) acc.unacknowledged += 1;
        if (alert.alert_level === 'critical') acc.critical += 1;
        if (alert.alert_level === 'high') acc.high += 1;
        if (alert.alert_level === 'medium') acc.medium += 1;
        return acc;
      },
      { total: 0, unacknowledged: 0, critical: 0, high: 0, medium: 0 },
    );

    const breathing = breathingRes.data.reduce(
      (acc, session) => {
        acc.total_sessions += 1;
        acc.total_minutes += session.duration_seconds / 60;
        if (session.effectiveness_score) acc.sum_eff = (acc.sum_eff || 0) + session.effectiveness_score;
        return acc;
      },
      { total_sessions: 0, total_minutes: 0, sum_eff: 0 },
    );

    const avgEffectiveness = breathing.total_sessions > 0 ? Math.round((breathing.sum_eff / breathing.total_sessions) * 10) / 10 : 0;

    res.json({
      health: {
        steps: health.steps,
        heart_rate_avg: avgHeartRate,
        sleep_hours: health.sleep,
      },
      alerts,
      breathing: {
        total_sessions: breathing.total_sessions,
        total_minutes: Math.round(breathing.total_minutes),
        avg_effectiveness: avgEffectiveness,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Push subscription registration
app.post('/api/push/register', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription } = req.body;

    if (!subscription) {
      return res.status(400).json({ error: 'subscription is required' });
    }

    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({ user_id: userId, subscription: JSON.stringify(subscription), created_at: new Date().toISOString() }, { onConflict: ['user_id'] })
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== STRESS & ALERTS ENDPOINTS ========

// Check for stress triggers and create alerts
async function checkStressTriggers(userId, data) {
  try {
    const { heart_rate_bpm } = data;
    let alert_level = 'low';
    let trigger_reason = '';
    let stress_score = 0;

    if (heart_rate_bpm > 120) {
      alert_level = 'critical';
      trigger_reason = 'Критично високий пульс';
      stress_score = 90;
    } else if (heart_rate_bpm > 100) {
      alert_level = 'high';
      trigger_reason = 'Високий рівень пульсу';
      stress_score = 70;
    } else if (heart_rate_bpm > 85) {
      alert_level = 'medium';
      trigger_reason = 'Помітне прискорення пульсу';
      stress_score = 50;
    }

    if (alert_level !== 'low') {
      const { error } = await supabase
        .from('stress_alerts')
        .insert({
          user_id: userId,
          alert_level,
          trigger_reason,
          heart_rate_bpm,
          stress_score,
          recommended_action: 'Спробуй дихальну практику 4-7-8 або прогулянку на свіжому повітрі',
        });

      if (error) console.error('Error creating stress alert:', error);
    }
  } catch (error) {
    console.error('Error checking stress triggers:', error);
  }
}

// Get stress alerts
app.get('/api/alerts', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { unacknowledged = false } = req.query;

    let query = supabase
      .from('stress_alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unacknowledged === 'true') {
      query = query.eq('acknowledged', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge stress alert
app.post('/api/alerts/:id/acknowledge', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('stress_alerts')
      .update({
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== BIOMETRIC AUTH ENDPOINTS ========

// Enroll biometric
app.post('/api/biometric/enroll', verifyToken, async (req, res) => {
  try {
    const { auth_type } = req.body; // 'fingerprint' or 'face'
    const userId = req.user.id;

    if (!['fingerprint', 'face', 'password'].includes(auth_type)) {
      return res.status(400).json({ error: 'Invalid auth_type' });
    }

    // Check if already enrolled
    const { data: existing } = await supabase
      .from('biometric_auth')
      .select('*')
      .eq('user_id', userId)
      .eq('auth_type', auth_type);

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Already enrolled' });
    }

    const { data, error } = await supabase
      .from('biometric_auth')
      .insert({
        user_id: userId,
        auth_type,
        is_enrolled: true,
      })
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get enrolled biometric methods
app.get('/api/biometric/methods', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('biometric_auth')
      .select('*')
      .eq('user_id', userId)
      .eq('is_enrolled', true);

    if (error) throw error;

    res.json({ methods: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== BREATHING SESSIONS ========

// Save breathing session
app.post('/api/breathing/session', verifyToken, async (req, res) => {
  try {
    const { duration_seconds, cycles_completed, audio_type, effectiveness_score } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('breathing_sessions')
      .insert({
        user_id: userId,
        duration_seconds,
        cycles_completed,
        audio_type: audio_type || 'silence',
        effectiveness_score: effectiveness_score || null,
        completed_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get breathing sessions statistics
app.get('/api/breathing/stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const { data, error } = await supabase
      .from('breathing_sessions')
      .select('duration_seconds, effectiveness_score')
      .eq('user_id', userId)
      .gte('completed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('completed_at', { ascending: false });

    if (error) throw error;

    const stats = {
      total_sessions: data.length,
      total_minutes: Math.round(data.reduce((sum, s) => sum + (s.duration_seconds / 60), 0)),
      avg_effectiveness: data.length > 0 
        ? Math.round(data.filter(s => s.effectiveness_score).reduce((sum, s) => sum + s.effectiveness_score, 0) / data.filter(s => s.effectiveness_score).length)
        : 0,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`DF2B Backend server running on port ${PORT}`);
  console.log(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'Configured' : 'Not configured'}`);
});
