#!/bin/bash

# ==============================================
# Script de Instalação CardFlow VPS
# ==============================================

set -e

echo "🚀 Instalando CardFlow na VPS..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Atualizar sistema
echo -e "${GREEN}[1/8]${NC} Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 2. Instalar Docker
echo -e "${GREEN}[2/8]${NC} Instalando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✓ Docker instalado com sucesso!"
else
    echo "✓ Docker já está instalado"
fi

# 3. Instalar Docker Compose
echo -e "${GREEN}[3/8]${NC} Instalando Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✓ Docker Compose instalado com sucesso!"
else
    echo "✓ Docker Compose já está instalado"
fi

# 4. Verificar instalações
echo ""
echo "Versões instaladas:"
docker --version
docker-compose --version
echo ""

# 5. Clonar repositório (se não existir)
echo -e "${GREEN}[4/8]${NC} Clonando repositório..."
if [ ! -d "cardflow" ]; then
    git clone https://github.com/Shelby3344/cardflow.git
    cd cardflow
    echo "✓ Repositório clonado!"
else
    cd cardflow
    git pull origin main
    echo "✓ Repositório atualizado!"
fi

# 6. Pegar IP do servidor
SERVER_IP=$(curl -s ifconfig.me)
echo ""
echo "IP do servidor: ${SERVER_IP}"
echo ""

# 7. Configurar .env
echo -e "${GREEN}[5/8]${NC} Configurando variáveis de ambiente..."

# Backend .env
cat > backend/.env << EOF
APP_NAME=CardFlow
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://${SERVER_IP}

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=cardflow
DB_USERNAME=cardflow
DB_PASSWORD=CardFlow2025@Secure!

REDIS_HOST=redis
REDIS_PASSWORD=
REDIS_PORT=6379

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

FRONTEND_URL=http://${SERVER_IP}:3000
SANCTUM_STATEFUL_DOMAINS=${SERVER_IP},${SERVER_IP}:3000

# Opcional - Configure depois
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
EOF

# Voice IA .env
cat > voice-ia-service/.env << EOF
PORT=3001
NODE_ENV=production

# Configure suas chaves
OPENAI_API_KEY=
ELEVENLABS_API_KEY=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
EOF

# Root .env
cat > .env << EOF
# PostgreSQL
DB_PASSWORD=CardFlow2025@Secure!

# Redis
REDIS_PASSWORD=

# Laravel
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://${SERVER_IP}

# Frontend
NEXT_PUBLIC_API_URL=http://${SERVER_IP}/api
NEXT_PUBLIC_VOICE_API_URL=http://${SERVER_IP}:3001

# OpenAI (opcional)
OPENAI_API_KEY=
EOF

echo "✓ Arquivos .env criados!"

# 8. Iniciar Docker
echo -e "${GREEN}[6/8]${NC} Iniciando containers Docker..."
docker-compose up -d

echo "⏳ Aguardando containers iniciarem (30 segundos)..."
sleep 30

# 9. Configurar Laravel
echo -e "${GREEN}[7/8]${NC} Configurando Laravel..."

echo "Gerando APP_KEY..."
docker-compose exec -T backend php artisan key:generate --force

echo "Executando migrations..."
docker-compose exec -T backend php artisan migrate --force

echo "Limpando cache..."
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear

echo "Configurando permissões..."
docker-compose exec -T backend chmod -R 775 storage bootstrap/cache

# 10. Verificar status
echo -e "${GREEN}[8/8]${NC} Verificando status dos containers..."
echo ""
docker-compose ps
echo ""

# Finalização
echo ""
echo "================================================"
echo -e "${GREEN}✓ Instalação concluída com sucesso!${NC}"
echo "================================================"
echo ""
echo "📍 Acessos:"
echo "   Frontend:    http://${SERVER_IP}:3000"
echo "   Backend API: http://${SERVER_IP}/api"
echo "   API Docs:    http://${SERVER_IP}/api/documentation"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure suas chaves de API em backend/.env:"
echo "      - OPENAI_API_KEY"
echo "      - AWS_ACCESS_KEY_ID"
echo "      - AWS_SECRET_ACCESS_KEY"
echo ""
echo "   2. Reinicie os containers após configurar:"
echo "      docker-compose restart"
echo ""
echo "   3. Para ver logs:"
echo "      docker-compose logs -f"
echo ""
echo "   4. Para parar:"
echo "      docker-compose down"
echo ""
echo "📚 Documentação completa: GUIA_INSTALACAO_VPS.md"
echo ""
echo "🎉 Bom uso do CardFlow!"
echo ""
