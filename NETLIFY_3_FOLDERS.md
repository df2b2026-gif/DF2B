# DF2B - Три папки для Netlify

## 📁 Структура для загрузки

У вас є **3 независимих папки**, кожна з яких розгортається на **окремому домене**:

```
DF2B_лэндос/
│
├─ 1️⃣ landing/          → www.df2b.com (лендінг + встановлення)
│  └─ netlify.toml
│
├─ 2️⃣ app/              → app.df2b.com (користувацький додаток)
│  ├─ package.json
│  ├─ netlify.toml
│  └─ src/
│
├─ 3️⃣ admin/            → admin.df2b.com (адмін панель)
│  ├─ package.json
│  ├─ netlify.toml
│  └─ src/
│
└─ backend/             → api.df2b.com (Express сервер - окремо)
```

---

## 🚀 Що потрібно робити

### 1. Landing / Сайт презентації
- **Адреса**: `www.df2b.com`
- **Зміст**: Лендінг сторінка з інформацією про додаток + кнопка встановлення
- **Файли**: `/landing/index.html` (статичний HTML з Tailwind CDN)
- **Deploy на Netlify**: Просто завантажити папку `landing/`

### 2. App / Користувацький додаток
- **Адреса**: `app.df2b.com`
- **Зміст**: PWA для користувачів (дихальні вправи, чат з ІІ, аудіо кімната, трекер здоров'я)
- **Стек**: React + Vite + TypeScript + Tailwind
- **Features**: 
  - Авторизація через Supabase
  - Синхронізація з Google Fit / Apple Health
  - Push повідомлення
  - Offline режим через Service Worker
  - Дозволи на: камеру, мікрофон, вібрацію, push, звук
- **Deploy на Netlify**: `npm run build` → завантажити `dist/`

### 3. Admin / Адміністраторська панель
- **Адреса**: `admin.df2b.com`
- **Зміст**: Управління системою
- **Функціонал**:
  - 📊 Статистика по клієнтам
  - 👥 Управління користувачами
  - 🎯 Редагування промтів ІІ для кожного типу (військове, цивільне, дітей, підлітків, пенсіонерів)
  - 🎵 Управління аудіотреками (додавання/видалення звуків)
  - 🔐 Логін адміністратора (окремий від користувачів)
- **Deploy на Netlify**: `npm run build` → завантажити `dist/`

---

## 📋 Кроки для розгортання

### ШАГ 1: Підготовка папок
```bash
# App
cd app
npm install
npm run build

# Admin  
cd ../admin
npm install
npm run build
```

### ШАГ 2: Netlify Setup

Для кожної папки створіть **новий сайт** на Netlify:

| Папка    | Domain        | Build Cmd | Publish Dir |
|----------|---------------|-----------|-------------|
| landing  | df2b.com      | (немає)   | .           |
| app      | app.df2b.com  | `npm run build` | dist |
| admin    | admin.df2b.com| `npm run build` | dist |

### ШАГ 3: DNS записи

На реєстрі вашого домену:
```
df2b.com          →  Netlify (landing)
www.df2b.com      →  Netlify (landing)
app.df2b.com      →  Netlify (app)
admin.df2b.com    →  Netlify (admin)
api.df2b.com      →  ваш backend сервер
```

### ШАГ 4: Environment Variables

На Netlify для **app** и **admin**:
```
VITE_API_URL = https://api.df2b.com
VITE_FCM_VAPID_KEY = <ваш FCM ключ>
```

---

## 💾 Що вже готово

✅ **Landing** - статичний HTML з дизайном  
✅ **App** - React PWA з усіма фічами  
✅ **Admin** - React панель з управлінням

❌ **Backend API** - потрібно розгорнути окремо (Node/Express + Supabase)

---

## 🔧 За матеріалами

- Landing: готовий HTML + Tailwind CDN
- App: React Vite з усіма компонентами
- Admin: React Vite з 5 сторінками (login, dashboard, clients, prompts, audio)
- netlify.toml: готові конфіги для кожного

Все що потрібно - просто завантажити 3 папки на Netlify!

**Детальні інструкції**: див. `NETLIFY_DEPLOYMENT.md`
