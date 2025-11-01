# ========================================
# Script PowerShell - Deploy Automático EC2
# Execute este script no Windows
# ========================================

param(
    [string]$KeyPath = "",
    [string]$ServerIP = "18.217.114.196",
    [string]$User = "ubuntu",
    [switch]$Quick = $false
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Deploy Automático - CardFlow EC2" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar chave SSH
if ($KeyPath -eq "") {
    Write-Host "❌ Erro: Você precisa especificar o caminho da chave SSH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -KeyPath 'C:\caminho\para\sua-chave.pem'" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -KeyPath 'C:\caminho\para\sua-chave.pem' -Quick" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ Erro: Chave SSH não encontrada em: $KeyPath" -ForegroundColor Red
    exit 1
}

$ScriptToRun = if ($Quick) { "quick-deploy.sh" } else { "deploy-ec2.sh" }

Write-Host "📦 Fazendo commit das alterações locais..." -ForegroundColor Yellow
git add .
git commit -m "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ErrorAction SilentlyContinue

Write-Host "📤 Enviando código para o repositório..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "📁 Copiando script de deploy para o servidor..." -ForegroundColor Yellow
scp -i $KeyPath "$PSScriptRoot\$ScriptToRun" "${User}@${ServerIP}:/home/ubuntu/cardflow/"
scp -i $KeyPath "$PSScriptRoot\docker-compose.yml" "${User}@${ServerIP}:/home/ubuntu/cardflow/"

Write-Host ""
Write-Host "🔐 Conectando ao servidor EC2..." -ForegroundColor Yellow
Write-Host "Servidor: $ServerIP" -ForegroundColor Gray
Write-Host "Usuário: $User" -ForegroundColor Gray
Write-Host ""

# Executar deploy no servidor
ssh -i $KeyPath "${User}@${ServerIP}" @"
cd /home/ubuntu/cardflow
chmod +x $ScriptToRun
./$ScriptToRun
"@

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs de acesso:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://$ServerIP:3000" -ForegroundColor White
Write-Host "   Backend:   http://$ServerIP/api" -ForegroundColor White
Write-Host "   Voice IA:  http://$ServerIP/voice-api" -ForegroundColor White
Write-Host "   API Docs:  http://$ServerIP/api/documentation" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   Deploy completo:  .\deploy.ps1 -KeyPath 'sua-chave.pem'" -ForegroundColor Gray
Write-Host "   Deploy rápido:    .\deploy.ps1 -KeyPath 'sua-chave.pem' -Quick" -ForegroundColor Gray
Write-Host "   Conectar SSH:     ssh -i 'sua-chave.pem' ubuntu@$ServerIP" -ForegroundColor Gray
Write-Host ""
