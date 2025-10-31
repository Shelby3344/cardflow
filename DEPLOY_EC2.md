# 🚀 Deploy CardFlow no EC2

## Guia Completo de Deploy na Amazon EC2

### 📋 Pré-requisitos

- Instância EC2 Ubuntu 22.04 criada
- IP do servidor: `18.217.114.196`
- Acesso SSH configurado
- Portas 80, 443 e 22 abertas no Security Group

---

## 🔧 Opção 1: Deploy Automático (Recomendado)

### 1. Conectar ao servidor EC2

```bash
ssh -i sua-chave.pem ubuntu@18.217.114.196
```

### 2. Executar deploy automático (um único comando)

```bash
curl -fsSL https://raw.githubusercontent.com/Shelby3344/cardflow/main/deploy-ec2.sh | bash
```

**OU** se preferir revisar o script antes:

```bash
# Baixar o script
curl -fsSL https://raw.githubusercontent.com/Shelby3344/cardflow/main/deploy-ec2.sh -o deploy-ec2.sh

# Revisar o conteúdo (opcional)
cat deploy-ec2.sh

# Dar permissão de execução
chmod +x deploy-ec2.sh

# Executar o script
./deploy-ec2.sh
```

O script vai:
- ✅ Instalar Docker e Docker Compose
- ✅ Clonar o repositório do GitHub
- ✅ Configurar o arquivo .env automaticamente
- ✅ Iniciar todos os containers
- ✅ Executar migrations e seeders
- ✅ Gerar chaves de segurança
- ✅ Configurar firewall

### 3. Pronto! 🎉

Acesse: **http://18.217.114.196**

---

## 🛠️ Opção 2: Deploy Manual

### 1. Conectar ao servidor

```bash
ssh -i sua-chave.pem ubuntu@18.217.114.196
```

### 2. Atualizar sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 3. Instalar Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker
```

### 4. Instalar Docker Compose

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 5. Clonar o repositório

```bash
cd ~
git clone https://github.com/Shelby3344/cardflow.git
cd cardflow
```

### 6. Configurar arquivo .env

```bash
# Copiar o exemplo
cp .env.example .env

# Editar com nano ou vim
nano .env
```

Configurar:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://18.217.114.196

POSTGRES_PASSWORD=cardflow_dev_secret_2025
REDIS_PASSWORD=redis_dev_secret_2025

NEXT_PUBLIC_API_URL=http://18.217.114.196/api
NEXT_PUBLIC_VOICE_API_URL=http://18.217.114.196:3001
```

### 7. Iniciar containers

```bash
docker-compose up -d --build
```

### 8. Aguardar containers iniciarem

```bash
# Aguardar 30 segundos
sleep 30

# Verificar status
docker-compose ps
```

### 9. Configurar Laravel

```bash
# Gerar APP_KEY
docker-compose exec backend php artisan key:generate --force

# Gerar JWT Secret
docker-compose exec backend php artisan jwt:secret --force

# Executar migrations
docker-compose exec backend php artisan migrate --force

# Executar seeders
docker-compose exec backend php artisan db:seed --force

# Limpar e cachear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

### 10. Configurar firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

---

## 📱 Acessar a Aplicação

Abra no navegador: **http://18.217.114.196**

### Credenciais padrão (após seeders):
- Email: `admin@cardflow.com`
- Senha: `password`

---

## 🔍 Comandos Úteis

### Ver logs em tempo real
```bash
docker-compose logs -f
```

### Ver logs de um serviço específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Reiniciar containers
```bash
docker-compose restart
```

### Parar containers
```bash
docker-compose down
```

### Parar e remover volumes (⚠️ apaga dados)
```bash
docker-compose down -v
```

### Status dos containers
```bash
docker-compose ps
```

### Executar comandos no backend
```bash
docker-compose exec backend php artisan <comando>
```

### Acessar terminal do container
```bash
docker-compose exec backend bash
```

---

## 🔄 Atualizar a Aplicação

### Método rápido
```bash
cd ~/cardflow
git pull origin main
docker-compose down
docker-compose up -d --build
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan config:cache
```

### Ou re-executar o script de deploy
```bash
./deploy-ec2.sh
```

---

## 🐛 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

### Erro de porta em uso
```bash
# Ver processos usando porta 80
sudo lsof -i :80
sudo lsof -i :443

# Matar processo se necessário
sudo kill -9 <PID>
```

### Erro de permissão no Docker
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker ubuntu
newgrp docker
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker system prune -a --volumes -f
./deploy-ec2.sh
```

### Verificar saúde dos containers
```bash
docker-compose ps
docker inspect cardflow-backend-1 | grep Health
docker inspect cardflow-postgres-1 | grep Health
```

---

## 🔐 Segurança

### Alterar senhas padrão

Edite o arquivo `.env`:
```bash
nano .env
```

Mude:
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `APP_KEY` (gerar nova: `docker-compose exec backend php artisan key:generate`)

Depois reinicie:
```bash
docker-compose down
docker-compose up -d
```

### Habilitar SSL/HTTPS

1. Obter certificado SSL (Let's Encrypt):
```bash
sudo apt-get install certbot
sudo certbot certonly --standalone -d seudominio.com
```

2. Configurar Nginx com SSL (editar `deploy/nginx/default.conf`)

3. Reiniciar containers

---

## 📊 Monitoramento

### Uso de recursos
```bash
docker stats
```

### Espaço em disco
```bash
df -h
docker system df
```

### Memória
```bash
free -h
```

---

## 💾 Backup

### Backup do banco de dados
```bash
docker-compose exec postgres pg_dump -U cardflow cardflow > backup-$(date +%Y%m%d).sql
```

### Restaurar backup
```bash
cat backup.sql | docker-compose exec -T postgres psql -U cardflow cardflow
```

---

## 📞 Suporte

Em caso de problemas:
1. Verificar logs: `docker-compose logs -f`
2. Verificar status: `docker-compose ps`
3. Verificar .env: `cat .env`
4. Reiniciar: `docker-compose restart`

---

## ✅ Checklist Pós-Deploy

- [ ] Aplicação acessível em http://18.217.114.196
- [ ] Login funcionando
- [ ] Criar deck funciona
- [ ] Criar card funciona
- [ ] Sistema de estudo funciona
- [ ] Barra de progresso aparece
- [ ] Confiança sendo calculada
- [ ] Voice IA funcionando (porta 3001)

---

**Bom deploy! 🚀**
