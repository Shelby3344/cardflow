#!/bin/bash

# ============================================
# Script de Correção - CardFlow VPS
# Resolve problemas de permissão e configuração
# ============================================

echo "🔧 Corrigindo problemas do CardFlow..."
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Criar diretórios necessários no backend
echo -e "${GREEN}[1/5]${NC} Criando diretórios necessários..."
mkdir -p backend/storage/logs
mkdir -p backend/storage/framework/cache
mkdir -p backend/storage/framework/sessions
mkdir -p backend/storage/framework/views
mkdir -p backend/storage/app/public
mkdir -p backend/bootstrap/cache

echo "✓ Diretórios criados!"

# 2. Dar permissões corretas
echo -e "${GREEN}[2/5]${NC} Configurando permissões..."
sudo chown -R $USER:$USER backend/storage
sudo chown -R $USER:$USER backend/bootstrap/cache
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache

echo "✓ Permissões configuradas!"

# 3. Adicionar variáveis faltantes no .env
echo -e "${GREEN}[3/5]${NC} Adicionando variáveis de ambiente faltantes..."

# Verificar se as variáveis já existem, se não, adicionar
if ! grep -q "STRIPE_KEY" backend/.env; then
    echo "" >> backend/.env
    echo "# Stripe (opcional)" >> backend/.env
    echo "STRIPE_KEY=" >> backend/.env
    echo "STRIPE_SECRET=" >> backend/.env
fi

if ! grep -q "ELEVENLABS_API_KEY" voice-ia-service/.env 2>/dev/null; then
    echo "" >> voice-ia-service/.env
    echo "ELEVENLABS_API_KEY=" >> voice-ia-service/.env
fi

# Adicionar no .env raiz também
if [ -f ".env" ]; then
    if ! grep -q "STRIPE_KEY" .env; then
        echo "" >> .env
        echo "STRIPE_KEY=" >> .env
        echo "STRIPE_SECRET=" >> .env
        echo "ELEVENLABS_API_KEY=" >> .env
    fi
fi

echo "✓ Variáveis adicionadas!"

# 4. Reiniciar containers
echo -e "${GREEN}[4/5]${NC} Reiniciando containers..."
docker-compose down
docker-compose up -d

echo "⏳ Aguardando containers iniciarem (20 segundos)..."
sleep 20

# 5. Configurar Laravel novamente
echo -e "${GREEN}[5/5]${NC} Configurando Laravel..."

# Dar permissões dentro do container
echo "Configurando permissões dentro do container..."
docker-compose exec -T backend chown -R www-data:www-data /var/www/storage
docker-compose exec -T backend chown -R www-data:www-data /var/www/bootstrap/cache
docker-compose exec -T backend chmod -R 775 /var/www/storage
docker-compose exec -T backend chmod -R 775 /var/www/bootstrap/cache

# Gerar chave
echo "Gerando APP_KEY..."
docker-compose exec -T backend php artisan key:generate --force

# Executar migrations
echo "Executando migrations..."
docker-compose exec -T backend php artisan migrate --force

# Limpar cache
echo "Limpando cache..."
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear

echo ""
echo "================================================"
echo -e "${GREEN}✓ Problemas corrigidos com sucesso!${NC}"
echo "================================================"
echo ""
echo "Status dos containers:"
docker-compose ps
echo ""
echo "Para verificar se está tudo OK:"
echo "  docker-compose logs -f backend"
echo ""
