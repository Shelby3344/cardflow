#!/bin/bash

# ============================================
# CardFlow - Script de Inicialização Docker
# ============================================

set -e

echo "🚀 Iniciando CardFlow com Docker Compose..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não está instalado. Por favor, instale o Docker primeiro.${NC}"
    exit 1
fi

# Verificar se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro.${NC}"
    exit 1
fi

# Verificar se o arquivo .env.docker existe
if [ ! -f .env.docker ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.docker não encontrado. Criando a partir do exemplo...${NC}"
    cp .env.docker.example .env.docker
    echo -e "${YELLOW}⚠️  Por favor, edite o arquivo .env.docker com suas configurações antes de continuar.${NC}"
    echo -e "${YELLOW}⚠️  Especialmente: APP_KEY, OPENAI_API_KEY, ELEVENLABS_API_KEY, STRIPE_KEY/SECRET${NC}"
    exit 1
fi

# Carregar variáveis de ambiente
export $(grep -v '^#' .env.docker | xargs)

# Verificar se APP_KEY está configurada
if [ -z "$APP_KEY" ] || [ "$APP_KEY" == "base64:GERE_UMA_CHAVE_COM_php_artisan_key:generate" ]; then
    echo -e "${RED}❌ APP_KEY não está configurada. Gerando uma nova chave...${NC}"
    
    # Gerar APP_KEY temporariamente
    echo -e "${BLUE}📝 Construindo imagem do backend para gerar a chave...${NC}"
    docker-compose build backend
    
    echo -e "${BLUE}🔑 Gerando APP_KEY...${NC}"
    APP_KEY=$(docker-compose run --rm backend php artisan key:generate --show)
    
    # Atualizar .env.docker com a nova chave
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|APP_KEY=.*|APP_KEY=$APP_KEY|" .env.docker
    else
        # Linux
        sed -i "s|APP_KEY=.*|APP_KEY=$APP_KEY|" .env.docker
    fi
    
    echo -e "${GREEN}✅ APP_KEY gerada e salva em .env.docker${NC}"
    
    # Recarregar variáveis
    export $(grep -v '^#' .env.docker | xargs)
fi

# Parar containers existentes
echo -e "${BLUE}🛑 Parando containers existentes...${NC}"
docker-compose down

# Construir imagens
echo -e "${BLUE}🏗️  Construindo imagens Docker...${NC}"
docker-compose build

# Iniciar serviços
echo -e "${BLUE}🚀 Iniciando serviços...${NC}"
docker-compose up -d postgres redis

# Aguardar serviços estarem prontos
echo -e "${BLUE}⏳ Aguardando PostgreSQL e Redis estarem prontos...${NC}"
sleep 10

# Executar migrações
echo -e "${BLUE}📊 Executando migrações do banco de dados...${NC}"
docker-compose run --rm backend php artisan migrate --force

# Executar seeders (opcional)
echo -e "${BLUE}🌱 Executando seeders (se houver)...${NC}"
docker-compose run --rm backend php artisan db:seed --force || true

# Limpar e otimizar cache
echo -e "${BLUE}🧹 Otimizando aplicação...${NC}"
docker-compose run --rm backend php artisan config:cache
docker-compose run --rm backend php artisan route:cache
docker-compose run --rm backend php artisan view:cache

# Iniciar todos os serviços
echo -e "${BLUE}🚀 Iniciando todos os serviços...${NC}"
docker-compose up -d

# Aguardar serviços estarem prontos
echo -e "${BLUE}⏳ Aguardando todos os serviços estarem prontos...${NC}"
sleep 15

# Verificar status dos containers
echo -e "\n${GREEN}✅ Status dos containers:${NC}"
docker-compose ps

echo -e "\n${GREEN}🎉 CardFlow iniciado com sucesso!${NC}"
echo -e "\n${BLUE}📍 URLs de acesso:${NC}"
echo -e "   🌐 Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   🔧 Backend API: ${GREEN}http://localhost/api${NC}"
echo -e "   🎙️  Voice IA: ${GREEN}http://localhost/voice-api${NC}"
echo -e "   📊 API Docs: ${GREEN}http://localhost/api/documentation${NC}"
echo -e "\n${YELLOW}📋 Comandos úteis:${NC}"
echo -e "   Ver logs: ${BLUE}docker-compose logs -f [service]${NC}"
echo -e "   Parar: ${BLUE}docker-compose down${NC}"
echo -e "   Reiniciar: ${BLUE}docker-compose restart [service]${NC}"
echo -e "   Executar comando: ${BLUE}docker-compose exec [service] [command]${NC}"
echo -e "\n${YELLOW}🔍 Para ver logs em tempo real:${NC}"
echo -e "   ${BLUE}docker-compose logs -f${NC}"
