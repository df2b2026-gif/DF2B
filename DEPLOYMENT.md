# DF2B v2.0 - Deployment & Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm или yarn
- Supabase account
- Google Generative AI API key

---

## 📦 Backend Setup

### 1. Install Dependencies
```bash
cd DF2B_лэндос/backend
npm install
```

### 2. Configure Environment
```bash
# Create .env file (already prepared)
GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc
SUPABASE_URL=https://vqczqpigprsrnfsdmlti.supabase.co
SUPABASE_ANON_KEY=sbp_3a0c44e57607db0708bc2d822c574923e6a39430
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3001
NODE_ENV=development
```

### 3. Setup Supabase Database
```bash
# Run SQL schema in Supabase SQL Editor
# Copy content from backend/schema.sql and execute
```

### 4. Run Backend
```bash
npm start
# Server runs on http://localhost:3001
```

---

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd DF2B_лэндос/app
npm install
```

### 2. Configure Environment
```bash
# .env.local
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://vqczqpigprsrnfsdmlti.supabase.co
VITE_SUPABASE_ANON_KEY=sbp_3a0c44e57607db0708bc2d822c574923e6a39430
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Get Google OAuth Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web Application)
5. Copy Client ID and paste to `.env.local`

### 4. Run Frontend
```bash
npm run dev
# App runs on http://localhost:5173
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout

### Health Data
- `POST /api/health/data` - Save health data (steps, heart rate, etc.)
- `GET /api/health/data` - Get health history
- `GET /api/health/summary` - Get daily health summary
- `POST /api/health/sync/google-fit` - Sync health data from Google Fit (or pass `entries` array)
- `POST /api/health/sync/apple-health` - Sync Apple Health batch entries
- `GET /api/user/metrics` - Aggregate user health/alert/breathing data for dashboard

#### Формат записи `entries` (JSON)
```
[
  {
    "data_type": "steps" | "heart_rate" | "sleep" | "stress" | "breathing",
    "value": число,
    "unit": "steps" | "bpm" | "hours" | "percentage" | "cycles_per_min",
    "recorded_at": "2026-03-16T08:00:00Z" (опционально)
  },
  ...
]
```

### Stress Alerts
- `GET /api/alerts` - Get stress alerts
- `POST /api/alerts/:id/acknowledge` - Mark alert as acknowledged
- `POST /api/push/register` - Register browser push subscription

### Push Notification Flow
- Веб-уведомления активируются через Service Worker `app/public/sw.js`
- `usePushNotifications` в React запрашивает разрешение и регистрирует подписку
- Критические `stress_alerts` приводят к локальным уведомлениям
- Для FCM нужен ключ `VITE_FCM_VAPID_KEY` и backend push endpoint

### Biometric Authentication
- `POST /api/biometric/enroll` - Enroll fingerprint/face
- `GET /api/biometric/methods` - Get enrolled methods

### Breathing Sessions
- `POST /api/breathing/session` - Log breathing session
- `GET /api/breathing/stats` - Get breathing statistics

### Chat & AI
- `POST /api/chat` - Chat with AI psychologist
- `POST /api/quick-response` - Get quick emotional response

---

## 📱 Features Implemented

### ✅ Backend
- [x] Supabase integration with RLS policies
- [x] Google Generative AI chat with 5 profiles
- [x] Health data tracking (steps, heart rate, sleep)
- [x] Stress detection with automatic alerts
- [x] Breathing session logging
- [x] Biometric authentication support
- [x] Real-time triggers

### ✅ Frontend
- [x] Google OAuth login
- [x] Touch ID / Face ID authentication (WebAuthn)
- [x] Health data visualization
- [x] Stress alert notifications
- [x] Breathing exercises with counter
- [x] AI chat with different profiles
- [x] Offline support (PWA)

### 🔄 Ready for Integration
- Google Fit / Apple HealthKit sync
- Apple Health integration
- Advanced analytics dashboard
- Social features (share achievements)

---

## 🚀 Deployment

### Deploy Backend to Railway/Render
```bash
# Push to Git
git add .
git commit -m "Add health API and biometric auth"
git push origin main

# Connect to Railway/Render and select this repo
```

### Deploy Frontend to Vercel
```bash
# Update .env.local with production API URL
VITE_API_URL=https://your-backend.railway.app

# Deploy
npm run build
# Upload dist folder to Vercel
```

---

## 🔐 Security Best Practices

1. **Never commit secrets** - Use `.env.local` and `.gitignore`
2. **Enable HTTPS** - Required for biometric auth
3. **Use environment-specific keys** - Different keys for dev/prod
4. **Enable RLS on Supabase** - Already configured in schema.sql
5. **Validate tokens** - Backend verifies JWT tokens

---

## 📊 Real-Time Triggers Examples

### Heart Rate Alert
```javascript
if (heartRate > 120) {
  // Create CRITICAL alert
  // Trigger breathing exercise suggestion
  // Notify user to take action
}
```

### Stress Score Calculation
```
stress_score = (heart_rate - 60) / 60 * 100 + activity_level * 20
```

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=3002
```

### CORS Issues
```bash
# Update CORS_ORIGIN in backend/.env
CORS_ORIGIN=http://localhost:5173,https://your-domain.com
```

### Biometric Auth Not Working
- Requires HTTPS (except localhost)
- Check browser support for WebAuthn
- Enroll at least one method first

---

## 📞 Support
For issues or questions:
1. Check error logs in browser console
2. Review backend logs in terminal
3. Verify environment variables
4. Check Supabase dashboard for DB errors

---

## 🎯 Next Steps

1. **Configure Google OAuth** - Get production client ID
2. **Deploy backend** - Use Railway, Render, or VPS
3. **Deploy frontend** - Use Vercel or Netlify
4. **Enable Health API sync** - Integrate Google Fit/Apple Health
5. **Add push notifications** - For critical alerts
6. **Create admin dashboard** - Manage users and analytics

---

**Version**: 2.0  
**Last Updated**: March 16, 2026  
**Status**: Ready for Production
