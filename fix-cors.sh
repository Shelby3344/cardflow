#!/bin/bash

# Script para corrigir CORS no CardFlow

cd /home/ubuntu/cardflow

echo "🔧 Corrigindo configuração CORS..."

# 1. Criar novo arquivo cors.php com configuração correta
cat > backend/config/cors.php << 'EOF'
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://18.217.114.196:3000',
        'http://18.217.114.196',
        'http://localhost:3000',
        'http://localhost',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
EOF

echo "✓ Arquivo cors.php atualizado"

# 2. Atualizar .env
sed -i "s|^FRONTEND_URL=.*|FRONTEND_URL=http://18.217.114.196:3000|" backend/.env
sed -i "s|^SANCTUM_STATEFUL_DOMAINS=.*|SANCTUM_STATEFUL_DOMAINS=18.217.114.196:3000,18.217.114.196|" backend/.env
sed -i "s|^APP_URL=.*|APP_URL=http://18.217.114.196|" backend/.env

echo "✓ Variáveis de ambiente atualizadas"
grep -E "FRONTEND_URL|SANCTUM_STATEFUL_DOMAINS|APP_URL" backend/.env

# 3. Reiniciar backend
docker-compose restart backend nginx

echo "⏳ Aguardando 10 segundos..."
sleep 10

# 4. Limpar cache
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear

echo ""
echo "✅ CORS configurado!"
echo ""
echo "Teste agora no navegador: http://18.217.114.196:3000/register"
