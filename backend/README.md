# DF2B Backend

Backend API for DF2B (Don't Forget 2 Breathe) mental health application.

## Features

- **AI Chat** - Integration with Google Gemini API for profile-specific psychological support
- **User Authentication** - Supabase Auth with Google OAuth
- **Database** - Supabase PostgreSQL with realtime messaging
- **Mood Analysis** - AI-powered analysis of user's mood history
- **Quick Responses** - Context-aware quick replies for different user profiles

## User Profiles

1. **military** - For military personnel and veterans
2. **elderly** - For senior citizens
3. **children** - For children and parents
4. **teenager** - For teenagers
5. **civilian** - For civilian adults

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your API keys to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get Gemini API key from: https://makersuite.google.com/app/apikey

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL from `schema.sql` in the SQL editor
   - Configure Google OAuth in Authentication > Providers

5. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /api/auth/google
Initiate Google OAuth login.

**Request:**
```json
{
  "redirectTo": "http://localhost:5173"
}
```

#### POST /api/auth/logout
Logout current user.

### Chat

#### POST /api/chat
Send a message to the AI psychologist. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "message": "Я дуже тривожусь",
  "profile": "civilian",
  "history": [
    {"sender": "user", "text": "Привіт"},
    {"sender": "ai", "text": "Привіт! Як справи?"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "response": "Чую тебе. Тривога - це нормальна реакція...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### GET /api/messages
Get user's chat history. Requires authentication.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "message": "Hello",
      "sender": "user",
      "profile": "civilian",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Other

#### POST /api/quick-response
Get a quick AI response for a specific context.

**Request:**
```json
{
  "profile": "military",
  "context": "Мені сняться кошмари"
}
```

#### POST /api/analyze-mood
Analyze mood history and get recommendations.

**Request:**
```json
{
  "entries": [
    {"date": "2024-01-01", "mood": 3},
    {"date": "2024-01-02", "mood": 2},
    {"date": "2024-01-03", "mood": 4}
  ]
}
```

### GET /api/health
Health check endpoint.

### GET /api/profiles
Get list of available profiles.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Server port (default: 3001) | No |

## Deployment

For production deployment, make sure to:
1. Set up environment variables
2. Use a process manager like PM2
3. Set up CORS for your frontend domain
4. Consider adding rate limiting
