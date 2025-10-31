#!/bin/bash

# ==================================
# CARDFLOW - DEPLOY SCRIPT
# Script automatizado para deploy na AWS EC2
# ==================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}===================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================${NC}\n"
}

# Verificar se está rodando na EC2
check_environment() {
    print_header "Verificando Ambiente"
    
    if [ ! -f /etc/cloud/cloud.cfg.d/01_aws.cfg ]; then
        print_warning "Este script é otimizado para AWS EC2"
        read -p "Continuar mesmo assim? (s/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Ambiente verificado"
}

# Verificar dependências
check_dependencies() {
    print_header "Verificando Dependências"
    
    # Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker não instalado"
        echo "Instale o Docker com: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    print_success "Docker instalado: $(docker --version)"
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose não instalado"
        echo "Instale com: sudo apt install docker-compose -y"
        exit 1
    fi
    print_success "Docker Compose instalado: $(docker-compose --version)"
    
    # Git (opcional)
    if command -v git &> /dev/null; then
        print_success "Git instalado: $(git --version)"
    else
        print_warning "Git não instalado (opcional)"
    fi
}

# Configurar variáveis de ambiente
setup_env() {
    print_header "Configurando Variáveis de Ambiente"
    
    if [ ! -f .env ]; then
        if [ -f .env.production ]; then
            print_info "Copiando .env.production para .env"
            cp .env.production .env
        else
            print_error "Arquivo .env ou .env.production não encontrado"
            exit 1
        fi
    fi
    
    # Solicitar IP público da EC2 se não estiver configurado
    if grep -q "seu-ip-ec2-aqui" .env; then
        print_warning "Configure o IP da EC2 no arquivo .env"
        read -p "Digite o IP público da EC2 (ou domínio): " EC2_IP
        
        if [ -n "$EC2_IP" ]; then
            sed -i "s/seu-ip-ec2-aqui/$EC2_IP/g" .env
            print_success "IP configurado: $EC2_IP"
        else
            print_error "IP não pode estar vazio"
            exit 1
        fi
    fi
    
    # Gerar senhas fortes se necessário
    if grep -q "SENHA_FORTE" .env; then
        print_info "Gerando senhas fortes..."
        DB_PASSWORD=$(openssl rand -base64 32)
        DB_ROOT_PASSWORD=$(openssl rand -base64 32)
        JWT_SECRET=$(openssl rand -base64 64)
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        
        sed -i "s/SENHA_FORTE_MYSQL_AQUI_123!/$DB_PASSWORD/g" .env
        sed -i "s/SENHA_ROOT_MYSQL_AINDA_MAIS_FORTE_456!/$DB_ROOT_PASSWORD/g" .env
        sed -i "s/sua-chave-jwt-super-secreta-256-bits-aqui/$JWT_SECRET/g" .env
        sed -i "s/gere-uma-chave-secreta-aleatoria-aqui-32-caracteres/$NEXTAUTH_SECRET/g" .env
        
        print_success "Senhas geradas automaticamente"
    fi
    
    print_success "Variáveis de ambiente configuradas"
}

# Parar containers antigos
stop_old_containers() {
    print_header "Parando Containers Antigos"
    
    if [ "$(docker ps -q)" ]; then
        docker-compose down || true
        print_success "Containers antigos parados"
    else
        print_info "Nenhum container rodando"
    fi
}

# Build das imagens
build_images() {
    print_header "Construindo Imagens Docker"
    
    print_info "Iniciando build... (pode levar alguns minutos)"
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    print_success "Imagens construídas com sucesso"
}

# Iniciar containers
start_containers() {
    print_header "Iniciando Containers"
    
    docker-compose -f docker-compose.prod.yml up -d
    
    print_info "Aguardando containers iniciarem..."
    sleep 10
    
    # Verificar status
    if [ "$(docker-compose ps -q | wc -l)" -gt 0 ]; then
        print_success "Containers iniciados"
        docker-compose ps
    else
        print_error "Falha ao iniciar containers"
        exit 1
    fi
}

# Configurar Laravel
setup_laravel() {
    print_header "Configurando Laravel Backend"
    
    # Aguardar MySQL estar pronto
    print_info "Aguardando MySQL inicializar..."
    sleep 15
    
    # Gerar APP_KEY
    print_info "Gerando APP_KEY..."
    docker-compose exec -T backend php artisan key:generate --force || print_warning "APP_KEY já existe"
    
    # Rodar migrations
    print_info "Executando migrations..."
    docker-compose exec -T backend php artisan migrate --force
    
    # Storage link
    print_info "Criando storage link..."
    docker-compose exec -T backend php artisan storage:link || true
    
    # Cache
    print_info "Otimizando cache..."
    docker-compose exec -T backend php artisan config:cache
    docker-compose exec -T backend php artisan route:cache
    docker-compose exec -T backend php artisan view:cache
    
    # Permissões
    print_info "Ajustando permissões..."
    docker-compose exec -T backend chmod -R 775 storage bootstrap/cache
    
    print_success "Laravel configurado"
}

# Verificar saúde da aplicação
health_check() {
    print_header "Verificando Saúde da Aplicação"
    
    # Backend
    print_info "Testando Backend..."
    sleep 5
    if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
        print_success "Backend respondendo"
    else
        print_warning "Backend não respondeu (pode demorar mais alguns segundos)"
    fi
    
    # Frontend
    print_info "Testando Frontend..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend respondendo"
    else
        print_warning "Frontend não respondeu (pode demorar mais alguns segundos)"
    fi
}

# Mostrar URLs de acesso
show_urls() {
    print_header "Deploy Concluído!"
    
    # Obter IP público da EC2
    EC2_IP=$(grep "APP_URL" .env | cut -d'=' -f2 | sed 's|http://||' | sed 's|https://||')
    
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         CardFlow está rodando! 🚀              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo -e ""
    echo -e "${BLUE}📱 Frontend:${NC}     http://$EC2_IP"
    echo -e "${BLUE}🔌 Backend API:${NC}  http://$EC2_IP:8000"
    echo -e "${BLUE}📚 API Docs:${NC}     http://$EC2_IP:8000/api/documentation"
    echo -e "${BLUE}🎤 Voice API:${NC}    http://$EC2_IP:3001"
    echo -e ""
    echo -e "${YELLOW}⚠️  Importante:${NC}"
    echo -e "   • Configure o Security Group para permitir as portas: 80, 443, 8000, 3001"
    echo -e "   • Configure as variáveis de API (Stripe, OpenAI) no arquivo .env"
    echo -e "   • Para produção, configure SSL com: sudo certbot certonly --standalone"
    echo -e ""
    echo -e "${BLUE}📊 Comandos úteis:${NC}"
    echo -e "   • Ver logs:       docker-compose logs -f"
    echo -e "   • Reiniciar:      docker-compose restart"
    echo -e "   • Parar:          docker-compose down"
    echo -e "   • Backup DB:      ./deploy.sh backup"
    echo -e ""
}

# Criar backup do banco de dados
create_backup() {
    print_header "Criando Backup do Banco de Dados"
    
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
    
    docker-compose exec -T mysql mysqldump -u cardflow_user -p${DB_PASSWORD} cardflow_prod > $BACKUP_FILE
    
    if [ -f $BACKUP_FILE ]; then
        print_success "Backup criado: $BACKUP_FILE"
    else
        print_error "Falha ao criar backup"
    fi
}

# Restaurar backup
restore_backup() {
    print_header "Restaurando Backup do Banco de Dados"
    
    if [ -z "$1" ]; then
        print_error "Especifique o arquivo de backup"
        echo "Uso: ./deploy.sh restore backups/backup-20241030.sql"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Arquivo não encontrado: $1"
        exit 1
    fi
    
    print_warning "Isso irá substituir os dados atuais!"
    read -p "Continuar? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
    
    docker-compose exec -T mysql mysql -u cardflow_user -p${DB_PASSWORD} cardflow_prod < $1
    
    print_success "Backup restaurado: $1"
}

# Ver logs
view_logs() {
    print_header "Logs da Aplicação"
    
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f $1
    fi
}

# Menu principal
main_menu() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════╗"
    echo "║     CardFlow - Deploy Script         ║"
    echo "║       AWS EC2 Deployment             ║"
    echo "╚═══════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Escolha uma opção:"
    echo ""
    echo "  1) Deploy completo (primeira vez)"
    echo "  2) Atualizar aplicação"
    echo "  3) Reiniciar containers"
    echo "  4) Ver logs"
    echo "  5) Criar backup do banco"
    echo "  6) Restaurar backup"
    echo "  7) Limpar containers e volumes"
    echo "  8) Status dos containers"
    echo "  0) Sair"
    echo ""
    read -p "Opção: " option
    
    case $option in
        1)
            full_deploy
            ;;
        2)
            update_app
            ;;
        3)
            restart_containers
            ;;
        4)
            view_logs
            ;;
        5)
            create_backup
            ;;
        6)
            read -p "Arquivo de backup: " backup_file
            restore_backup $backup_file
            ;;
        7)
            clean_all
            ;;
        8)
            docker-compose ps
            ;;
        0)
            exit 0
            ;;
        *)
            print_error "Opção inválida"
            main_menu
            ;;
    esac
}

# Deploy completo
full_deploy() {
    check_environment
    check_dependencies
    setup_env
    stop_old_containers
    build_images
    start_containers
    setup_laravel
    health_check
    show_urls
}

# Atualizar aplicação
update_app() {
    print_header "Atualizando Aplicação"
    
    # Pull código (se usar git)
    if [ -d .git ]; then
        print_info "Atualizando código..."
        git pull origin main
    fi
    
    stop_old_containers
    build_images
    start_containers
    setup_laravel
    health_check
    print_success "Aplicação atualizada"
}

# Reiniciar containers
restart_containers() {
    print_header "Reiniciando Containers"
    docker-compose restart
    print_success "Containers reiniciados"
}

# Limpar tudo
clean_all() {
    print_warning "Isso irá remover TODOS os containers, volumes e dados!"
    read -p "Tem certeza? Digite 'sim' para confirmar: " confirm
    
    if [ "$confirm" = "sim" ]; then
        print_info "Removendo containers e volumes..."
        docker-compose down -v
        docker system prune -af
        print_success "Tudo limpo"
    else
        print_info "Operação cancelada"
    fi
}

# ==================================
# MAIN
# ==================================

# Verificar argumentos
if [ $# -eq 0 ]; then
    main_menu
else
    case $1 in
        deploy)
            full_deploy
            ;;
        update)
            update_app
            ;;
        restart)
            restart_containers
            ;;
        logs)
            view_logs $2
            ;;
        backup)
            create_backup
            ;;
        restore)
            restore_backup $2
            ;;
        clean)
            clean_all
            ;;
        *)
            echo "Uso: $0 {deploy|update|restart|logs|backup|restore|clean}"
            exit 1
            ;;
    esac
fi
