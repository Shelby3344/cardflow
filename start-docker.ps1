# Script de inicialização do CardFlow com Docker
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

# Parar containers existentes
Write-Host "Parando containers existentes..." -ForegroundColor Yellow
docker-compose down
Write-Host ""

# Fazer build das imagens
Write-Host "Construindo imagens Docker..." -ForegroundColor Yellow
Write-Host "Isso pode levar alguns minutos na primeira vez..." -ForegroundColor Gray
docker-compose build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao construir as imagens!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Imagens construídas com sucesso" -ForegroundColor Green
Write-Host ""

# Iniciar todos os serviços
Write-Host "Iniciando todos os serviços..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao iniciar os serviços!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Serviços iniciados com sucesso" -ForegroundColor Green
Write-Host ""

# Aguardar alguns segundos para os serviços iniciarem
Write-Host "Aguardando inicialização dos serviços..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host ""

# Mostrar status dos containers
Write-Host "Status dos containers:" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

# Mostrar URLs de acesso
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   🎉 CardFlow está rodando!        " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend (Next.js):  http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend (Laravel):   http://localhost" -ForegroundColor White
Write-Host "🎤 Voice IA (Node.js):  http://localhost:3001" -ForegroundColor White
Write-Host "🗄️  PostgreSQL:         localhost:5432" -ForegroundColor White
Write-Host "⚡ Redis:               localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para ver os logs:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Para parar os serviços:" -ForegroundColor Cyan
Write-Host "   docker-compose down" -ForegroundColor Gray
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green

# Perguntar se deseja ver os logs
$showLogs = Read-Host "Deseja ver os logs agora? (s/n)"
if ($showLogs -eq "s" -or $showLogs -eq "S") {
    Write-Host ""
    Write-Host "Mostrando logs (Ctrl+C para sair)..." -ForegroundColor Yellow
    docker-compose logs -f
}
