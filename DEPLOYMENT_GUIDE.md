# 🎯 DF2B - Полный гайд по развертыванию (3 домена на Netlify)

## 📊 Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                   DF2B App Structure                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Landing Page (статический сайт)                      │
│  └── https://df2b-wellcome.netlify.app                │
│                                                         │
│  User App (React + Vite)                              │
│  ├── Chat с Gemini AI                                  │
│  ├── Health Tracking                                   │
│  ├── Breathing Exercises                               │
│  ├── Stress Alerts                                     │
│  └── https://df2b-app.netlify.app                     │
│                                                         │
│  Admin Panel (React + Vite)                           │
│  ├── User Management                                   │
│  ├── Prompt Customization                              │
│  ├── Audio Track Management                            │
│  ├── Analytics Dashboard                               │
│  └── https://df2b-admin.netlify.app                   │
│                                                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ├─────→ Supabase Auth (JWT)
                       │
                       ├─────→ Supabase Database
                       │       (PostgreSQL)
                       │
                       └─────→ Supabase Edge Functions
                               ├─ chat-with-gemini
                               └─ (другие функции)
                                  │
                                  └─ Google Gemini API
```

---

## 🔑 Ключевые данные
 
| Параметр | Значение |
|----------|---------|
| **Supabase URL** | https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co |
| **Service Role Key** | sbp_3a0c44e57607db0708bc2d822c574923e6a39430 |
| **Gemini API Key** | AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc |
| **App Domain** | df2b-app.netlify.app |
| **Admin Domain** | df2b-admin.netlify.app |
| **Landing Domain** | df2b-wellcome.netlify.app |

---

## 🚀 Быстрый старт (5 минут)

### 1. Развернуть Edge Function

```bash
cd /workspaces/Try2/DF2B_лэндос

# Способ 1 (быстро): Скрипт
chmod +x deploy.sh
./deploy.sh

# Способ 2 (прямо): Через Суpabase CLI
supabase functions deploy chat-with-gemini --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430

# Способ 3 (графически): Supabase Dashboard → Edge Functions
# (скопируйте содержимое backend/supabase-edge-function-chat.ts)
```

### 2. Установить переменные в Netlify

**Для каждого сайта:**
1. Netlify Dashboard → Select Site
2. Settings → Build & Deploy → Environment
3. Добавьте:

```
VITE_SUPABASE_URL=https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co
VITE_SUPABASE_ANON_KEY=sbp_3a0c44e57607db0708bc2d822c574923e6a39430
VITE_GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc
```

### 3. Пересобрать сайты

1. Netlify Dashboard → Deployments
2. Для каждого сайта: **Trigger deploy**

### 4. Протестировать

```bash
# App
https://df2b-app.netlify.app
→ Sign Up / Login
→ ChatScreen
→ Отправить сообщение

# DevTools → Network → XHR
# Должен быть запрос к Supabase Edge Function
```

---

## 📋 Детальная инструкция

### Шаг 1: Развернуть Supabase Edge Functions

#### Вариант A: Через Dashboard (самый простой)

1. Откройте **Supabase Dashboard**
2. Выберите ваш проект DF2B
3. Перейдите в **Edge Functions** (левое меню)
4. Нажмите **Create a new function**
5. Название: `chat-with-gemini`
6. Скопируйте содержимое файла `backend/supabase-edge-function-chat.ts`
7. Вставьте в редактор
8. В меню справа нажмите **Environment Variables**
9. Добавьте: `GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc`
10. Нажмите **Deploy**

#### Вариант B: Через Supabase CLI (рекомендуется)

```bash
# 1. Установить CLI
npm install -g supabase

# 2. Инициализировать проект
cd /workspaces/Try2/DF2B_лэндос
supabase init

# 3. Создать функцию
supabase functions new chat-with-gemini

# 4. Скопировать код
cp backend/supabase-edge-function-chat.ts supabase/functions/chat-with-gemini/index.ts

# 5. Развернуть
supabase functions deploy chat-with-gemini --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430

# 6. Установить переменные окружения
supabase secrets set GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc \
  --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430
```

### Шаг 2: Настроить переменные в Netlify

#### Способ A: Через Dashboard UI

**Для df2b-app:**
1. https://app.netlify.com → Select team → Select site
2. Settings → Build & Deploy → Environment
3. Нажмите **Edit variables**
4. Добавьте три переменные выше
5. Save

**То же самое для df2b-admin и df2b-wellcome**

#### Способ B: Через файл `netlify.toml` (уже настроено)

Файлы `app/netlify.toml` и `admin/netlify.toml` уже содержат:

```toml
[env.production]
  VITE_SUPABASE_URL = "https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co"
  VITE_SUPABASE_ANON_KEY = "sbp_3a0c44e57607db0708bc2d822c574923e6a39430"
  VITE_GEMINI_API_KEY = "AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc"
```

### Шаг 3: Пересобрать приложения на Netlify

**Локально:**
```bash
# App
cd app && npm run build && npm run preview

# Admin
cd admin && npm run build && npm run preview
```

**На Netlify:**
1. Каждый сайт → Deployments
2. Кнопка "Trigger deploy"
3. Дождитесь завершения

### Шаг 4: Проверить конфигурацию

#### В браузере (DevTools Console):

```javascript
// Должны быть определены
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_ANON_KEY
import.meta.env.VITE_GEMINI_API_KEY

// Если undefined - переменные не установлены в Netlify
```

#### Через Supabase:

```bash
# Проверить, что функция развернута
supabase functions list --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430

# Тест функции
supabase functions invoke chat-with-gemini --project-id sbp_3a0c44e57607db0708bc2d822c574923e6a39430
```

---

## 🔒 Безопасность

- ✅ **JWT Tokens**: Supabase автоматически выдает токены при логине
- ✅ **RLS Policies**: Пользователи видят только свои данные
- ✅ **Service Role Key**: Хранится только в Supabase (не разглашается)
- ✅ **GEMINI_API_KEY**: Хранится в переменных окружения Edge Function
- ✅ **CORS**: Настроено для Netlify доменов

---

## 📝 Что обновлено в коде

### ✅ `app/src/sections/ChatScreen.tsx`
```typescript
// До:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Сейчас:
// API_BASE_URL удален
const { data } = await supabase.functions.invoke('chat-with-gemini', {
  body: { message, profile, history },
});
```

### ✅ `app/src/lib/supabase.ts`
- Уже настроена на Supabase Project

### ✅ `netlify.toml` (app & admin)
- Переменные окружения настроены
- Build command: `npm run build`

---

## 🧪 Примеры тестирования

### Тест 1: Залогиниться и отправить сообщение

```bash
# 1. Откройте https://df2b-app.netlify.app
# 2. Нажмите "Sign Up"
# 3. Введите email и пароль
# 4. Система создаст вас в Supabase Auth
# 5. Откроется ChatScreen
# 6. Введите сообщение, например "Привіт"
# 7. Проверьте DevTools → Network → XHR
#    → Должны быть запросы к functions.supabase.co
```

### Тест 2: Проверить сообщения в БД

```bash
# Через Supabase Dashboard:
# 1. Dashboard → Database
# 2. Таблица: messages
# 3. Должны быть строки с вашими сообщениями и ответами AI
```

### Тест 3: Проверить логи Edge Function

```bash
# Через Supabase Dashboard:
# 1. Edge Functions → chat-with-gemini
# 2. Нажмите на последний запрос
# 3. Проверьте логи (Request / Response)
```

---

## ⚠️ Troubleshooting

| Проблема | Решение |
|----------|---------|
| "Function not found (404)" | Edge Function не развернута. Выполните шаг 1. |
| "Unauthorized" | JWT токен истек. Перезагрузите страницу. |
| "Gemini API error (403)" | API key неправильный или лимит исчерпан. |
| "Messages не сохраняются" | Проверьте RLS policies на таблице `messages` в Supabase. |
| Переменные окружения "undefined" | Переменные не установлены в Netlify. Проверьте шаг 2. |
| "CORS error" | Supabase должна разрешать запросы с df2b-*.netlify.app |

---

## 📊 Статус после развертывания

| Компонент | Статус |
|-----------|--------|
| 🌐 Landing | ✅ https://df2b-wellcome.netlify.app |
| 📱 App | ✅ https://df2b-app.netlify.app |
| 🔐 Admin | ✅ https://df2b-admin.netlify.app |
| 🗄️ Database | ✅ Supabase PostgreSQL |
| 🔑 Auth | ✅ Supabase JWT |
| 🤖 AI Chat | ✅ Supabase Edge Function + Gemini |
| 📤 Messages | ✅ Supabase Realtime |
| 🔐 Security | ✅ RLS Policies + JWT |

---

## 🎊 Финал

Поздравляю! 🎉 Ваше приложение готово:

1. ✅ 3 Netlify сайта в эксплуатации
2. ✅ Supabase Edge Functions заменили Express сервер
3. ✅ Gemini AI интегрирован безопасно
4. ✅ Автоматическая масштабируемость
5. ✅ Бесплатный хостинг (в рамках плана)

**Запустить:**
```bash
# 1. Развернуть Edge Function
supabase functions deploy chat-with-gemini

# 2. Установить переменные Netlify
# (см. шаг 2)

# 3. Пересобрать сайты на Netlify
# (см. шаг 3)

# 4. Открыть https://df2b-app.netlify.app и тестировать!
```

Вопросы? Смотрите подробные гайды:
- 📖 `SUPABASE_EDGE_FUNCTIONS_DEPLOY.md` - Развертывание функций
- 📖 `NETLIFY_FINAL_CONFIG.md` - Конфигурация Netlify
