#!/bin/bash

# Script de setup inicial do CardFlow

echo "🚀 Iniciando setup do CardFlow..."

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    exit 1
fi

echo "✅ Docker instalado"

# 2. Criar arquivos .env se não existirem
if [ ! -f backend/.env ]; then
    echo "📝 Criando backend/.env..."
    cp backend/.env.example backend/.env
fi

if [ ! -f voice-ia-service/.env ]; then
    echo "📝 Criando voice-ia-service/.env..."
    cp voice-ia-service/.env.example voice-ia-service/.env
fi

# 3. Gerar chave Laravel
echo "🔑 Gerando chave do Laravel..."
cd backend
php artisan key:generate --ansi
cd ..

# 4. Iniciar containers Docker
echo "🐳 Iniciando containers Docker..."
docker-compose up -d

# 5. Aguardar serviços iniciarem
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# 6. Executar migrations
echo "📊 Executando migrations..."
docker-compose exec -T backend php artisan migrate --force

# 7. Limpar cache
echo "🧹 Limpando cache..."
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache

# 8. Criar usuário de teste
echo "👤 Criando usuário de teste..."
docker-compose exec -T backend php artisan tinker --execute="\\App\\Models\\User::factory()->create(['email'=>'admin@cardflow.com','password'=>bcrypt('password')])"

echo ""
echo "✅ Setup concluído!"
echo ""
echo "📍 Serviços disponíveis:"
echo "   - Backend API: http://localhost/api"
echo "   - Swagger Docs: http://localhost/api/documentation"
echo "   - Voice IA API: http://localhost/voice-api"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "👤 Usuário de teste:"
echo "   Email: admin@cardflow.com"
echo "   Senha: password"
echo ""
echo "🎉 CardFlow está pronto para uso!"
