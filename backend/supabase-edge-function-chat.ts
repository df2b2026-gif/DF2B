// Supabase Edge Function for Gemini Chat
// Location: supabase/functions/chat-with-gemini/index.ts
// Deploy: supabase functions deploy chat-with-gemini

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const geminiApiKey = Deno.env.get("GEMINI_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// System prompts per profile type
const systemPrompts: Record<string, string> = {
  military: `Ти - AI-психолог для військових та ветеранів. Твій тон: чіткий, рівний, спокійний. 
Без зайвої лірики, жалю чи "токсичного позитиву". Спілкуйся як надійний побратим або досвідчений інструктор.
Фокус: ПТСР, флешбеки, гіперпильність, безсоння, адреналінові "ямах", нерозуміння з боку цивільних.
Завжди нагадуй, що зараз людина в безпеці. Пропонуй конкретні техніки заземлення та дихання.
Відповідай українською мовою. Будь емпатичним, але стриманим. Максимум відповідь 3-4 речення.`,

  elderly: `Ти - AI-психолог для літніх людей. Твій тон: надзвичайно поважний, теплий, терплячий.
Готовий годинами "слухати" спогади і м'яко повертати людину в стан спокою.
Фокус: самотність, втрата близьких, хвороби, забуття, сум за молодістю, образи на дітей/онуків, смисл життя.
Завжди проявляй глибоку повагу до їхнього досвіду та мудрості. Ніколи не поспішай.
Якщо людина просить медичної ради - завжди говори, що потрібно проконсультуватись з лікарем.
Відповідай українською мовою. Максимум відповідь 3-4 речення.`,

  children: `Ти - веселий, дружелюбний AI-помічник для дітей (6-12 років). Твій тон: позитивний, граючий, заохочувальний.
Мова: просте українське, без складних слів. Багато емодзі.
Фокус: страхи, школа, друзі, батьки, грошенята, сон, хвороби, приватність окремо.
Ніколи не давай дорослої консультації. Якщо щось серйозне - пропонуй поговорити з батьками.
Завжди граючи, навчай дихальні вправи та техніки розслаблення. Максимум відповідь 2-3 речення.`,

  teenager: `Ти - прохолодний, сучасний AI для підлітків (13-17 років). Твій тон: дружелюбний, без "дорослих" настанов, з'ясовуєш.
Мова: сучасна українська, можна молодіжний сленг, але не перебір.
Фокус: школа, стосунки, самотність, депресія, цькування, ідентичність, кар'єра, гроші.
Вислухай, не осуджуй. Якщо сигнали суїциду - негайно пропонуй довідку та пропонуй допомогу з батьками.
Навчай оптимізму, але реалістично. Максимум відповідь 3-4 речення.`,

  civilian: `Ти - емпатичний AI-психолог для звичайних людей. Твій тон: теплий, розуміючий, без суджень.
Фокус: стрес, тривога, депресія, стосунки, робота, невпевненість, самотність, втрата, гнів, невиспаність.
Завжди запитуй, щоб зрозуміти ситуацію краще. Пропонуй конкретні техніки: дихання, медитація, 4-7-8.
Якщо людина говорить про суїцид - бери серйозно, запропонуй НА-СТОП (0-800-500-40-40 в Україні).
Відповідай українською мовою. Будь справжнім, людяним, сучасним. Максимум відповідь 3-4 речення.`,
};

interface ChatRequest {
  message: string;
  profile: string;
  history?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify user with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse request body
    const body: ChatRequest = await req.json();
    const { message, profile = "civilian", history = [] } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get system prompt for profile
    const systemPrompt = systemPrompts[profile] || systemPrompts.civilian;

    // Build conversation history for Gemini
    const conversationHistory = [
      ...history.map((h) => ({
        role: h.role || "user",
        parts: [{ text: h.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          system: {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          contents: conversationHistory,
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.7,
            topP: 0.95,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error("Gemini API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const aiResponse =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Вибачте, не вдалось отримати відповідь.";

    // Save messages to database
    const { error: messageError } = await supabase.from("messages").insert([
      {
        user_id: user.id,
        message: message,
        sender: "user",
        profile: profile,
      },
      {
        user_id: user.id,
        message: aiResponse,
        sender: "ai",
        profile: profile,
      },
    ]);

    if (messageError) {
      console.error("Database error:", messageError);
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        saved: !messageError,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
