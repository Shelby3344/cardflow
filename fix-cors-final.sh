#!/bin/bash

# ========================================
# Script de Correção Final - CORS no Nginx
# ========================================

set -e

echo "=========================================="
echo "🔧 Correção Final - CORS no Nginx"
echo "=========================================="
echo ""

cd /home/ubuntu/cardflow

# 1. Backup da configuração atual
echo "📋 Fazendo backup da configuração atual..."
cp deploy/nginx/default.conf deploy/nginx/default.conf.backup 2>/dev/null || true

# 2. Criar nova configuração com CORS
echo "📝 Criando nova configuração com CORS..."
cat > deploy/nginx/default.conf << 'EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=10r/m;

server {
    listen 80;
    server_name localhost;
    root /var/www/public;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Hide Nginx version
    server_tokens off;
    
    # Client upload limit
    client_max_body_size 10M;

    index index.php;
    charset utf-8;

    # CORS Configuration
    set $cors_origin "";
    set $cors_cred "";
    set $cors_methods "";
    set $cors_headers "";

    # Check if origin matches allowed domains
    if ($http_origin ~* "^https?://(localhost|127\.0\.0\.1|18\.217\.114\.196)(:[0-9]+)?$") {
        set $cors_origin $http_origin;
        set $cors_cred "true";
        set $cors_methods "GET, POST, PUT, DELETE, OPTIONS, PATCH";
        set $cors_headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,Accept,Origin";
    }

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Credentials' $cors_cred always;
        add_header 'Access-Control-Allow-Methods' $cors_methods always;
        add_header 'Access-Control-Allow-Headers' $cors_headers always;
        add_header 'Access-Control-Max-Age' 86400 always;
        add_header 'Content-Type' 'text/plain; charset=utf-8' always;
        add_header 'Content-Length' 0 always;
        return 204;
    }

    # Add CORS headers to all responses
    add_header 'Access-Control-Allow-Origin' $cors_origin always;
    add_header 'Access-Control-Allow-Credentials' $cors_cred always;
    add_header 'Access-Control-Allow-Methods' $cors_methods always;
    add_header 'Access-Control-Allow-Headers' $cors_headers always;

    # Laravel Backend API
    location / {
        try_files $uri $uri/ /index.php?$query_string;
        limit_req zone=api_limit burst=30 nodelay;
    }
    
    # Auth endpoints with stricter rate limiting
    location ~ ^/(api/)?(login|register|password) {
        try_files $uri $uri/ /index.php?$query_string;
        limit_req zone=login_limit burst=5 nodelay;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass backend:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 60s;
        fastcgi_send_timeout 60s;
        
        # Pass CORS headers through FastCGI
        fastcgi_hide_header 'Access-Control-Allow-Origin';
        fastcgi_hide_header 'Access-Control-Allow-Credentials';
        fastcgi_hide_header 'Access-Control-Allow-Methods';
        fastcgi_hide_header 'Access-Control-Allow-Headers';
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    # Block access to sensitive files
    location ~ \.(env|git|gitignore|htaccess|sql|backup|log)$ {
        deny all;
    }
    
    # Static files with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para microserviço de IA de voz
    location /voice-api/ {
        proxy_pass http://voice-ia:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 3. Testar configuração do Nginx
echo ""
echo "🧪 Testando configuração do Nginx..."
docker-compose exec nginx nginx -t

# 4. Recarregar Nginx
echo ""
echo "🔄 Recarregando Nginx..."
docker-compose exec nginx nginx -s reload

# Aguardar
sleep 2

# 5. Testar CORS
echo ""
echo "🧪 Testando CORS..."
echo "----------------------------------------"
echo "Teste 1: Preflight OPTIONS request"
RESPONSE=$(curl -s -X OPTIONS http://localhost/api/register \
  -H "Origin: http://18.217.114.196:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -I | grep -i "access-control")

if [ -n "$RESPONSE" ]; then
    echo "✅ Headers CORS presentes:"
    echo "$RESPONSE"
else
    echo "❌ Headers CORS não encontrados"
fi

echo ""
echo "Teste 2: POST request"
curl -s -X POST http://localhost/api/register \
  -H "Origin: http://18.217.114.196:3000" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"12345678","password_confirmation":"12345678"}' \
  -I | grep -i "access-control"

echo ""
echo "=========================================="
echo "✅ CORS Configurado!"
echo "=========================================="
echo ""
echo "🌐 Teste agora no navegador:"
echo "   http://18.217.114.196:3000/register"
echo ""
echo "💡 Se ainda tiver erro de CORS:"
echo "   1. Limpe o cache do navegador (Ctrl+Shift+Del)"
echo "   2. Abra em aba anônima"
echo "   3. Tente novamente"
echo ""
