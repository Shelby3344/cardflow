#!/bin/bash

# ========================================
# Script de Correção do Redis
# ========================================

set -e

echo "=========================================="
echo "🔴 Corrigindo Redis"
echo "=========================================="
echo ""

cd /home/ubuntu/cardflow 2>/dev/null || cd ~/cardflow

# Parar containers
echo "🛑 Parando containers..."
docker-compose down

# Remover container e volume do Redis
echo "🗑️  Removendo container e volume do Redis..."
docker rm -f cardflow-redis 2>/dev/null || true
docker volume rm cardflow_redis_data 2>/dev/null || true

# Atualizar docker-compose.yml (remover requirepass)
echo "📝 Atualizando configuração..."
if grep -q "requirepass" docker-compose.yml; then
    echo "   Removendo --requirepass da configuração do Redis..."
    sed -i 's/redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-}/redis-server --appendonly yes/g' docker-compose.yml
fi

# Limpar configurações de senha do Redis nos .env
echo "🧹 Limpando configurações de senha..."
sed -i 's/REDIS_PASSWORD=.*/REDIS_PASSWORD=/g' .env 2>/dev/null || true
sed -i 's/REDIS_PASSWORD=.*/REDIS_PASSWORD=null/g' backend/.env 2>/dev/null || true

# Reiniciar tudo
echo ""
echo "🚀 Reiniciando containers..."
docker-compose up -d

echo ""
echo "⏳ Aguardando containers iniciarem..."
sleep 10

echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "=========================================="
echo "✅ Correção concluída!"
echo "=========================================="
echo ""

# Verificar se Redis está funcionando
if docker-compose ps | grep -q "cardflow-redis.*Up"; then
    echo "✅ Redis está rodando!"
    echo ""
    echo "🧪 Testando Redis..."
    docker-compose exec -T redis redis-cli ping
    echo ""
else
    echo "❌ Redis ainda com problemas. Logs:"
    docker-compose logs --tail=20 redis
fi
