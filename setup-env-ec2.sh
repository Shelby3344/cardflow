#!/bin/bash
# Script para configurar .env na EC2

cat > .env << 'EOF'
# ==================================
# CARDFLOW - PRODUCTION ENVIRONMENT
# ==================================

# PostgreSQL Configuration
POSTGRES_DB=cardflow
POSTGRES_USER=cardflow
POSTGRES_PASSWORD=CardFlow2025@Prod!Secure
POSTGRES_PORT=5432

# Redis Configuration
REDIS_PORT=6379
REDIS_PASSWORD=Redis2025@Prod!Secure

# Laravel Configuration
APP_NAME=CardFlow
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=cardflow
DB_USERNAME=cardflow
DB_PASSWORD=CardFlow2025@Prod!Secure

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=Redis2025@Prod!Secure
REDIS_PORT=6379

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# JWT
JWT_SECRET=
JWT_TTL=60

# Nginx Ports
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# Frontend
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_VOICE_API_URL=http://localhost:3001

# Voice IA Service
VOICE_IA_PORT=3001
OPENAI_API_KEY=

EOF

echo "✓ Arquivo .env criado!"
echo ""
echo "IMPORTANTE: Execute os seguintes comandos:"
echo "1. docker-compose exec backend php artisan key:generate"
echo "2. docker-compose exec backend php artisan jwt:secret"
echo ""
