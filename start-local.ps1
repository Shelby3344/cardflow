# Script para iniciar CardFlow SEM Docker (desenvolvimento local)
# Execute: .\start-local.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   CardFlow - Modo Local (Sem Docker)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Get-Location

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js não está instalado!" -ForegroundColor Red
    Write-Host "Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Função para iniciar serviço em nova janela do PowerShell
function Start-Service {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Command,
        [string]$Color
    )
    
    Write-Host "🚀 Iniciando $Name..." -ForegroundColor $Color
    
    $fullPath = Join-Path $rootPath $Path
    
    # Criar comando para nova janela do PowerShell
    $psCommand = "cd '$fullPath'; Write-Host '=====================================' -ForegroundColor $Color; Write-Host '   $Name' -ForegroundColor $Color; Write-Host '=====================================' -ForegroundColor $Color; Write-Host ''; $Command"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $psCommand
    
    Start-Sleep -Seconds 2
}

Write-Host "Iniciando serviços..." -ForegroundColor Cyan
Write-Host ""

# Iniciar Frontend
Start-Service -Name "Frontend (Next.js)" -Path "frontend" -Command "npm run dev" -Color "Green"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "   ✅ Serviços iniciados!            " -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend (Next.js):  http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Nota: Backend e Voice IA não foram iniciados" -ForegroundColor Yellow
Write-Host "   Para funcionalidade completa, você precisa:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Instalar Docker Desktop" -ForegroundColor Gray
Write-Host "   2. Rodar: .\start-docker.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   OU configurar manualmente:" -ForegroundColor Gray
Write-Host "   - PostgreSQL na porta 5432" -ForegroundColor Gray
Write-Host "   - Redis na porta 6379" -ForegroundColor Gray
Write-Host "   - PHP/Laravel para o backend" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Veja INSTALACAO_DOCKER.md para mais detalhes" -ForegroundColor Cyan
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green

Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
