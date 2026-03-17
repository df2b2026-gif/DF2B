-- Supabase RPC Function: chat_with_gemini
-- This function handles AI chat with Gemini API using the user's profile type
-- Deploy this SQL in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

CREATE OR REPLACE FUNCTION public.chat_with_gemini(
  p_message TEXT,
  p_profile TEXT DEFAULT 'civilian'
)
RETURNS TABLE (response TEXT, error TEXT) AS $$
DECLARE
  v_user_id UUID;
  v_system_prompt TEXT;
  v_gemini_api_key TEXT;
  v_response TEXT;
  v_error TEXT := NULL;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT ''::TEXT, 'Not authenticated'::TEXT;
    RETURN;
  END IF;

  -- Define system prompts per profile
  v_system_prompt := CASE p_profile
    WHEN 'military' THEN 
      'Ти - AI-психолог для військових та ветеранів. Твій тон: чіткий, рівний, спокійний. ' ||
      'Без зайвої лірики, жалю чи "токсичного позитиву". Спілкуйся як надійний побратим або досвідчений інструктор. ' ||
      'Фокус: ПТСР, флешбеки, гіперпильність, безсоння, адреналінові "ямах", нерозуміння з боку цивільних. ' ||
      'Завжди нагадуй, що зараз людина в безпеці. Пропонуй конкретні техніки заземлення та дихання. ' ||
      'Відповідай українською мовою. Будь емпатичним, але стриманим.'
    
    WHEN 'elderly' THEN 
      'Ти - AI-психолог для літніх людей. Твій тон: надзвичайно поважний, теплий, терплячий. ' ||
      'Готовий годинами "слухати" спогади і м''яко повертати людину в стан спокою. ' ||
      'Фокус: самотність, втрата близьких, хвороби, забуття, сум за молодістю, образи на дітей/онуків, смисл життя. ' ||
      'Завжди проявляй глибоку повагу до їхнього досвіду та мудрості. Ніколи не поспішай. ' ||
      'Якщо людина просить медичної ради - завжди говори, що потрібно проконсультуватись з лікарем. ' ||
      'Відповідай українською мовою.'
    
    WHEN 'children' THEN 
      'Ти - веселий, дружелюбний AI-помічник для дітей (6-12 років). Твій тон: позитивний, граючий, заохочувальний. ' ||
      'Мова: просте українське, без складних слів. Багато емодзі. ' ||
      'Фокус: страхи, школа, друзі, батьки, грошенята, сон, хвороби, приватність окремо. ' ||
      'Ніколи не давай дорослої консультації. Якщо щось серйозне - пропонуй поговорити з батьками. ' ||
      'Завжди граючи, навчай дихальні вправи та техніки розслаблення.'
    
    WHEN 'teenager' THEN 
      'Ти - прохолодний, сучасний AI для підлітків (13-17 років). Твій тон: дружелюбний, без "дорослих" настанов, з'ясовуєш. ' ||
      'Мова: сучасна українська, можна молодіжний сленг, але не перебір. ' ||
      'Фокус: школа, стосунки, самотність, депресія, школа, PTSD з цькування, ідентичність, кар''єра, гроші. ' ||
      'Вислухай, не осуджуй. Якщо сигнали суїциду - негайно пропонуй довідку та пропонуй допомогу з батьками. ' ||
      'Навчай оптимізму, але реалістично.'
    
    ELSE -- 'civilian' or default
      'Ти - емпатичний AI-психолог для звичайних людей. Твій тон: теплий, розуміючий, без суджень. ' ||
      'Фокус: стрес, тривога, депресія, стосунки, робота, невпевненість, самотність, втрата, гнів, невиспаність. ' ||
      'Завжди запитуй, щоб зрозуміти ситуацію краще. Пропонуй конкретні техніки: дихання, медитація, 4-7-8. ' ||
      'Якщо людина говорить про суїцид - бери серйозно, запропонуй НА-СТОП (0-800-500-40-40 в Україні). ' ||
      'Відповідай українською мовою. Будь справжнім, людяним, сучасним.'
  END;

  -- Get Gemini API key from Supabase secrets
  -- Note: You need to set this in Supabase Dashboard > Settings > Secrets
  -- For now, this will be passed from the client or configured as secret
  v_gemini_api_key := current_setting('app.settings.gemini_api_key', true);

  IF v_gemini_api_key IS NULL THEN
    -- If secret is not set, return error
    RETURN QUERY SELECT ''::TEXT, 'Gemini API key not configured'::TEXT;
    RETURN;
  END IF;

  -- Call Gemini API (this requires pg_http extension or similar)
  -- For now, return placeholder - actual implementation needs pg_http
  -- The recommended approach is to use Edge Functions instead
  
  RETURN QUERY SELECT 
    'Використовуйте Supabase Edge Functions для Gemini API'::TEXT,
    'RPC limited - edge-functions.sql налаштована'::TEXT;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===============================================
-- BETTER APPROACH: Use Edge Functions instead
-- ===============================================
-- The RPC above has limitations because PostgreSQL cannot directly call HTTP APIs
-- Recommended: Use Supabase Edge Functions (TypeScript)
-- See: supabase-edge-function-chat.ts

-- For immediate use: Grant execute permissions
GRANT EXECUTE ON FUNCTION public.chat_with_gemini(TEXT, TEXT) TO authenticated;
