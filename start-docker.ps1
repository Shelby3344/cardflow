# ============================================
# CardFlow - Script de Inicialização Docker
# ============================================
# Executar no PowerShell: .\start-docker.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   CardFlow - Iniciando com Docker   " -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Docker está rodando
Write-Host "Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker info 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    Write-Host "Por favor, inicie o Docker Desktop e tente novamente." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está rodando" -ForegroundColor Green
Write-Host ""

# Verificar se o arquivo .env.docker existe
if (-Not (Test-Path ".env.docker")) {
    Write-Host "⚠️  Arquivo .env.docker não encontrado. Criando a partir do exemplo..." -ForegroundColor Yellow
    Copy-Item ".env.docker.example" ".env.docker"
    Write-Host "⚠️  Por favor, edite o arquivo .env.docker com suas configurações!" -ForegroundColor Yellow
    Write-Host "⚠️  Especialmente: APP_KEY, OPENAI_API_KEY, ELEVENLABS_API_KEY, STRIPE_KEY/SECRET" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione qualquer tecla após editar o arquivo .env.docker..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Ler arquivo .env.docker e verificar APP_KEY
$envContent = Get-Content ".env.docker" -Raw
if ($envContent -match "APP_KEY=base64:GERE_UMA_CHAVE" -or $envContent -notmatch "APP_KEY=base64:") {
    Write-Host "🔑 Gerando APP_KEY..." -ForegroundColor Yellow
    
    # Construir imagem do backend primeiro
    Write-Host "📝 Construindo imagem do backend..." -ForegroundColor Yellow
    docker-compose build backend
    
    # Gerar chave
    $appKey = docker-compose run --rm backend php artisan key:generate --show
    
    if ($LASTEXITCODE -eq 0) {
        # Atualizar arquivo .env.docker
        $envContent = $envContent -replace "APP_KEY=.*", "APP_KEY=$appKey"
        $envContent | Set-Content ".env.docker" -NoNewline
        Write-Host "✅ APP_KEY gerada e salva em .env.docker" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao gerar APP_KEY. Verifique o Dockerfile do backend." -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down
Write-Host ""

# Fazer build das imagens
Write-Host "🏗️  Construindo imagens Docker..." -ForegroundColor Yellow
Write-Host "Isso pode levar alguns minutos na primeira vez..." -ForegroundColor Gray
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao construir as imagens!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Imagens construídas com sucesso" -ForegroundColor Green
Write-Host ""

# Iniciar serviços de infraestrutura primeiro
Write-Host "🚀 Iniciando PostgreSQL e Redis..." -ForegroundColor Yellow
docker-compose up -d postgres redis
Write-Host "⏳ Aguardando serviços estarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host ""

# Executar migrações
Write-Host "📊 Executando migrações do banco de dados..." -ForegroundColor Yellow
docker-compose run --rm backend php artisan migrate --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aviso: Erro ao executar migrações. Continuando..." -ForegroundColor Yellow
}
Write-Host ""

# Executar seeders (opcional)
Write-Host "🌱 Executando seeders..." -ForegroundColor Yellow
docker-compose run --rm backend php artisan db:seed --force 2>$null
Write-Host ""

# Otimizar aplicação
Write-Host "🧹 Otimizando aplicação..." -ForegroundColor Yellow
docker-compose run --rm backend php artisan config:cache
docker-compose run --rm backend php artisan route:cache
docker-compose run --rm backend php artisan view:cache
Write-Host ""

# Iniciar todos os serviços
Write-Host "🚀 Iniciando todos os serviços..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar os serviços!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Serviços iniciados com sucesso" -ForegroundColor Green
Write-Host ""

# Aguardar serviços estarem prontos
Write-Host "⏳ Aguardando todos os serviços estarem prontos..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host ""

# Mostrar status dos containers
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   Status dos containers:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Mostrar URLs de acesso
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   🎉 CardFlow está rodando!        " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "� URLs de acesso:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend:        http://localhost:3000" -ForegroundColor White
Write-Host "   🔧 Backend API:     http://localhost/api" -ForegroundColor White
Write-Host "   �️  Voice IA:       http://localhost/voice-api" -ForegroundColor White
Write-Host "   📊 API Docs:        http://localhost/api/documentation" -ForegroundColor White
Write-Host ""
Write-Host "🗄️  Serviços de Dados:" -ForegroundColor Cyan
Write-Host "   PostgreSQL:        localhost:5432" -ForegroundColor White
Write-Host "   Redis:             localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "� Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Ver logs:          docker-compose logs -f [service]" -ForegroundColor Gray
Write-Host "   Parar:             docker-compose down" -ForegroundColor Gray
Write-Host "   Reiniciar:         docker-compose restart [service]" -ForegroundColor Gray
Write-Host "   Executar comando:  docker-compose exec [service] [command]" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green

# Perguntar se deseja ver os logs
Write-Host ""
$showLogs = Read-Host "Deseja ver os logs agora? (s/n)"
if ($showLogs -eq "s" -or $showLogs -eq "S" -or $showLogs -eq "sim") {
    Write-Host ""
    Write-Host "Mostrando logs (Ctrl+C para sair)..." -ForegroundColor Yellow
    Write-Host ""
    docker-compose logs -f
}
