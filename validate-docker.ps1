# ============================================
# CardFlow - Script de Validação Docker
# ============================================

Write-Host "🔍 Validando configuração do CardFlow Docker..." -ForegroundColor Cyan
Write-Host ""

$Errors = 0
$Warnings = 0

# Verificar Docker
Write-Host "Verificando Docker... " -NoNewline
try {
    $dockerVersion = (docker --version) -replace '.*version ([0-9.]+).*', '$1'
    Write-Host "✓ Docker $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker não encontrado" -ForegroundColor Red
    $Errors++
}

# Verificar Docker Compose
Write-Host "Verificando Docker Compose... " -NoNewline
try {
    $composeVersion = (docker-compose --version) -replace '.*version ([0-9.]+).*', '$1'
    Write-Host "✓ Docker Compose $composeVersion" -ForegroundColor Green
} catch {
    try {
        $composeVersion = docker compose version --short
        Write-Host "✓ Docker Compose $composeVersion" -ForegroundColor Green
    } catch {
        Write-Host "✗ Docker Compose não encontrado" -ForegroundColor Red
        $Errors++
    }
}

# Verificar se Docker está rodando
Write-Host "Verificando se Docker está rodando... " -NoNewline
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "✗ Docker não está rodando" -ForegroundColor Red
        $Errors++
    }
} catch {
    Write-Host "✗ Docker não está rodando" -ForegroundColor Red
    $Errors++
}

# Verificar arquivo .env.docker
Write-Host "Verificando .env.docker... " -NoNewline
if (Test-Path ".env.docker") {
    Write-Host "✓" -ForegroundColor Green
    
    # Ler conteúdo do arquivo
    $envContent = Get-Content ".env.docker" -Raw
    
    Write-Host ""
    Write-Host "Verificando variáveis de ambiente:"
    
    # APP_KEY
    Write-Host "  APP_KEY... " -NoNewline
    if ($envContent -match "APP_KEY=base64:[A-Za-z0-9+/=]+" -and $envContent -notmatch "APP_KEY=base64:GERE_UMA_CHAVE") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "⚠ Não configurada (será gerada automaticamente)" -ForegroundColor Yellow
        $Warnings++
    }
    
    # OPENAI_API_KEY
    Write-Host "  OPENAI_API_KEY... " -NoNewline
    if ($envContent -match "OPENAI_API_KEY=sk-") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "⚠ Não configurada" -ForegroundColor Yellow
        $Warnings++
    }
    
    # ELEVENLABS_API_KEY
    Write-Host "  ELEVENLABS_API_KEY... " -NoNewline
    if ($envContent -match "ELEVENLABS_API_KEY=.+" -and $envContent -notmatch "ELEVENLABS_API_KEY=$") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "⚠ Não configurada" -ForegroundColor Yellow
        $Warnings++
    }
    
    # STRIPE_KEY
    Write-Host "  STRIPE_KEY... " -NoNewline
    if ($envContent -match "STRIPE_KEY=pk_") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "⚠ Não configurada" -ForegroundColor Yellow
        $Warnings++
    }
    
    # STRIPE_SECRET
    Write-Host "  STRIPE_SECRET... " -NoNewline
    if ($envContent -match "STRIPE_SECRET=sk_") {
        Write-Host "✓" -ForegroundColor Green
    } else {
        Write-Host "⚠ Não configurada" -ForegroundColor Yellow
        $Warnings++
    }
    
} else {
    Write-Host "⚠ Arquivo não encontrado" -ForegroundColor Yellow
    Write-Host "  Será criado automaticamente a partir de .env.docker.example"
    $Warnings++
}

Write-Host ""

# Verificar Dockerfiles
Write-Host "Verificando Dockerfiles:"

Write-Host "  backend/Dockerfile... " -NoNewline
if (Test-Path "backend/Dockerfile") { 
    Write-Host "✓" -ForegroundColor Green 
} else { 
    Write-Host "✗" -ForegroundColor Red
    $Errors++ 
}

Write-Host "  frontend/Dockerfile... " -NoNewline
if (Test-Path "frontend/Dockerfile") { 
    Write-Host "✓" -ForegroundColor Green 
} else { 
    Write-Host "✗" -ForegroundColor Red
    $Errors++ 
}

Write-Host "  voice-ia-service/Dockerfile... " -NoNewline
if (Test-Path "voice-ia-service/Dockerfile") { 
    Write-Host "✓" -ForegroundColor Green 
} else { 
    Write-Host "✗" -ForegroundColor Red
    $Errors++ 
}

Write-Host ""

# Verificar docker-compose.yml
Write-Host "Verificando docker-compose.yml... " -NoNewline
if (Test-Path "docker-compose.yml") {
    Write-Host "✓" -ForegroundColor Green
    
    # Validar sintaxe
    Write-Host "  Validando sintaxe... " -NoNewline
    try {
        docker-compose config 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓" -ForegroundColor Green
        } else {
            Write-Host "✗ Erro de sintaxe" -ForegroundColor Red
            $Errors++
        }
    } catch {
        Write-Host "✗ Erro de sintaxe" -ForegroundColor Red
        $Errors++
    }
} else {
    Write-Host "✗" -ForegroundColor Red
    $Errors++
}

Write-Host ""

# Verificar configuração Nginx
Write-Host "Verificando configuração Nginx:"
Write-Host "  deploy/nginx/default.conf... " -NoNewline
if (Test-Path "deploy/nginx/default.conf") { 
    Write-Host "✓" -ForegroundColor Green 
} else { 
    Write-Host "✗" -ForegroundColor Red
    $Errors++ 
}

Write-Host "  deploy/nginx/nginx.conf... " -NoNewline
if (Test-Path "deploy/nginx/nginx.conf") { 
    Write-Host "✓" -ForegroundColor Green 
} else { 
    Write-Host "✗" -ForegroundColor Red
    $Errors++ 
}

Write-Host ""

# Verificar portas disponíveis
Write-Host "Verificando portas disponíveis:"

function Check-Port {
    param($Port, $Service)
    Write-Host "  Porta $Port ($Service)... " -NoNewline
    
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "⚠ Em uso" -ForegroundColor Yellow
        $script:Warnings++
    } else {
        Write-Host "✓ Disponível" -ForegroundColor Green
    }
}

Check-Port 80 "Nginx"
Check-Port 3000 "Frontend"
Check-Port 3001 "Voice IA"
Check-Port 5432 "PostgreSQL"
Check-Port 6379 "Redis"

Write-Host ""
Write-Host "============================================"
Write-Host ""

# Resumo
if ($Errors -eq 0 -and $Warnings -eq 0) {
    Write-Host "✅ Tudo pronto para iniciar o CardFlow!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Execute: " -NoNewline
    Write-Host ".\start-docker.ps1" -ForegroundColor Blue
} elseif ($Errors -eq 0) {
    Write-Host "⚠️  $Warnings aviso(s) encontrado(s)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Você pode continuar, mas algumas funcionalidades podem não estar disponíveis."
    Write-Host ""
    Write-Host "Para continuar: " -NoNewline
    Write-Host ".\start-docker.ps1" -ForegroundColor Blue
} else {
    Write-Host "❌ $Errors erro(s) encontrado(s)" -ForegroundColor Red
    if ($Warnings -gt 0) {
        Write-Host "⚠️  $Warnings aviso(s) encontrado(s)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Por favor, corrija os erros antes de continuar." -ForegroundColor Red
    exit 1
}

Write-Host ""
