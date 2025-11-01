#!/bin/bash

# ========================================
# Script de Deploy Rápido - CardFlow EC2
# (Sem reconstruir tudo do zero)
# ========================================

set -e

echo "=========================================="
echo "⚡ Deploy Rápido CardFlow"
echo "=========================================="

cd /home/ubuntu/cardflow

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Reiniciar apenas os serviços necessários
echo ""
echo "🔄 Reiniciando serviços..."
docker-compose up -d --build

# Aguardar
echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Limpar cache Laravel
echo ""
echo "🧹 Limpando cache..."
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear

# Status
echo ""
echo "📊 Status:"
docker-compose ps

echo ""
echo "✅ Deploy rápido concluído!"
echo "🌐 Acesse: http://18.217.114.196:3000"
