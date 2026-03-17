# 🎯 DF2B - Финальная конфигурация для Netlify

## 📋 Статус развертывания

- ✅ App: https://df2b-app.netlify.app
- ✅ Landing: https://df2b-wellcome.netlify.app
- ✅ Admin: https://df2b-admin.netlify.app
- ✅ Supabase Edge Function: чат с Gemini AI (без Express сервера)

---

## 🔑 Переменные окружения для Netlify

### Для `df2b-app` (и `df2b-admin`)

**Откройте Netlify Dashboard:**

1. Сайт → Settings → Build & Deploy → Environment
2. Добавьте переменные:

```
VITE_SUPABASE_URL=https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co
VITE_SUPABASE_ANON_KEY=sbp_3a0c44e57607db0708bc2d822c574923e6a39430
VITE_GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc
```

**Или** используйте `netlify.toml` (уже в проекте):

```toml
[env.production]
  VITE_SUPABASE_URL = "https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co"
  VITE_SUPABASE_ANON_KEY = "sbp_3a0c44e57607db0708bc2d822c574923e6a39430"
  VITE_GEMINI_API_KEY = "AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc"
```

---

## 🏗️ Архитектура без Express

```
┌─────────────────────────────────────────────┐
│     Netlify Domains (3 сайта)              │
├─────────────────────────────────────────────┤
│ df2b-app.netlify.app (React App)           │
│ df2b-admin.netlify.app (Admin Panel)       │
│ df2b-wellcome.netlify.app (Landing)        │
└────────────┬────────────────────────────────┘
             │
             ├─→ Supabase Auth
             │   (JWT tokens)
             │
             ├─→ Supabase Database
             │   (tables: messages, health_data, etc.)
             │
             └─→ Supabase Edge Functions
                 (chat-with-gemini)
                |
                └─→ Google Gemini API
                    (AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc)
```

---

## 📝 Что уже настроено

### ✅ `app/src/sections/ChatScreen.tsx`
- Удален API_BASE_URL (Express больше не нужен)
- Загрузка сообщений из Supabase таблицы напрямую
- Вызов `/chat-with-gemini` Edge Function вместо Express

### ✅ `netlify.toml` (app)
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[env.production]
  VITE_SUPABASE_URL = "..."
  VITE_SUPABASE_ANON_KEY = "..."
  VITE_GEMINI_API_KEY = "..."
```

### ✅ `.env.example` (app)
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_GEMINI_API_KEY

---

## 🚀 Следующие шаги

### 1️⃣ Развернуть Edge Function

Выполните инструкции из `SUPABASE_EDGE_FUNCTIONS_DEPLOY.md`:

```bash
# Способ 1 (быстро): Через Supabase Dashboard
# Способ 2 (правильно): Через CLI
supabase functions deploy chat-with-gemini
```

### 2️⃣ Обновить переменные в Netlify (если используете UI вместо netlify.toml)

```
Settings → Build & Deploy → Environment
```

### 3️⃣ Пересобрать приложения на Netlify

- Нажмите **Trigger deploy** на каждом сайте
- Или выполните git push в main branch

### 4️⃣ Протестировать

```bash
# Через приложение
https://df2b-app.netlify.app
# → Войти → ChatScreen → Отправить сообщение

# DevTools → Network → XHR
# → Должен быть вызов к https://sbp-....functions.supabase.co/chat-with-gemini
```

---

## 🔍 Проверка конфигурации

### Проверить, что переменные загружены

В браузерной консоли (DevTools):

```javascript
// Должно показать ваш Supabase URL
import.meta.env.VITE_SUPABASE_URL
// "https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co"

// Если undefined → переменные не установлены в Netlify
```

### Проверить Edge Function

```bash
curl -X POST https://sbp-....functions.supabase.co/chat-with-gemini \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Привіт","profile":"civilian"}'
```

---

## 📊 Мониторинг

### Supabase Dashboard:
- **Edge Functions** → Logs (ищите ошибки)
- **Database** → messages (проверьте, сохраняются ли сообщения)

### Netlify Dashboard:
- **Deployments** (статус сборки)
- **Analytics** (трафик)

---

## 🛑 Если что-то не работает

| Проблема | Решение |
|----------|---------|
| "Function not found" | Развернуть Edge Function (см. SUPABASE_EDGE_FUNCTIONS_DEPLOY.md) |
| "Unauthorized" | Проверить JWT токен, перезагрузить страницу, очистить cookies |
| "Gemini API error" | Проверить GEMINI_API_KEY в переменных окружения Supabase |
| Messages не совок | Проверить RLS policies в Supabase на таблице `messages` |

---

## 📦 Express сервер теперь не нужен!

Папка `backend/` больше не используется для:
- ❌ `/api/chat` → Заменено на Edge Function
- ❌ `/api/messages` → Используются Supabase запросы
- ❌ `/api/auth/*` → Используется встроенная Supabase Auth

Вы можете:
- 🗑️ Удалить папку `backend/`
- 📝 Или оставить как документацию (схема SQL, примеры)

---

## 🎊 Финальный статус

| Компонент | До | Сейчас |
|-----------|-------|---------|
| API | Express сервер | Supabase Edge Functions |
| Auth | Совет API | Встроенная Supabase Auth |
| Database | Supabase | Supabase ✅ |
| Frontend | Netlify + API | Netlify ✅ |
| AI (Gemini) | Express обертка | Edge Function ✅ |
| Стоимость | Express хостинг | Бесплатно (Supabase) |

✨ **Всё готово к запуску!**
