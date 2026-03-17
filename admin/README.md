# DF2B Admin Panel

Admin панель для управління DF2B системою (ментальна підтримка 24/7).

## Функціонал

- 📊 **Статистика** - огляд активності користувачів, кількість сеансів, графіки
- 👥 **Управління клієнтами** - перегляд, пошук, управління користувачами за їхніми типами
- 🎯 **Промти ІІ** - редागування системних промтів та тону спілкування для кожного типу клієнта (військові, цивільні, діти, підлітки, пенсіонери)
- 🎵 **Аудіо треки** - управління звуковими ландшафтами (дощ, костер, природні звуки, музика, білий шум)

## Встановлення

```bash
npm install
```

## Розробка

```bash
npm run dev
```

Відкриється на `http://localhost:5174`

## Ліцензування

```bash
npm run lint
```

## Побудова для Production

```bash
npm run build
```

Буде створена папка `dist/` з готовими файлами для Netlify.

## Логін

**Demo Credentials:**
- Email: `admin@df2b.com`
- Password: `DF2B_Admin_123`

(Замініть на реальну авторизацію через `/api/admin/login`)

## API Endpoints

Admin панель взаємодіє з цими endpoints:

```
POST /api/admin/login
POST /api/admin/prompts/update
GET  /api/admin/stats
GET  /api/admin/clients
POST /api/admin/audio/upload
```

## Структура

```
src/
├── pages/
│   ├── LoginPage.tsx       # Авторизація адміністратора
│   ├── DashboardPage.tsx   # Статистика та графіки
│   ├── ClientsPage.tsx     # Управління користувачами
│   ├── PromptsPage.tsx     # Редагування промтів ІІ
│   └── AudioPage.tsx       # Управління аудіотреками
├── App.tsx                 # Головне приложение с sidebar
├── main.tsx                # Entry point
└── index.css               # Стилі
```

## Дизайн

- Tailwind CSS + DF2B теми
- Темна тема с акцентом #D4A574
- Responsive для десктоп та планшета
- Glass morphism componenti

## Deploy на Netlify

Див. [NETLIFY_DEPLOYMENT.md](../NETLIFY_DEPLOYMENT.md)
