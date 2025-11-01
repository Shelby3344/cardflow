#!/bin/bash

# ========================================
# Script de Correção - Backend API
# Corrige redirecionamento e CORS
# ========================================

set -e

echo "=========================================="
echo "🔧 Corrigindo Backend API"
echo "=========================================="
echo ""

cd /home/ubuntu/cardflow

# 1. Verificar APP_URL
echo "📝 Verificando APP_URL..."
if grep -q "APP_URL=http://localhost" backend/.env; then
    echo "   ⚠️  APP_URL está como localhost, corrigindo..."
    sed -i 's|APP_URL=http://localhost|APP_URL=http://18.217.114.196|g' backend/.env
    echo "   ✅ APP_URL corrigido"
fi

# 2. Verificar FRONTEND_URL
echo "📝 Verificando FRONTEND_URL..."
if grep -q "FRONTEND_URL=http://localhost" backend/.env; then
    echo "   ⚠️  FRONTEND_URL está como localhost, corrigindo..."
    sed -i 's|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=http://18.217.114.196:3000|g' backend/.env
    echo "   ✅ FRONTEND_URL corrigido"
fi

# 3. Limpar cache do Laravel
echo ""
echo "🧹 Limpando cache do Laravel..."
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear
docker-compose exec -T backend php artisan route:clear

# 4. Reiniciar backend
echo ""
echo "🔄 Reiniciando backend..."
docker-compose restart backend

# Aguardar
echo "⏳ Aguardando backend reiniciar..."
sleep 5

# 5. Testar
echo ""
echo "🧪 Testando API..."
echo "----------------------------------------"

echo -n "POST /api/login: "
RESPONSE=$(curl -s -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@test.com","password":"123"}' | head -c 100)

if echo "$RESPONSE" | grep -q "validation\|errors\|email"; then
    echo "✅ API respondendo corretamente"
else
    echo "❌ Ainda com problemas"
    echo "Resposta: $RESPONSE"
fi

echo ""
echo -n "POST /api/register: "
RESPONSE=$(curl -s -X POST http://localhost/api/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123"}' | head -c 100)

if echo "$RESPONSE" | grep -q "validation\|errors\|password"; then
    echo "✅ API respondendo corretamente"
else
    echo "❌ Ainda com problemas"
    echo "Resposta: $RESPONSE"
fi

echo ""
echo "=========================================="
echo "✅ Correção concluída!"
echo "=========================================="
echo ""
echo "📋 Próximos passos:"
echo "   1. Teste no navegador: http://18.217.114.196:3000"
echo "   2. Tente fazer registro de usuário"
echo ""
echo "💡 Se ainda tiver problemas, verifique logs:"
echo "   docker-compose logs -f backend"
echo ""
