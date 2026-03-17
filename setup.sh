#!/bin/bash

# DF2B v2.0 Quick Setup Script

set -e

echo "🚀 DF2B Development Setup"
echo "========================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend Setup
echo -e "\n${BLUE}1. Setting up Backend...${NC}"
cd DF2B_лэндос/backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cat > .env << EOF
GEMINI_API_KEY=AIzaSyBmw9rA8ffDYmltER_3tGvbSG6wVXBSilc
SUPABASE_URL=https://vqczqpigprsrnfsdmlti.supabase.co
SUPABASE_ANON_KEY=sbp_3a0c44e57607db0708bc2d822c574923e6a39430
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxY3pxcGlncHJzcm5mc2RtbHRpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMDY0MTYwMCwiZXhwIjoyMDI2MjYxNjAwfQ.K4B2xZ9fK8vL2pQ6tR3uN5wX7yZ1aB4cD6eF8gH0iJ2
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,https://localhost:5174
JWT_SECRET=df2b-secret-key-2024-change-in-production
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

cd ../../

# Frontend Setup
echo -e "\n${BLUE}2. Setting up Frontend...${NC}"
cd DF2B_лэндос/app
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Check for .env.local file
if [ ! -f .env.local ]; then
    echo -e "${BLUE}Creating .env.local file...${NC}"
    cat > .env.local << EOF
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://vqczqpigprsrnfsdmlti.supabase.co
VITE_SUPABASE_ANON_KEY=sbp_3a0c44e57607db0708bc2d822c574923e6a39430
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EOF
    echo -e "${GREEN}✓ .env.local file created${NC}"
    echo -e "${BLUE}⚠️  IMPORTANT: Update VITE_GOOGLE_CLIENT_ID in .env.local${NC}"
else
    echo -e "${GREEN}✓ .env.local file already exists${NC}"
fi

cd ../../

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Setup completed!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Update Google Client ID in app/.env.local:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create OAuth 2.0 credentials"
echo "   - Copy Client ID"
echo ""
echo "2. Start backend:"
echo "   cd DF2B_лэндос/backend"
echo "   npm start"
echo ""
echo "3. Start frontend (in another terminal):"
echo "   cd DF2B_лэндос/app"
echo "   npm run dev"
echo ""
echo "4. Open http://localhost:5173 in your browser"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "   - See DEPLOYMENT.md for detailed setup"
echo "   - Backend API docs: http://localhost:3001/api/health"
echo ""
