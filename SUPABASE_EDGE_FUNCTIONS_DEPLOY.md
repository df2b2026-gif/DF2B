# 🚀 Развертывание Supabase Edge Functions для DF2B

**Вы избегаете отдельного Express сервера** — всё работает через Supabase Edge Functions с Gemini AI.

## 📋 Предварительные требования

- ✅ Service Role Key: `sbp_3a0c44e57607db0708bc2d822c574923e6a39430` (у вас есть)
- ✅ Gemini API Key: `AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc`
- ✅ Supabase Project URL (из вашего проекта)

---

## 🛠️ Способ 1: Развертывание через Supabase Dashboard (САМЫЙ БЫСТРЫЙ)

### Шаг 1: Создать Edge Function в Dashboard

1. Откройте **Supabase Dashboard** → ваш проект DF2B
2. Перейдите в **Edge Functions** (слева в меню)
3. Нажмите **Create a new function**
4. Название: `chat-with-gemini`
5. Скопируйте код из файла `/backend/supabase-edge-function-chat.ts` (удалите первую строку `import { serve }...`)

### Шаг 2: Настроить переменные окружения

1. В правом меню функции нажмите **Environment Variables**
2. Добавьте:
   ```
   GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc
   ```

### Шаг 3: Развернуть и протестировать

- Нажмите **Deploy**
- Функция готова! URL будет примерно:
  ```
  https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.functions.supabase.co/chat-with-gemini
  ```

---

## 🛠️ Способ 2: Развертывание через Supabase CLI (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Установить Supabase CLI

```bash
pip install supabase-cli
# или
npm install -g supabase
```

### Шаг 2: Инициализировать Supabase проект локально

```bash
cd /workspaces/Try2/DF2B_лэндос
supabase init
```

Введите вашу Supabase URL и Service Role Key когда спросит.

### Шаг 3: Создать структуру функции

```bash
supabase functions new chat-with-gemini
```

### Шаг 4: Скопировать код функции

Скопируйте содержимое `/backend/supabase-edge-function-chat.ts` в:
```
supabase/functions/chat-with-gemini/index.ts
```

### Шаг 5: Развернуть

```bash
supabase functions deploy chat-with-gemini \
  --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430

# Установите переменные окружения
supabase secrets set GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc \
  --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430
```

---

## 📱 Обновления во фронтенде (УЖЕ СДЕЛАНЫ)

### ✅ Обновлено в `app/src/sections/ChatScreen.tsx`:

1. **Удалена ссылка на Express API** (`API_BASE_URL`)
2. **Загрузка сообщений напрямую из Supabase**
3. **Вызов Edge Function вместо Express**:
   ```typescript
   const { data } = await supabase.functions.invoke('chat-with-gemini', {
     body: { message, profile, history },
   });
   ```

---

## 🔒 Безопасность

- ✅ Токены передаются в заголовке `Authorization`
- ✅ Supabase проверяет токен перед выполнением функции
- ✅ Service Role Key хранится в Supabase (не разглашается)
- ✅ GEMINI_API_KEY хранится в переменных окружения Supabase

---

## 🧪 Тестирование

### Локально (с использованием Supabase CLI):

```bash
supabase functions invoke chat-with-gemini \
  --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430 \
  --body '{
    "message": "Привіт",
    "profile": "civilian",
    "history": []
  }'
```

### Через приложение:

1. Откройте https://df2b-app.netlify.app
2. Войдите или зарегистрируйтесь
3. Отправьте сообщение в ChatScreen
4. Проверьте в DevTools → Network → XHR, что вызывается Edge Function

---

## 🚨 Если что-то не работает

### Ошибка: "Function not found"

- Проверьте, что функция развернута: `supabase functions list --project-id sbp_...`
- Убедитесь, что URL функции совпадает в коде

### Ошибка: "Unauthorized"

- Проверьте, что токен передается правильно в заголовке
- Убедитесь, что Supabase auth настроена правильно

### Ошибка: "Gemini API error"

- Проверьте, что `GEMINI_API_KEY` установлена в переменных окружения
- Убедитесь, что ключ корректный: `AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc`

---

## 📦 Дополнительные Edge Functions (опционально)

Можно создать аналогичные функции для:
- `/api/health-data` → Edge Function `sync-health-data`
- `/api/stress-alerts` → Edge Function `generate-stress-alerts`
- `/api/breathing-sessions` → Edge Function `log-breathing-session`

---

## ✨ Финальные шаги

1. ✅ Создать Edge Function в Supabase
2. ✅ Установить переменные окружения (GEMINI_API_KEY)
3. ✅ Фронтенд уже обновлен (ChatScreen.tsx)
4. ✅ Протестировать в приложении
5. ✅ Удалить Express сервер (больше не нужен!)

---

## 🎯 Итого

- **Вместо Express сервера** → Supabase Edge Functions
- **Вместо API_BASE_URL** → Прямые Supabase вызовы
- **Безопасность** → JWT токены + RLS policies
- **Стоимость** → Бесплатно (в рамках плана Supabase)
- **Масштабируемость** → Автоматическая

🚀 **Готово к боевому использованию!**
