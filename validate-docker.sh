#!/bin/bash

# ============================================
# CardFlow - Script de Validação Docker
# ============================================

set -e

echo "🔍 Validando configuração do CardFlow Docker..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Verificar Docker
echo -n "Verificando Docker... "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
    echo -e "${GREEN}✓${NC} Docker $DOCKER_VERSION"
else
    echo -e "${RED}✗ Docker não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar Docker Compose
echo -n "Verificando Docker Compose... "
if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | grep -oP '\d+\.\d+\.\d+' | head -1)
    else
        COMPOSE_VERSION=$(docker compose version --short)
    fi
    echo -e "${GREEN}✓${NC} Docker Compose $COMPOSE_VERSION"
else
    echo -e "${RED}✗ Docker Compose não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar se Docker está rodando
echo -n "Verificando se Docker está rodando... "
if docker info &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗ Docker não está rodando${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Verificar arquivo .env.docker
echo -n "Verificando .env.docker... "
if [ -f ".env.docker" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Verificar variáveis importantes
    echo ""
    echo "Verificando variáveis de ambiente:"
    
    # APP_KEY
    echo -n "  APP_KEY... "
    if grep -q "APP_KEY=base64:" .env.docker && ! grep -q "APP_KEY=base64:GERE_UMA_CHAVE" .env.docker; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Não configurada (será gerada automaticamente)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # OPENAI_API_KEY
    echo -n "  OPENAI_API_KEY... "
    if grep -q "OPENAI_API_KEY=sk-" .env.docker; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Não configurada${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # ELEVENLABS_API_KEY
    echo -n "  ELEVENLABS_API_KEY... "
    if grep -q "ELEVENLABS_API_KEY=" .env.docker && ! grep -q "ELEVENLABS_API_KEY=$" .env.docker; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Não configurada${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # STRIPE_KEY
    echo -n "  STRIPE_KEY... "
    if grep -q "STRIPE_KEY=pk_" .env.docker; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Não configurada${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # STRIPE_SECRET
    echo -n "  STRIPE_SECRET... "
    if grep -q "STRIPE_SECRET=sk_" .env.docker; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ Não configurada${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
else
    echo -e "${YELLOW}⚠ Arquivo não encontrado${NC}"
    echo "  Será criado automaticamente a partir de .env.docker.example"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Verificar Dockerfiles
echo "Verificando Dockerfiles:"

echo -n "  backend/Dockerfile... "
[ -f "backend/Dockerfile" ] && echo -e "${GREEN}✓${NC}" || { echo -e "${RED}✗${NC}"; ERRORS=$((ERRORS + 1)); }

echo -n "  frontend/Dockerfile... "
[ -f "frontend/Dockerfile" ] && echo -e "${GREEN}✓${NC}" || { echo -e "${RED}✗${NC}"; ERRORS=$((ERRORS + 1)); }

echo -n "  voice-ia-service/Dockerfile... "
[ -f "voice-ia-service/Dockerfile" ] && echo -e "${GREEN}✓${NC}" || { echo -e "${RED}✗${NC}"; ERRORS=$((ERRORS + 1)); }

echo ""

# Verificar docker-compose.yml
echo -n "Verificando docker-compose.yml... "
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓${NC}"
    
    # Validar sintaxe
    echo -n "  Validando sintaxe... "
    if docker-compose config &> /dev/null || docker compose config &> /dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ Erro de sintaxe${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Verificar configuração Nginx
echo "Verificando configuração Nginx:"
echo -n "  deploy/nginx/default.conf... "
[ -f "deploy/nginx/default.conf" ] && echo -e "${GREEN}✓${NC}" || { echo -e "${RED}✗${NC}"; ERRORS=$((ERRORS + 1)); }

echo -n "  deploy/nginx/nginx.conf... "
[ -f "deploy/nginx/nginx.conf" ] && echo -e "${GREEN}✓${NC}" || { echo -e "${RED}✗${NC}"; ERRORS=$((ERRORS + 1)); }

echo ""

# Verificar portas disponíveis
echo "Verificando portas disponíveis:"

check_port() {
    local port=$1
    local service=$2
    echo -n "  Porta $port ($service)... "
    
    if command -v netstat &> /dev/null; then
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            echo -e "${YELLOW}⚠ Em uso${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✓ Disponível${NC}"
        fi
    elif command -v lsof &> /dev/null; then
        if lsof -i:$port &> /dev/null; then
            echo -e "${YELLOW}⚠ Em uso${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✓ Disponível${NC}"
        fi
    else
        echo -e "${BLUE}? Não foi possível verificar${NC}"
    fi
}

check_port 80 "Nginx"
check_port 3000 "Frontend"
check_port 3001 "Voice IA"
check_port 5432 "PostgreSQL"
check_port 6379 "Redis"

echo ""
echo "============================================"
echo ""

# Resumo
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tudo pronto para iniciar o CardFlow!${NC}"
    echo ""
    echo -e "Execute: ${BLUE}./start-docker.sh${NC} ou ${BLUE}.\start-docker.ps1${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS aviso(s) encontrado(s)${NC}"
    echo ""
    echo "Você pode continuar, mas algumas funcionalidades podem não estar disponíveis."
    echo ""
    echo -e "Para continuar: ${BLUE}./start-docker.sh${NC} ou ${BLUE}.\start-docker.ps1${NC}"
else
    echo -e "${RED}❌ $ERRORS erro(s) encontrado(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS aviso(s) encontrado(s)${NC}"
    fi
    echo ""
    echo "Por favor, corrija os erros antes de continuar."
    exit 1
fi

echo ""
