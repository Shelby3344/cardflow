# 🚀 Guia de Deploy do CardFlow

Este guia contém instruções completas para fazer deploy do CardFlow em um servidor de produção.

## 📋 Pré-requisitos

### No Servidor
- Ubuntu 20.04+ ou Debian 11+
- Docker 20.10+
- Docker Compose v2+
- Pelo menos 2GB de RAM
- 20GB de espaço em disco

### Instalar Docker (se necessário)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Instalar Docker Compose (se necessário)
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 📦 Passos para Deploy

### 1. Fazer Upload dos Arquivos

**No seu computador local:**

```bash
# Comprimir o projeto (excluindo node_modules e outros arquivos grandes)
tar -czf cardflow.tar.gz \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='.git' \
  --exclude='backend/storage/logs/*' \
  --exclude='backend/bootstrap/cache/*' \
  .

# Fazer upload para o servidor
scp cardflow.tar.gz ubuntu@SEU_IP:~/

# OU usar rsync (mais eficiente)
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='.git' \
  --exclude='backend/storage/logs/*' \
  . ubuntu@SEU_IP:~/cardflow/
```

### 2. Extrair e Configurar no Servidor

**No servidor:**

```bash
# Se enviou o .tar.gz
cd ~
tar -xzf cardflow.tar.gz
cd cardflow

# Dar permissão de execução ao script
chmod +x setup-production.sh

# Executar o script de setup
bash setup-production.sh
```

O script `setup-production.sh` irá:
- ✅ Verificar dependências
- ✅ Criar estrutura de diretórios
- ✅ Configurar permissões
- ✅ Criar arquivo `.env`
- ✅ Build das imagens Docker
- ✅ Iniciar containers
- ✅ Gerar APP_KEY do Laravel
- ✅ Executar migrations
- ✅ Configurar caches
- ✅ Testar todos os serviços

### 3. Configurar Variáveis de Ambiente (Opcional)

Edite o arquivo `.env.docker` para configurar:

```bash
nano .env.docker
```

Configure:
- `APP_URL` - URL pública do seu servidor
- `FRONTEND_URL` - URL do frontend
- `OPENAI_API_KEY` - Chave da OpenAI (para IA de voz)
- `ELEVENLABS_API_KEY` - Chave da ElevenLabs (para síntese de voz)
- `STRIPE_KEY` - Chave pública do Stripe
- `STRIPE_SECRET` - Chave secreta do Stripe

Após configurar, reinicie os serviços:

```bash
docker-compose restart backend queue-worker voice-ia
```

### 4. Configurar Firewall

```bash
# Permitir HTTP
sudo ufw allow 80/tcp

# Permitir HTTPS (se for configurar SSL)
sudo ufw allow 443/tcp

# Permitir SSH
sudo ufw allow 22/tcp

# Ativar firewall
sudo ufw enable
```

### 5. Verificar Status

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Testar endpoints
curl http://localhost/up
curl http://localhost/api/ping
curl http://localhost:3000
```

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Parar todos os containers
docker-compose down

# Iniciar todos os containers
docker-compose up -d

# Reiniciar um serviço específico
docker-compose restart backend

# Ver logs de um serviço
docker-compose logs -f backend

# Executar comando no container
docker-compose exec backend php artisan migrate
```

### Laravel (Backend)

```bash
# Limpar caches
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear

# Executar migrations
docker-compose exec backend php artisan migrate

# Criar novo usuário admin
docker-compose exec backend php artisan tinker
# > User::create(['name' => 'Admin', 'email' => 'admin@cardflow.com', 'password' => bcrypt('senha')]);
```

### Backup do Banco de Dados

```bash
# Fazer backup
docker-compose exec postgres pg_dump -U cardflow cardflow > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U cardflow cardflow < backup.sql
```

## 🔐 Configurar SSL (HTTPS)

### Usando Let's Encrypt (Certbot)

```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot

# Gerar certificado
sudo certbot certonly --standalone -d seu-dominio.com

# Certificados estarão em:
# /etc/letsencrypt/live/seu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/seu-dominio.com/privkey.pem

# Copiar certificados
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem deploy/nginx/ssl/
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem deploy/nginx/ssl/

# Descomentar configuração SSL no nginx
nano deploy/nginx/default.conf
# (Descomentar seção HTTPS)

# Reiniciar nginx
docker-compose restart nginx
```

## 📊 Monitoramento

### Ver uso de recursos

```bash
# CPU e Memória de todos os containers
docker stats

# Espaço em disco
df -h

# Logs do sistema
sudo journalctl -u docker -f
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar saúde dos containers
docker-compose ps

# Reiniciar container problemático
docker-compose restart backend
```

### Erro 500 no Backend

```bash
# Ver logs do Laravel
docker-compose exec backend cat storage/logs/laravel.log

# Limpar caches
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
```

### Banco de dados não conecta

```bash
# Verificar se postgres está rodando
docker-compose ps postgres

# Ver logs do postgres
docker-compose logs postgres

# Testar conexão
docker-compose exec backend php artisan tinker
# > DB::connection()->getPdo();
```

### Permissões de arquivo

```bash
# Corrigir permissões
sudo chmod -R 777 backend/storage
sudo chmod -R 775 backend/bootstrap/cache
```

## 🔄 Atualizar Aplicação

```bash
# Fazer backup do banco primeiro!

# Parar containers
docker-compose down

# Atualizar código
git pull  # ou fazer upload dos novos arquivos

# Rebuild das imagens
docker-compose build --no-cache

# Iniciar containers
docker-compose up -d

# Executar migrations
docker-compose exec backend php artisan migrate --force

# Limpar caches
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
```

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique o status: `docker-compose ps`
3. Teste a conectividade: `curl http://localhost/up`
4. Verifique permissões dos diretórios `storage/` e `bootstrap/cache/`

## 📝 Checklist Pós-Deploy

- [ ] Todos os containers estão rodando (`docker-compose ps`)
- [ ] Backend responde: `curl http://localhost/up`
- [ ] API responde: `curl http://localhost/api/ping`
- [ ] Frontend carrega: `curl http://localhost:3000`
- [ ] Migrations executadas
- [ ] APP_KEY configurada
- [ ] Firewall configurado
- [ ] SSL configurado (produção)
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] API keys configuradas (OPENAI, ELEVENLABS, STRIPE)

---

**✅ Pronto! Seu CardFlow está rodando em produção!**
