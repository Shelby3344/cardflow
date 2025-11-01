# 🚀 Guia Completo - Deploy CardFlow na VPS

## 📋 Pré-requisitos

- VPS Ubuntu 20.04/22.04
- Acesso root ou sudo
- Mínimo 2GB RAM
- 20GB de armazenamento
- Portas 80, 443, 3000, 3001 abertas

---

## ⚡ Método 1: Instalação Automática (RECOMENDADO)

### Passo 1: Conectar na VPS

```bash
ssh root@SEU_IP_VPS
# ou
ssh usuario@SEU_IP_VPS
```

### Passo 2: Executar Script Automático

```bash
# Baixar e executar em um comando
curl -fsSL https://raw.githubusercontent.com/Shelby3344/cardflow/main/setup-ec2.sh | bash

# OU baixar primeiro e revisar
wget https://raw.githubusercontent.com/Shelby3344/cardflow/main/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

O script vai instalar tudo automaticamente! ⚡

---

## 🛠️ Método 2: Instalação Manual (Passo a Passo)

### 1️⃣ Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2️⃣ Instalar Docker

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker (opcional, se não for root)
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
```

### 3️⃣ Instalar Docker Compose

```bash
# Baixar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permissão de execução
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalação
docker-compose --version
```

### 4️⃣ Clonar o Repositório

```bash
# Ir para home
cd ~

# Clonar repositório
git clone https://github.com/Shelby3344/cardflow.git

# Entrar na pasta
cd cardflow
```

### 5️⃣ Configurar Variáveis de Ambiente

**Opção A: Usar script automático**
```bash
# Executar o script de configuração
chmod +x setup-ec2.sh
./setup-ec2.sh
```

**Opção B: Configurar manualmente**
```bash
# Copiar arquivo de exemplo
cp backend/.env.example backend/.env

# Editar arquivo .env
nano backend/.env
```

**Configurações obrigatórias no `backend/.env`:**
```env
APP_NAME=CardFlow
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://SEU_IP_VPS

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=cardflow
DB_USERNAME=cardflow
DB_PASSWORD=SenhaSegura123!

REDIS_HOST=redis
REDIS_PORT=6379

# Adicione suas chaves AWS e OpenAI (opcional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
OPENAI_API_KEY=
```

### 6️⃣ Iniciar Docker (IMPORTANTE!)

```bash
# Iniciar todos os containers
docker-compose up -d

# Verificar se está rodando
docker-compose ps
```

**Você deve ver algo assim:**
```
NAME                        STATUS          PORTS
cardflow-backend            Up              0.0.0.0:8000->8000/tcp
cardflow-frontend           Up              0.0.0.0:3000->3000/tcp
cardflow-nginx              Up              0.0.0.0:80->80/tcp
cardflow-postgres           Up              0.0.0.0:5432->5432/tcp
cardflow-redis              Up              0.0.0.0:6379->6379/tcp
cardflow-voice-ia           Up              0.0.0.0:3001->3001/tcp
```

### 7️⃣ Configurar Backend Laravel

```bash
# Gerar chave da aplicação
docker-compose exec backend php artisan key:generate

# Executar migrations
docker-compose exec backend php artisan migrate --force

# Popular banco com dados iniciais (opcional)
docker-compose exec backend php artisan db:seed --force

# Limpar cache
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
```

### 8️⃣ Verificar Logs

```bash
# Ver todos os logs
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

---

## 🎯 Acessar a Aplicação

Após tudo rodando, acesse:

- **Frontend**: http://SEU_IP_VPS:3000
- **Backend API**: http://SEU_IP_VPS/api
- **API Docs**: http://SEU_IP_VPS/api/documentation
- **Nginx (Proxy)**: http://SEU_IP_VPS

---

## 🔧 Comandos Úteis Docker

### Gerenciar Containers

```bash
# Iniciar todos os containers
docker-compose up -d

# Parar todos os containers
docker-compose down

# Reiniciar containers
docker-compose restart

# Ver status
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Parar e remover tudo (CUIDADO!)
docker-compose down -v
```

### Acessar Shell dos Containers

```bash
# Backend (Laravel)
docker-compose exec backend bash

# Frontend (Next.js)
docker-compose exec frontend sh

# Banco de dados (PostgreSQL)
docker-compose exec postgres psql -U cardflow -d cardflow

# Redis
docker-compose exec redis redis-cli
```

### Reconstruir Containers (após mudanças no código)

```bash
# Reconstruir todos
docker-compose up -d --build

# Reconstruir apenas um serviço
docker-compose up -d --build backend
```

---

## 🐛 Solução de Problemas

### Containers não iniciam

```bash
# Ver logs de erro
docker-compose logs backend
docker-compose logs frontend

# Verificar portas em uso
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000

# Matar processo em porta específica
sudo kill -9 $(sudo lsof -t -i:80)
```

### Erro de permissão

```bash
# Dar permissão para storage (Laravel)
docker-compose exec backend chmod -R 775 storage bootstrap/cache
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Resetar banco (CUIDADO - apaga tudo!)
docker-compose down
docker volume rm cardflow-postgres-data
docker-compose up -d
docker-compose exec backend php artisan migrate --force
```

### Frontend mostra erro

```bash
# Verificar variáveis de ambiente
docker-compose exec frontend env | grep NEXT_PUBLIC

# Reconstruir frontend
docker-compose up -d --build frontend
```

---

## 🔒 Configurar HTTPS (SSL)

### Usando Certbot (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Renovação automática
sudo certbot renew --dry-run
```

### Configurar Nginx para SSL

Edite: `deploy/nginx/default.conf`

```nginx
server {
    listen 443 ssl;
    server_name seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    # Resto da configuração...
}
```

Depois reinicie:
```bash
docker-compose restart nginx
```

---

## 📊 Monitoramento

### Ver uso de recursos

```bash
# Ver CPU/RAM dos containers
docker stats

# Ver espaço em disco
df -h
docker system df
```

### Limpar recursos não utilizados

```bash
# Limpar containers parados
docker container prune -f

# Limpar imagens não utilizadas
docker image prune -a -f

# Limpar tudo (CUIDADO!)
docker system prune -a --volumes -f
```

---

## 🔄 Atualizar Aplicação

```bash
# 1. Entrar na pasta
cd ~/cardflow

# 2. Fazer pull das mudanças
git pull origin main

# 3. Reconstruir containers
docker-compose up -d --build

# 4. Executar migrations (se houver)
docker-compose exec backend php artisan migrate --force

# 5. Limpar cache
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
```

---

## 📝 Checklist de Deploy

- [ ] VPS criada e acessível via SSH
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Repositório clonado
- [ ] Arquivo `.env` configurado
- [ ] Containers iniciados com `docker-compose up -d`
- [ ] APP_KEY gerado
- [ ] Migrations executadas
- [ ] Aplicação acessível no navegador
- [ ] Logs sem erros críticos
- [ ] SSL configurado (opcional)
- [ ] Firewall configurado
- [ ] Backup configurado (opcional)

---

## 🆘 Suporte

Se precisar de ajuda:

1. Verifique os logs: `docker-compose logs -f`
2. Abra uma issue no GitHub
3. Consulte a documentação do Docker

---

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Desenvolvido com ❤️ - CardFlow Team**
