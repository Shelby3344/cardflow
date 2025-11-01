#!/bin/bash

# Fix NextAuth configuration
echo "=================================="
echo "Configurando NextAuth"
echo "=================================="

cd /home/ubuntu/cardflow

# Criar arquivo .env do frontend se não existir
if [ ! -f "frontend/.env" ]; then
    echo "Criando frontend/.env..."
    cat > frontend/.env << 'EOF'
# NextAuth Configuration
NEXTAUTH_URL=http://18.217.114.196:3000
NEXTAUTH_SECRET=CHUZD6LIhNGi9WB3eOYJjdRo8lsMv7nm

# API URLs
NEXT_PUBLIC_API_URL=http://18.217.114.196/api
NEXT_PUBLIC_VOICE_API_URL=http://18.217.114.196/voice-api

# OAuth Providers (opcional - deixar vazio se não usar)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
EOF
fi

# Criar arquivo .env da raiz se não existir
if [ ! -f ".env" ]; then
    echo "Criando .env da raiz..."
    cat > .env << 'EOF'
# Application Environment
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:2an3CXpGjJTYXkydboa4OB6LYtW6aq4B5f489x5DN1E=
APP_URL=http://18.217.114.196

# Database
DB_PASSWORD=CardFlow2025Secure

# Redis
REDIS_PASSWORD=

# Frontend URLs
FRONTEND_URL=http://18.217.114.196:3000
SANCTUM_STATEFUL_DOMAINS=18.217.114.196,18.217.114.196:3000

# NextAuth Configuration
NEXTAUTH_URL=http://18.217.114.196:3000
NEXTAUTH_SECRET=CHUZD6LIhNGi9WB3eOYJjdRo8lsMv7nm

# Public API URLs (for frontend)
NEXT_PUBLIC_API_URL=http://18.217.114.196/api
NEXT_PUBLIC_VOICE_API_URL=http://18.217.114.196/voice-api

# Optional Services
STRIPE_KEY=
STRIPE_SECRET=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
EOF
fi

echo ""
echo "Reconstruindo container frontend..."
docker-compose up -d --build frontend

echo ""
echo "=================================="
echo "✅ NextAuth configurado!"
echo "=================================="
echo ""
echo "Aguarde 30 segundos para o frontend reiniciar"
echo "Depois teste novamente em: http://18.217.114.196:3000/register"
