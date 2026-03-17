# DF2B - Развернування на Netlify

Проект складається з **3 окремих застосунків**, кожен з яких повинен розгортатися як окремий сайт на Netlify.

---

## 📦 Структура проекту

```
DF2B_лэндос/
├── landing/           # Лендінг сторінка (статичний HTML)
│   ├── index.html
│   └── netlify.toml
│
├── app/              # Користувацький додаток (React + Vite)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── netlify.toml
│
├── admin/            # Адмін панель (React + Vite)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── netlify.toml
│
└── backend/          # Express сервер (Node.js)
    ├── server.js
    └── schema.sql
```

---

## 🚀 Порядок розгортання

### Шаг 1: Підготовка до Netlify

Кожна папка има **свої залежності** и **독립的な빌드процес**.

```bash
# Перейти у кожну папку и запустити:
npm install
npm run build
```

---

### Шаг 2: Створення сайтів на Netlify

За кожної трьох папок по одному сайту:

#### 1️⃣ **Landing** (www.df2b.com або df2b.com)

1. Йдіть на [Netlify](https://netlify.com) → **Add new site**
2. Вибрати: **Deploy manually** або **Connect to Git**
3. В полі **base directory** залишити пусто (публікуються всі файли)
4. **Publish directory:** `.` (кореневий каталог landing/)
5. Натиснути **Deploy**

**Build Settings:**
- **Build command:** (залишити пусто - статичні файли)
- **Publish directory:** landing/ (у коренях проекту)

---

#### 2️⃣ **App** (app.df2b.com)

1. **Add new site** → **Connect to Git** або **Deploy manually**
2. Виберіть репозиторій або завантажите вручну
3. **Base directory:** `DF2B_лэндос/app`

**Build Settings:**
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 або вище

**Environment Variables:**
```
VITE_API_URL=https://api.df2b.com
VITE_FCM_VAPID_KEY=<your-fcm-key>
```

---

#### 3️⃣ **Admin** (admin.df2b.com)

1. **Add new site** → **Deploy manually**
2. **Base directory:** `DF2B_лэндос/admin`

**Build Settings:**
- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Node version:** 18 або вище

**Environment Variables:**
```
VITE_API_URL=https://api.df2b.com
```

---

## 🔄 Налаштування DNS

На реєстрі вашого домену налаштуйте три CNAME записи:

```
Домен                    CNAME
─────────────────────────────────────────
df2b.com                 -> landing.netlify.com
www.df2b.com             -> landing.netlify.com
app.df2b.com             -> app.netlify.com
admin.df2b.com           -> admin.netlify.com
api.df2b.com             -> (backend - інший хостинг)
```

---

## 📱 Тестування локально

```bash
# Landing (статичний HTTP сервер)
cd landing
python -m http.server 8080

# App
cd app
npm install
npm run dev  # запущується на http://localhost:5173

# Admin
cd admin
npm install
npm run dev  # запущується на http://localhost:5174
```

---

## 🔐 Безпека

### Для Landing
- ✅ Статичні файли, безпечні за замовчуванням

### Для App
- 🔑 Авторизація через Supabase
- 🔒 JWT токени в localStorage
- 🚀 Проксіювання API через `VITE_API_URL`

### Для Admin
- 🔑 Окремий логін/пароль (або Supabase RLS)
- 🔒 Акцес тільки для адміністраторів
- Demo credentials: `admin@df2b.com` / `DF2B_Admin_123`

---

## 🔗 API Endpoints

Ваш backend повинен мати:

```
GET  /api/health/sync/google-fit
POST /api/health/sync/apple-health
GET  /api/user/metrics
GET  /api/alerts
POST /api/admin/login
POST /api/admin/prompts/update
POST /api/push/register
```

---

## 📊 Моніторинг

На Netlify в кожного сайту є:
- **Deploy logs** - логи останніх розгортань
- **Analytics** - переходи, помилки
- **Functions** - якщо використовуєте serverless функції
- **Redirects** - налаштування URL редиректів

---

## 🆘 Частые проблеми

### "Build failed" на App/Admin?
1. Перевірте `npm install` локально
2. Перевірте Node версію (повинна бути 18+)
3. Перевірте environment variables в Netlify UI

### App не знаходить API?
1. Установіть `VITE_API_URL` у environment variables
2. Переконайтесь, що backend доступен з інтернету
3. Перевірте CORS налаштування на backend

### Admin не завантажується?
1. Перевірте, чи dist папка містить index.html
2. Встановіть `_redirects` або `netlify.toml` для SPA маршрутизації

---

## 📦 Коли змінюєте код

```bash
# Landing: просто закомітьте зміни, Netlify автоматично розгорне
git add landing/
git commit -m "Update landing"
git push

# App / Admin: аналогічно
git add app/
git commit -m "Update app"
git push
```

Netlify автоматично перебудує и розгорне при кожному push до main гілки.

---

## 🎯 Далі

- Налаштуйте HTTPS (автоматично на Netlify)
- Налаштуйте custom domain
- Встановіть email notifications для помилок
- Налаштуйте webhook для notifications у Slack

**Happy deploying! 🚀**
