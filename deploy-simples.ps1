# ========================================
# Script Simplificado de Deploy
# Execute: .\deploy-simples.ps1
# ========================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🚀 Deploy CardFlow - Assistente" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configurações do servidor
$ServerIP = "18.217.114.196"
$User = "ubuntu"
$ProjectPath = "/home/ubuntu/cardflow"

# Procurar chave SSH automaticamente
$PossibleKeys = @(
    "$env:USERPROFILE\.ssh\cardflow.pem",
    "$env:USERPROFILE\.ssh\aws-key.pem",
    "$env:USERPROFILE\.ssh\ec2-key.pem",
    "$env:USERPROFILE\Downloads\*.pem"
)

$KeyPath = $null
foreach ($pattern in $PossibleKeys) {
    $found = Get-ChildItem $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $KeyPath = $found.FullName
        break
    }
}

# Se não encontrou, pedir ao usuário
if (-not $KeyPath) {
    Write-Host "🔑 Chave SSH não encontrada automaticamente." -ForegroundColor Yellow
    Write-Host ""
    $KeyPath = Read-Host "Digite o caminho completo da sua chave .pem"
    
    if (-not (Test-Path $KeyPath)) {
        Write-Host "❌ Arquivo não encontrado: $KeyPath" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Usando chave SSH: $KeyPath" -ForegroundColor Green
Write-Host ""

# Perguntar tipo de deploy
Write-Host "Escolha o tipo de deploy:" -ForegroundColor Yellow
Write-Host "  [1] Deploy Completo (primeira vez ou mudanças grandes)" -ForegroundColor White
Write-Host "  [2] Deploy Rápido (apenas atualizar código)" -ForegroundColor White
Write-Host "  [3] Apenas atualizar NextAuth (corrigir erro 500)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Digite sua escolha (1, 2 ou 3)"

$ScriptToRun = switch ($choice) {
    "1" { "deploy-ec2.sh"; break }
    "2" { "quick-deploy.sh"; break }
    "3" { "fix-nextauth.sh"; break }
    default { 
        Write-Host "❌ Escolha inválida!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Preparando deploy..." -ForegroundColor Yellow

# Fazer commit se houver mudanças
Write-Host "📝 Verificando mudanças no Git..." -ForegroundColor Yellow
$hasChanges = git status --porcelain
if ($hasChanges) {
    Write-Host "   Encontradas mudanças locais. Fazendo commit..." -ForegroundColor Gray
    git add .
    git commit -m "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ErrorAction SilentlyContinue
    git push origin main
    Write-Host "   ✅ Código enviado para o repositório" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Sem mudanças locais" -ForegroundColor Gray
}

# Copiar script para o servidor
Write-Host ""
Write-Host "📤 Enviando scripts para o servidor..." -ForegroundColor Yellow
scp -i $KeyPath "$PSScriptRoot\$ScriptToRun" "${User}@${ServerIP}:${ProjectPath}/" 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao conectar no servidor. Verifique:" -ForegroundColor Red
    Write-Host "   - Chave SSH está correta" -ForegroundColor Yellow
    Write-Host "   - Servidor está acessível" -ForegroundColor Yellow
    Write-Host "   - Security Group permite SSH (porta 22)" -ForegroundColor Yellow
    exit 1
}

# Executar deploy no servidor
Write-Host ""
Write-Host "🚀 Executando deploy no servidor..." -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Gray
Write-Host ""

ssh -i $KeyPath "${User}@${ServerIP}" @"
cd $ProjectPath
chmod +x $ScriptToRun
./$ScriptToRun
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 URLs de acesso:" -ForegroundColor Cyan
    Write-Host "   Frontend:  http://$ServerIP:3000" -ForegroundColor White
    Write-Host "   Backend:   http://$ServerIP/api" -ForegroundColor White
    Write-Host "   API Docs:  http://$ServerIP/api/documentation" -ForegroundColor White
    Write-Host ""
    
    # Abrir navegador
    $openBrowser = Read-Host "Deseja abrir o navegador? (S/n)"
    if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
        Start-Process "http://$ServerIP:3000"
    }
} else {
    Write-Host ""
    Write-Host "❌ Deploy falhou! Verifique os logs acima." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Comandos úteis:" -ForegroundColor Yellow
    Write-Host "   Ver logs:    ssh -i '$KeyPath' $User@$ServerIP 'docker-compose -f $ProjectPath/docker-compose.yml logs'" -ForegroundColor Gray
    Write-Host "   Conectar:    ssh -i '$KeyPath' $User@$ServerIP" -ForegroundColor Gray
    exit 1
}
