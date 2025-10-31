#!/bin/bash

# ========================================
# Script de Deploy Automático - CardFlow
# Para Amazon EC2 - Ubuntu 22.04
# ========================================

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do CardFlow no EC2..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis
SERVER_IP="18.217.114.196"
REPO_URL="https://github.com/Shelby3344/cardflow.git"
PROJECT_DIR="/home/ubuntu/cardflow"

# Função para imprimir mensagens coloridas
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 1. Atualizar sistema
print_info "Atualizando sistema..."
sudo apt-get update
sudo apt-get upgrade -y
print_success "Sistema atualizado"

# 2. Instalar Docker
if ! command -v docker &> /dev/null; then
    print_info "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    print_success "Docker instalado"
else
    print_success "Docker já está instalado"
fi

# 3. Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_info "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose instalado"
else
    print_success "Docker Compose já está instalado"
fi

# 4. Instalar Git
if ! command -v git &> /dev/null; then
    print_info "Instalando Git..."
    sudo apt-get install -y git
    print_success "Git instalado"
else
    print_success "Git já está instalado"
fi

# 5. Clonar ou atualizar repositório
if [ -d "$PROJECT_DIR" ]; then
    print_info "Atualizando repositório..."
    cd "$PROJECT_DIR"
    git pull origin main
    print_success "Repositório atualizado"
else
    print_info "Clonando repositório..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    print_success "Repositório clonado"
fi

# Entrar no diretório do projeto
cd "$PROJECT_DIR"
print_info "Diretório atual: $(pwd)"

# 6. Configurar arquivo .env
if [ ! -f ".env" ]; then
    print_info "Criando arquivo .env..."
    cp .env.example .env
    
    # Substituir valores no .env
    sed -i "s|your_server_ip_here|$SERVER_IP|g" .env
    sed -i "s|your_secure_postgres_password_here|cardflow_dev_secret_2025|g" .env
    sed -i "s|your_secure_redis_password_here|redis_dev_secret_2025|g" .env
    
    print_success "Arquivo .env criado"
else
    print_info "Arquivo .env já existe, mantendo configurações atuais"
fi

# 7. Parar containers existentes
print_info "Parando containers existentes..."
cd "$PROJECT_DIR"
docker-compose down 2>/dev/null || true
print_success "Containers parados"

# 8. Remover volumes antigos (opcional - comentado por segurança)
# print_info "Removendo volumes antigos..."
# docker-compose down -v
# print_success "Volumes removidos"

# 9. Construir e iniciar containers
print_info "Construindo e iniciando containers..."
cd "$PROJECT_DIR"
docker-compose up -d --build
print_success "Containers iniciados"

# 10. Aguardar containers iniciarem
print_info "Aguardando containers iniciarem (30 segundos)..."
sleep 30

# 11. Gerar APP_KEY do Laravel
print_info "Gerando APP_KEY do Laravel..."
cd "$PROJECT_DIR"
docker-compose exec -T backend php artisan key:generate --force
print_success "APP_KEY gerada"

# 12. Gerar JWT Secret
print_info "Gerando JWT Secret..."
cd "$PROJECT_DIR"
docker-compose exec -T backend php artisan jwt:secret --force
print_success "JWT Secret gerada"

# 13. Executar migrations
print_info "Executando migrations do banco de dados..."
cd "$PROJECT_DIR"
docker-compose exec -T backend php artisan migrate --force
print_success "Migrations executadas"

# 14. Executar seeders (opcional)
print_info "Executando seeders..."
cd "$PROJECT_DIR"
docker-compose exec -T backend php artisan db:seed --force || true
print_success "Seeders executados"

# 15. Limpar cache
print_info "Limpando cache..."
cd "$PROJECT_DIR"
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear
docker-compose exec -T backend php artisan route:clear
docker-compose exec -T backend php artisan view:clear
print_success "Cache limpo"

# 16. Otimizar para produção
print_info "Otimizando para produção..."
cd "$PROJECT_DIR"
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache
docker-compose exec -T backend php artisan view:cache
print_success "Otimizações aplicadas"

# 17. Verificar status dos containers
print_info "Verificando status dos containers..."
cd "$PROJECT_DIR"
docker-compose ps

# 18. Configurar firewall
print_info "Configurando firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable || true
print_success "Firewall configurado"

echo ""
print_success "=========================================="
print_success "🎉 Deploy concluído com sucesso!"
print_success "=========================================="
echo ""
print_info "Acesse sua aplicação em: http://$SERVER_IP"
echo ""
print_info "Comandos úteis:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Reiniciar: docker-compose restart"
echo "  - Parar: docker-compose down"
echo "  - Status: docker-compose ps"
echo ""
print_info "Para recarregar o Docker group: newgrp docker"
echo ""
