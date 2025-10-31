# 🚀 Deploy Rápido - CardFlow

## ⚡ Instruções Rápidas para Deploy

### 1️⃣ No Servidor (Primeira Vez)

```bash
# Conectar ao servidor
ssh ubuntu@SEU_IP

# Instalar Docker (se necessário)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# IMPORTANTE: Faça logout e login novamente após adicionar ao grupo docker

# Verificar instalação
docker --version
docker-compose --version
```

### 2️⃣ Upload dos Arquivos

**Opção A - Usando SCP (do seu computador):**
```bash
scp docker-compose.yml ubuntu@SEU_IP:~/cardflow/
scp setup-production.sh ubuntu@SEU_IP:~/cardflow/
scp -r backend ubuntu@SEU_IP:~/cardflow/
scp -r frontend ubuntu@SEU_IP:~/cardflow/
scp -r voice-ia-service ubuntu@SEU_IP:~/cardflow/
scp -r deploy ubuntu@SEU_IP:~/cardflow/
```

**Opção B - Usando rsync (mais rápido):**
```bash
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='.git' \
  --exclude='backend/storage/logs/*' \
  --exclude='backend/bootstrap/cache/*' \
  . ubuntu@SEU_IP:~/cardflow/
```

### 3️⃣ Executar Setup Automático

```bash
# No servidor
cd ~/cardflow
chmod +x setup-production.sh
bash setup-production.sh
```

**Pronto! 🎉** O script faz tudo automaticamente:
- ✅ Cria diretórios
- ✅ Configura permissões
- ✅ Build das imagens
- ✅ Inicia containers
- ✅ Gera APP_KEY
- ✅ Executa migrations
- ✅ Testa serviços

### 4️⃣ Configurar IP Público (Importante!)

```bash
# Editar .env.docker
nano .env.docker

# Alterar:
APP_URL=http://SEU_IP_PUBLICO
FRONTEND_URL=http://SEU_IP_PUBLICO:3000
NEXT_PUBLIC_API_URL=http://SEU_IP_PUBLICO
SANCTUM_STATEFUL_DOMAINS=SEU_IP_PUBLICO,SEU_IP_PUBLICO:3000

# Editar backend/.env
nano backend/.env

# Alterar:
APP_URL=http://SEU_IP_PUBLICO
FRONTEND_URL=http://SEU_IP_PUBLICO:3000
SANCTUM_STATEFUL_DOMAINS=SEU_IP_PUBLICO,SEU_IP_PUBLICO:3000

# Reiniciar serviços
docker-compose restart backend frontend
```

### 5️⃣ Abrir Portas no Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 6️⃣ Testar

```bash
# Backend
curl http://localhost/up

# Frontend
curl http://localhost:3000

# Pela internet
curl http://SEU_IP_PUBLICO/up
curl http://SEU_IP_PUBLICO:3000
```

---

## 🔄 Atualizar Aplicação

```bash
# Fazer upload dos novos arquivos (rsync ou scp)
# Depois executar:

cd ~/cardflow
docker-compose down
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan config:cache
```

---

## 🆘 Se Algo Der Errado

```bash
# Ver logs
docker-compose logs -f backend

# Reiniciar tudo
docker-compose down
bash setup-production.sh

# Verificar permissões
sudo chmod -R 777 backend/storage
sudo chmod -R 775 backend/bootstrap/cache

# Limpar tudo e recomeçar
docker-compose down -v
rm -rf backend/storage/logs/*
rm -rf backend/bootstrap/cache/*
bash setup-production.sh
```

---

## 📱 Acessar a Aplicação

- **Frontend:** http://SEU_IP:3000
- **Backend API:** http://SEU_IP/api
- **API Docs:** http://SEU_IP/api/documentation

---

## ✅ Checklist

- [ ] Docker instalado
- [ ] Arquivos enviados para o servidor
- [ ] `setup-production.sh` executado com sucesso
- [ ] Todos os containers rodando (`docker-compose ps`)
- [ ] Backend respondendo (`curl http://localhost/up`)
- [ ] Frontend carregando (`curl http://localhost:3000`)
- [ ] IP público configurado em `.env.docker` e `backend/.env`
- [ ] Firewall configurado
- [ ] Testado acesso pela internet

---

**🎉 Tudo pronto! Sua aplicação está rodando!**
