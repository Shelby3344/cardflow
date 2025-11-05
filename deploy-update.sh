#!/bin/bash
# Script para atualizar CardFlow na VPS usando Docker
# Uso: ./deploy-update.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando atualização do CardFlow..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Fazer backup do banco de dados
echo -e "${BLUE}📦 Fazendo backup do banco de dados...${NC}"
docker-compose exec -T postgres pg_dump -U cardflow cardflow > backup_$(date +%Y%m%d_%H%M%S).sql
echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"

# 2. Parar os containers
echo -e "${BLUE}⏹️  Parando containers...${NC}"
docker-compose down

# 3. Atualizar o código (git pull ou usar código local)
echo -e "${BLUE}📥 Atualizando código...${NC}"
# Se estiver usando Git:
# git pull origin main

# 4. Rebuild das imagens Docker
echo -e "${BLUE}🔨 Reconstruindo imagens Docker...${NC}"
docker-compose build --no-cache

# 5. Subir os containers
echo -e "${BLUE}🚀 Iniciando containers...${NC}"
docker-compose up -d

# 6. Aguardar containers estarem prontos
echo -e "${BLUE}⏳ Aguardando containers iniciarem...${NC}"
sleep 10

# 7. Executar migrations
echo -e "${BLUE}🗄️  Executando migrations...${NC}"
docker-compose exec -T backend php artisan migrate --force

# 8. Limpar cache do Laravel
echo -e "${BLUE}🧹 Limpando cache...${NC}"
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear
docker-compose exec -T backend php artisan route:clear
docker-compose exec -T backend php artisan view:clear

# 9. Otimizar Laravel
echo -e "${BLUE}⚡ Otimizando aplicação...${NC}"
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache
docker-compose exec -T backend php artisan view:cache

# 10. Verificar status
echo -e "${BLUE}📊 Verificando status dos containers...${NC}"
docker-compose ps

echo -e "${GREEN}✅ Atualização concluída com sucesso!${NC}"
echo -e "${GREEN}🌐 Frontend: http://seu-dominio.com${NC}"
echo -e "${GREEN}🔧 Backend: http://seu-dominio.com/api${NC}"
