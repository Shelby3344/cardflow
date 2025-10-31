#!/bin/bash

# ============================================
# CardFlow - Production Setup Script
# ============================================
# Este script configura todo o ambiente de produção
# Execute como: bash setup-production.sh

set -e  # Para no primeiro erro

echo "🚀 Iniciando setup do CardFlow em produção..."
echo ""

# ============================================
# 1. Verificar dependências
# ============================================
echo "📋 Verificando dependências..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"
echo ""

# ============================================
# 2. Criar estrutura de diretórios
# ============================================
echo "📁 Criando estrutura de diretórios..."
mkdir -p backend/storage/framework/{sessions,views,cache}
mkdir -p backend/storage/app/public
mkdir -p backend/storage/logs
mkdir -p backend/bootstrap/cache
mkdir -p deploy/nginx/ssl

echo "✅ Diretórios criados"
echo ""

# ============================================
# 3. Configurar permissões
# ============================================
echo "🔐 Configurando permissões..."
chmod -R 777 backend/storage
chmod -R 775 backend/bootstrap/cache

echo "✅ Permissões configuradas"
echo ""

# ============================================
# 4. Criar arquivo .env
# ============================================
echo "⚙️  Configurando arquivo .env..."

if [ ! -f backend/.env ]; then
    echo "Criando backend/.env a partir do .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ backend/.env criado"
else
    echo "⚠️  backend/.env já existe, mantendo o existente"
fi

# Remover qualquer APP_KEY vazia
sed -i '/^APP_KEY=$/d' backend/.env 2>/dev/null || sed -i '' '/^APP_KEY=$/d' backend/.env 2>/dev/null || true

echo ""

# ============================================
# 5. Criar arquivo .env.docker se não existir
# ============================================
if [ ! -f .env.docker ]; then
    echo "Criando .env.docker..."
    cat > .env.docker << 'EOF'
# Database
DB_PASSWORD=cardflow_secure_pass_2024

# Redis
REDIS_PASSWORD=

# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost

# Frontend
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost
NEXT_PUBLIC_VOICE_API_URL=http://localhost/voice-api

# External APIs (configure depois)
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
STRIPE_KEY=
STRIPE_SECRET=
EOF
    echo "✅ .env.docker criado"
else
    echo "⚠️  .env.docker já existe, mantendo o existente"
fi

echo ""

# ============================================
# 6. Parar containers existentes
# ============================================
echo "🛑 Parando containers existentes..."
docker-compose down 2>/dev/null || true
echo "✅ Containers parados"
echo ""

# ============================================
# 7. Build das imagens
# ============================================
echo "🔨 Construindo imagens Docker..."
docker-compose build --no-cache
echo "✅ Imagens construídas"
echo ""

# ============================================
# 8. Iniciar containers
# ============================================
echo "🚀 Iniciando containers..."
docker-compose up -d
echo "✅ Containers iniciados"
echo ""

# ============================================
# 9. Aguardar serviços ficarem prontos
# ============================================
echo "⏳ Aguardando serviços iniciarem (30 segundos)..."
sleep 30
echo ""

# ============================================
# 10. Gerar APP_KEY
# ============================================
echo "🔑 Gerando APP_KEY do Laravel..."

# Tentar gerar APP_KEY até 3 vezes
for i in {1..3}; do
    echo "Tentativa $i de 3..."
    APP_KEY=$(docker-compose run --rm backend php artisan key:generate --show 2>&1 | grep "base64:" | tail -1 || echo "")
    
    if [ ! -z "$APP_KEY" ]; then
        echo "✅ APP_KEY gerada: $APP_KEY"
        
        # Remover todas as linhas APP_KEY do .env
        sed -i '/^APP_KEY=/d' backend/.env 2>/dev/null || sed -i '' '/^APP_KEY=/d' backend/.env 2>/dev/null
        
        # Adicionar a nova APP_KEY
        echo "$APP_KEY" >> backend/.env
        
        echo "✅ APP_KEY adicionada ao backend/.env"
        break
    else
        echo "⚠️  Falha ao gerar APP_KEY, tentando novamente..."
        sleep 5
    fi
    
    if [ $i -eq 3 ]; then
        echo "❌ Não foi possível gerar APP_KEY automaticamente"
        echo "Execute manualmente: docker-compose run --rm backend php artisan key:generate"
        exit 1
    fi
done

echo ""

# ============================================
# 11. Recriar containers com .env correto
# ============================================
echo "🔄 Recriando containers com configuração atualizada..."
docker-compose up -d --force-recreate backend queue-worker
echo "✅ Containers recriados"
echo ""

# ============================================
# 12. Aguardar backend ficar pronto
# ============================================
echo "⏳ Aguardando backend ficar pronto (15 segundos)..."
sleep 15
echo ""

# ============================================
# 13. Executar migrations
# ============================================
echo "📊 Executando migrations do banco de dados..."
docker-compose exec -T backend php artisan migrate --force
echo "✅ Migrations executadas"
echo ""

# ============================================
# 14. Limpar caches
# ============================================
echo "🧹 Limpando caches..."
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear
docker-compose exec -T backend php artisan route:clear
docker-compose exec -T backend php artisan view:clear
echo "✅ Caches limpos"
echo ""

# ============================================
# 15. Recriar caches otimizados
# ============================================
echo "⚡ Criando caches otimizados..."
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache
echo "✅ Caches otimizados criados"
echo ""

# ============================================
# 16. Verificar status dos containers
# ============================================
echo "📊 Status dos containers:"
docker-compose ps
echo ""

# ============================================
# 17. Testar serviços
# ============================================
echo "🧪 Testando serviços..."
echo ""

echo "1. Testando health check do Laravel:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/up || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Laravel respondendo corretamente (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  Laravel retornou HTTP $HTTP_CODE"
fi

echo ""
echo "2. Testando rota de API:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/ping || echo "000")
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ API respondendo (HTTP $HTTP_CODE - esperado 401 sem autenticação)"
else
    echo "   ⚠️  API retornou HTTP $HTTP_CODE"
fi

echo ""
echo "3. Testando Frontend:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Frontend respondendo (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  Frontend retornou HTTP $HTTP_CODE"
fi

echo ""
echo "4. Testando Voice IA Service:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Voice IA respondendo (HTTP $HTTP_CODE)"
else
    echo "   ⚠️  Voice IA retornou HTTP $HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "✅ Setup concluído!"
echo "=========================================="
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Configure as chaves de API em backend/.env:"
echo "   - OPENAI_API_KEY=sua_chave"
echo "   - ELEVENLABS_API_KEY=sua_chave"
echo "   - STRIPE_KEY=sua_chave"
echo "   - STRIPE_SECRET=sua_chave"
echo ""
echo "2. Após configurar, reinicie os serviços:"
echo "   docker-compose restart backend queue-worker voice-ia"
echo ""
echo "3. Acesse a aplicação:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost/api"
echo "   - Voice IA: http://localhost:3001"
echo ""
echo "4. Para ver os logs:"
echo "   docker-compose logs -f [backend|frontend|voice-ia|nginx]"
echo ""
echo "=========================================="
