#!/bin/bash

# ========================================
# Script de Deploy - CardFlow EC2
# ========================================

set -e  # Para o script se houver erro

echo "=========================================="
echo "🚀 Iniciando Deploy CardFlow"
echo "=========================================="
echo ""

# Detectar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo "⚠️  Não estamos em um repositório Git."
    echo "📁 Tentando navegar para /home/ubuntu/cardflow..."
    
    if [ -d "/home/ubuntu/cardflow" ]; then
        cd /home/ubuntu/cardflow
        echo "✅ Diretório encontrado!"
    else
        echo "❌ Erro: Diretório /home/ubuntu/cardflow não encontrado!"
        echo ""
        echo "💡 Você precisa clonar o repositório primeiro:"
        echo "   cd /home/ubuntu"
        echo "   git clone https://github.com/Shelby3344/cardflow.git"
        echo "   cd cardflow"
        echo "   ./deploy-ec2.sh"
        exit 1
    fi
else
    echo "✅ Já estamos no diretório do projeto"
fi

# Confirmar diretório atual
echo "📍 Diretório atual: $(pwd)"
echo ""

# ========================================
# 1. Atualizar código do repositório
# ========================================
echo "📥 Atualizando código do repositório..."
git pull origin main

# ========================================
# 2. Configurar arquivo .env da raiz
# ========================================
echo ""
echo "⚙️  Configurando variáveis de ambiente (.env raiz)..."
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

# ========================================
# 3. Configurar arquivo .env do backend
# ========================================
echo ""
echo "⚙️  Configurando variáveis de ambiente (backend/.env)..."
cat > backend/.env << 'EOF'
APP_NAME=CardFlow
APP_ENV=production
APP_KEY=base64:2an3CXpGjJTYXkydboa4OB6LYtW6aq4B5f489x5DN1E=
APP_DEBUG=false
APP_TIMEZONE=America/Sao_Paulo
APP_URL=http://18.217.114.196
APP_LOCALE=pt_BR
APP_FALLBACK_LOCALE=pt_BR
APP_FAKER_LOCALE=pt_BR

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=cardflow
DB_USERNAME=cardflow
DB_PASSWORD=CardFlow2025Secure

SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis

CACHE_STORE=redis
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

FRONTEND_URL=http://18.217.114.196:3000
SANCTUM_STATEFUL_DOMAINS=18.217.114.196,18.217.114.196:3000

VOICE_IA_URL=http://voice-ia:3001

STRIPE_KEY=
STRIPE_SECRET=

ELEVENLABS_API_KEY=
OPENAI_API_KEY=
EOF

# ========================================
# 4. Configurar arquivo .env do frontend
# ========================================
echo ""
echo "⚙️  Configurando variáveis de ambiente (frontend/.env)..."
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

# ========================================
# 5. Configurar arquivo .env do voice-ia
# ========================================
echo ""
echo "⚙️  Configurando variáveis de ambiente (voice-ia-service/.env)..."
cat > voice-ia-service/.env << 'EOF'
NODE_ENV=production
PORT=3001

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenAI
OPENAI_API_KEY=

# ElevenLabs
ELEVENLABS_API_KEY=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET=
EOF

# ========================================
# 6. Criar diretórios necessários
# ========================================
echo ""
echo "📁 Criando diretórios necessários..."
mkdir -p backend/storage/logs
mkdir -p backend/storage/framework/sessions
mkdir -p backend/storage/framework/views
mkdir -p backend/storage/framework/cache
mkdir -p backend/storage/app/public
mkdir -p backend/bootstrap/cache

# Configurar permissões
chmod -R 777 backend/storage
chmod -R 777 backend/bootstrap/cache

# ========================================
# 7. Parar containers antigos
# ========================================
echo ""
echo "🛑 Parando containers antigos..."
docker-compose down

# ========================================
# 8. Limpar volumes (opcional - apenas se necessário)
# ========================================
read -p "Deseja limpar os volumes do banco de dados? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "🗑️  Removendo volumes..."
    docker-compose down -v
    echo "⚠️  ATENÇÃO: Todos os dados do banco serão perdidos!"
fi

# ========================================
# 9. Construir e iniciar containers
# ========================================
echo ""
echo "🔨 Construindo containers..."
docker-compose build --no-cache

echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d

# ========================================
# 10. Aguardar containers iniciarem
# ========================================
echo ""
echo "⏳ Aguardando containers iniciarem..."
sleep 15

# ========================================
# 11. Verificar status dos containers
# ========================================
echo ""
echo "📊 Status dos containers:"
docker-compose ps

# ========================================
# 12. Executar migrations
# ========================================
echo ""
echo "🗄️  Executando migrations do banco de dados..."
docker-compose exec -T backend php artisan migrate --force

# ========================================
# 13. Limpar cache do Laravel
# ========================================
echo ""
echo "🧹 Limpando cache do Laravel..."
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear
docker-compose exec -T backend php artisan route:clear
docker-compose exec -T backend php artisan view:clear

# ========================================
# 14. Verificar logs
# ========================================
echo ""
echo "📋 Últimas linhas dos logs:"
echo "--- Backend ---"
docker-compose logs --tail=20 backend
echo ""
echo "--- Frontend ---"
docker-compose logs --tail=20 frontend

# ========================================
# 15. Teste de conectividade
# ========================================
echo ""
echo "🧪 Testando conectividade..."
echo ""
echo "Backend:"
curl -I http://localhost/api/health || echo "⚠️  Backend não respondeu"
echo ""
echo "Frontend:"
curl -I http://localhost:3000 || echo "⚠️  Frontend não respondeu"
echo ""
echo "Voice IA:"
curl -I http://localhost/voice-api/health || echo "⚠️  Voice IA não respondeu"

# ========================================
# 16. Resumo final
# ========================================
echo ""
echo "=========================================="
echo "✅ Deploy concluído!"
echo "=========================================="
echo ""
echo "🌐 URLs de acesso:"
echo "   Frontend: http://18.217.114.196:3000"
echo "   Backend API: http://18.217.114.196/api"
echo "   Voice IA API: http://18.217.114.196/voice-api"
echo "   API Docs: http://18.217.114.196/api/documentation"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs: docker-compose logs -f [service]"
echo "   Reiniciar: docker-compose restart [service]"
echo "   Parar tudo: docker-compose down"
echo "   Status: docker-compose ps"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Testar registro em: http://18.217.114.196:3000/register"
echo "   2. Criar primeiro usuário admin"
echo "   3. Configurar SSL/HTTPS (opcional)"
echo "   4. Configurar chaves API (OpenAI, AWS, Stripe) se necessário"
echo ""
