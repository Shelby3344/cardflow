# Script PowerShell para enviar atualização para VPS
# Uso: .\send-to-vps.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$true)]
    [string]$VpsUser,
    
    [string]$VpsPath = "/var/www/cardflow"
)

Write-Host "🚀 Preparando atualização do CardFlow..." -ForegroundColor Cyan

# Diretório do projeto
$projectPath = "c:\Users\zucks\OneDrive\Área de Trabalho\fg\cardflow"
$zipFile = "cardflow-update.zip"

# 1. Limpar builds anteriores
Write-Host "🧹 Limpando builds anteriores..." -ForegroundColor Yellow
if (Test-Path "$projectPath\$zipFile") {
    Remove-Item "$projectPath\$zipFile" -Force
}

# 2. Criar lista de exclusões
$excludePaths = @(
    "node_modules",
    "vendor",
    ".git",
    ".next",
    "storage/logs/*",
    "storage/framework/cache/*",
    "storage/framework/sessions/*",
    "storage/framework/views/*",
    "*.log",
    "backup_*.sql",
    ".env.local"
)

Write-Host "📦 Criando pacote de atualização..." -ForegroundColor Yellow

# 3. Criar arquivo temporário com lista de arquivos
$tempList = "$env:TEMP\cardflow-files.txt"
Get-ChildItem -Path $projectPath -Recurse | 
    Where-Object { 
        $file = $_
        $shouldExclude = $false
        foreach ($exclude in $excludePaths) {
            if ($file.FullName -like "*$exclude*") {
                $shouldExclude = $true
                break
            }
        }
        -not $shouldExclude
    } | 
    Select-Object -ExpandProperty FullName | 
    Out-File $tempList

# 4. Criar ZIP
Compress-Archive -Path "$projectPath\*" -DestinationPath "$projectPath\$zipFile" -Force -CompressionLevel Optimal

Write-Host "✅ Pacote criado: $zipFile" -ForegroundColor Green
$fileSize = (Get-Item "$projectPath\$zipFile").Length / 1MB
Write-Host "📊 Tamanho: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan

# 5. Enviar para VPS via SCP
Write-Host ""
Write-Host "📤 Enviando para VPS..." -ForegroundColor Yellow
Write-Host "Host: $VpsHost" -ForegroundColor Cyan
Write-Host "User: $VpsUser" -ForegroundColor Cyan
Write-Host "Path: $VpsPath" -ForegroundColor Cyan

# Verificar se pscp (PuTTY SCP) está disponível
if (Get-Command pscp -ErrorAction SilentlyContinue) {
    pscp -batch "$projectPath\$zipFile" "${VpsUser}@${VpsHost}:~/"
} else {
    Write-Host ""
    Write-Host "⚠️  PSCP não encontrado. Use um dos métodos alternativos:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "OPÇÃO 1 - Usar SCP (WSL ou Git Bash):" -ForegroundColor Cyan
    Write-Host "scp $zipFile ${VpsUser}@${VpsHost}:~/" -ForegroundColor White
    Write-Host ""
    Write-Host "OPÇÃO 2 - Usar WinSCP (GUI):" -ForegroundColor Cyan
    Write-Host "1. Abra WinSCP" -ForegroundColor White
    Write-Host "2. Conecte em: $VpsHost" -ForegroundColor White
    Write-Host "3. Arraste o arquivo: $projectPath\$zipFile" -ForegroundColor White
    Write-Host ""
    Write-Host "OPÇÃO 3 - Usar SFTP:" -ForegroundColor Cyan
    Write-Host "sftp ${VpsUser}@${VpsHost}" -ForegroundColor White
    Write-Host "put $zipFile" -ForegroundColor White
    Write-Host ""
}

# 6. Mostrar próximos passos
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS NA VPS:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. Conectar via SSH:" -ForegroundColor Cyan
Write-Host "   ssh ${VpsUser}@${VpsHost}" -ForegroundColor White
Write-Host ""
Write-Host "2. Navegar para o diretório:" -ForegroundColor Cyan
Write-Host "   cd $VpsPath" -ForegroundColor White
Write-Host ""
Write-Host "3. Fazer backup:" -ForegroundColor Cyan
Write-Host "   docker-compose exec postgres pg_dump -U cardflow cardflow > backup_`$(date +%Y%m%d_%H%M%S).sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Parar containers:" -ForegroundColor Cyan
Write-Host "   docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "5. Extrair atualização:" -ForegroundColor Cyan
Write-Host "   unzip -o ~/$zipFile -d /tmp/cardflow-new" -ForegroundColor White
Write-Host "   rsync -av --exclude='.env' /tmp/cardflow-new/ ./" -ForegroundColor White
Write-Host ""
Write-Host "6. Rebuild e iniciar:" -ForegroundColor Cyan
Write-Host "   docker-compose build --no-cache" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor White
Write-Host ""
Write-Host "7. Executar migrations:" -ForegroundColor Cyan
Write-Host "   docker-compose exec backend php artisan migrate --force" -ForegroundColor White
Write-Host ""
Write-Host "8. Limpar cache:" -ForegroundColor Cyan
Write-Host "   docker-compose exec backend php artisan optimize" -ForegroundColor White
Write-Host ""
Write-Host "9. Verificar status:" -ForegroundColor Cyan
Write-Host "   docker-compose ps" -ForegroundColor White
Write-Host ""

# 7. Criar script de comandos para VPS
$vpsScript = @"
#!/bin/bash
# Script gerado automaticamente - Executar na VPS

set -e

echo "🚀 Iniciando atualização..."

# Variáveis
PROJECT_PATH="$VpsPath"
BACKUP_DATE=`$(date +%Y%m%d_%H%M%S)

cd `$PROJECT_PATH

# 1. Backup
echo "📦 Criando backup..."
docker-compose exec -T postgres pg_dump -U cardflow cardflow > backup_`$BACKUP_DATE.sql

# 2. Parar containers
echo "⏹️  Parando containers..."
docker-compose down

# 3. Extrair novos arquivos
echo "📥 Extraindo atualização..."
unzip -o ~/$zipFile -d /tmp/cardflow-new

# 4. Copiar arquivos (preservar .env)
echo "📋 Copiando arquivos..."
rsync -av --exclude='.env' --exclude='node_modules' --exclude='vendor' /tmp/cardflow-new/ ./

# 5. Rebuild
echo "🔨 Reconstruindo containers..."
docker-compose build --no-cache

# 6. Iniciar
echo "🚀 Iniciando containers..."
docker-compose up -d

# 7. Aguardar
echo "⏳ Aguardando containers..."
sleep 10

# 8. Migrations
echo "🗄️  Executando migrations..."
docker-compose exec -T backend php artisan migrate --force

# 9. Otimizar
echo "⚡ Otimizando..."
docker-compose exec -T backend php artisan optimize

# 10. Status
echo "📊 Verificando status..."
docker-compose ps

echo "✅ Atualização concluída!"
"@

$vpsScript | Out-File "$projectPath\update-vps.sh" -Encoding UTF8
Write-Host "✅ Script criado: update-vps.sh" -ForegroundColor Green
Write-Host "   Você pode enviar e executar este script na VPS!" -ForegroundColor Cyan
Write-Host ""
