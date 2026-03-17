#!/bin/bash
# 🚀 Скрипт быстрого развертывания DF2B на Supabase Edge Functions

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 DF2B - Supabase Edge Functions Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

# Проверка зависимостей
echo -e "${YELLOW}📋 Проверка зависимостей...${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm не установлен. Установите Node.js${NC}"
    exit 1
fi

if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI не установлен. Устанавливаю...${NC}"
    npm install -g supabase
fi

echo -e "${GREEN}✅ Все зависимости установлены${NC}\n"

# Переменные
SUPABASE_PROJECT_ID="sbp_3a0c44e57607db0708bc2d822c574923e6a39430"
SUPABASE_URL="https://sbp-3a0c44e57607db0708bc2d822c574923e6a39430.supabase.co"
GEMINI_API_KEY="AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc"

# Шаг 1: Инициализировать Supabase
echo -e "${BLUE}📦 Шаг 1: Инициализация Supabase проекта...${NC}"
supabase init

# Шаг 2: Создать структуру функции
echo -e "${BLUE}📦 Шаг 2: Создание структуры Edge Function...${NC}"
if [ ! -d "supabase/functions/chat-with-gemini" ]; then
    supabase functions new chat-with-gemini
    echo -e "${GREEN}✅ Структура создана${NC}"
else
    echo -e "${YELLOW}⚠️  Функция уже существует${NC}"
fi

# Шаг 3: Скопировать код функции
echo -e "${BLUE}📦 Шаг 3: Копирование кода Edge Function...${NC}"
if [ -f "backend/supabase-edge-function-chat.ts" ]; then
    cp backend/supabase-edge-function-chat.ts supabase/functions/chat-with-gemini/index.ts
    echo -e "${GREEN}✅ Код скопирован${NC}"
else
    echo -e "${RED}❌ Файл backend/supabase-edge-function-chat.ts не найден${NC}"
    exit 1
fi

# Шаг 4: Развернуть функцию
echo -e "${BLUE}📦 Шаг 4: Развертывание Edge Function...${NC}"
supabase functions deploy chat-with-gemini --project-id $SUPABASE_PROJECT_ID

# Шаг 5: Установить переменные окружения
echo -e "${BLUE}📦 Шаг 5: Установка переменных окружения...${NC}"
supabase secrets set GEMINI_API_KEY=$GEMINI_API_KEY --project-id $SUPABASE_PROJECT_ID

echo -e "${GREEN}✅ Переменные установлены${NC}"

# Шаг 6: Пересобрать приложения
echo -e "${BLUE}📦 Шаг 6: Пересборка приложений...${NC}"

cd app
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ App собран успешно${NC}"
else
    echo -e "${RED}❌ Ошибка при сборке app${NC}"
    exit 1
fi
cd ..

cd admin || exit
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Admin собран успешно${NC}"
else
    echo -e "${RED}❌ Ошибка при сборке admin${NC}"
    exit 1
fi
cd ..

# Финальная информация
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Развертывание завершено!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📱 Ссылки:${NC}"
echo -e "  🔗 App: https://df2b-app.netlify.app"
echo -e "  🔗 Landing: https://df2b-wellcome.netlify.app"
echo -e "  🔗 Admin: https://df2b-admin.netlify.app"

echo -e "\n${YELLOW}🔑 Переменные Netlify (установите в Dashboard):${NC}"
echo -e "  VITE_SUPABASE_URL=$SUPABASE_URL"
echo -e "  VITE_SUPABASE_ANON_KEY=sbp_3a0c44e57607db0708bc2d822c574923e6a39430"
echo -e "  VITE_GEMINI_API_KEY=$GEMINI_API_KEY"

echo -e "\n${YELLOW}📖 Следующие шаги:${NC}"
echo -e "  1. Откройте Netlify Dashboard"
echo -e "  2. Для каждого сайта: Settings → Build & Deploy → Environment"
echo -e "  3. Добавьте переменные выше"
echo -e "  4. Нажмите 'Trigger deploy' на каждом сайте"
echo -e "  5. Протестируйте приложение\n"

echo -e "${YELLOW}🧪 Тест Edge Function:${NC}"
echo -e "  supabase functions invoke chat-with-gemini --project-id $SUPABASE_PROJECT_ID"

echo -e "\n${GREEN}✨ Готово к боевому использованию!${NC}\n"
