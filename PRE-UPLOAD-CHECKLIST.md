# ✅ Checklist Pré-Upload para Servidor

## 📦 Antes de Fazer Upload

### 1. Arquivos Essenciais Presentes

- [x] `docker-compose.yml` - COM volume do .env montado
- [x] `setup-production.sh` - Script de instalação automática
- [x] `backend/Dockerfile` - Configurado e testado
- [x] `frontend/Dockerfile` - Build otimizado
- [x] `voice-ia-service/Dockerfile` - Serviço de IA
- [x] `deploy/nginx/default.conf` - Configuração do Nginx
- [x] `backend/.env.example` - Template de configuração
- [x] `.env.docker.example` - Variáveis do Docker Compose
- [x] `backend/composer.lock` - Dependências PHP travadas
- [x] `frontend/package-lock.json` - Dependências Node travadas

### 2. Arquivos que NÃO Devem Ser Enviados

- [ ] `node_modules/` - Será instalado no servidor
- [ ] `backend/vendor/` - Será instalado no servidor
- [ ] `.git/` - Histórico do Git (opcional)
- [ ] `backend/storage/logs/*` - Logs locais
- [ ] `backend/.env` - Arquivo local (será criado no servidor)
- [ ] Arquivos `.sql` ou backups

### 3. Configurações Verificadas

- [x] `docker-compose.yml` tem volume: `- ./backend/.env:/var/www/.env:ro`
- [x] `docker-compose.yml` tem volume do queue-worker também
- [x] `backend/Dockerfile` copia `.env.example` se não houver `.env`
- [x] Permissões dos scripts: `chmod +x setup-production.sh`

## 🚀 Comandos para Upload

### Opção 1: Upload com rsync (Recomendado)

```bash
# No seu computador local (PowerShell ou Git Bash)
rsync -avz --progress \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='.git' \
  --exclude='backend/storage/logs/*' \
  --exclude='backend/bootstrap/cache/*' \
  --exclude='*.sql' \
  --exclude='*.log' \
  . ubuntu@18.217.114.196:~/cardflow/
```

### Opção 2: Upload com SCP

```bash
# Comprimir primeiro
tar -czf cardflow.tar.gz \
  --exclude='node_modules' \
  --exclude='vendor' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='*.sql' \
  .

# Enviar
scp cardflow.tar.gz ubuntu@18.217.114.196:~/

# No servidor, extrair:
ssh ubuntu@18.217.114.196
tar -xzf cardflow.tar.gz
mv cardflow cardflow-old  # Backup se já existir
mv [diretório extraído] cardflow
```

### Opção 3: Upload Manual Seletivo

```bash
# Arquivos principais
scp docker-compose.yml ubuntu@18.217.114.196:~/cardflow/
scp setup-production.sh ubuntu@18.217.114.196:~/cardflow/
scp .env.docker.example ubuntu@18.217.114.196:~/cardflow/

# Backend
scp -r backend ubuntu@18.217.114.196:~/cardflow/

# Frontend  
scp -r frontend ubuntu@18.217.114.196:~/cardflow/

# Voice IA
scp -r voice-ia-service ubuntu@18.217.114.196:~/cardflow/

# Nginx
scp -r deploy ubuntu@18.217.114.196:~/cardflow/
```

## 🎯 No Servidor (Após Upload)

```bash
# 1. Conectar
ssh ubuntu@18.217.114.196

# 2. Entrar no diretório
cd ~/cardflow

# 3. Dar permissão ao script
chmod +x setup-production.sh

# 4. Executar setup
bash setup-production.sh

# 5. Aguardar conclusão (pode levar 5-10 minutos)

# 6. Verificar se está rodando
docker-compose ps
curl http://localhost/up
curl http://localhost:3000

# 7. Testar pelo IP público
curl http://18.217.114.196/up
```

## ⚙️ Configurações Pós-Deploy

### 1. Configurar IP Público

```bash
nano .env.docker
```

Alterar:
```env
APP_URL=http://18.217.114.196
FRONTEND_URL=http://18.217.114.196:3000
NEXT_PUBLIC_API_URL=http://18.217.114.196
SANCTUM_STATEFUL_DOMAINS=18.217.114.196,18.217.114.196:3000
```

```bash
nano backend/.env
```

Alterar as mesmas linhas.

Depois:
```bash
docker-compose restart backend frontend
```

### 2. Configurar API Keys (Opcional)

```bash
nano backend/.env
```

Adicionar:
```env
OPENAI_API_KEY=sua_chave
ELEVENLABS_API_KEY=sua_chave
STRIPE_KEY=sua_chave
STRIPE_SECRET=sua_chave
```

```bash
docker-compose restart backend voice-ia
```

## 🔍 Verificação Final

```bash
# Status dos containers
docker-compose ps

# Deve mostrar todos como "Up" e "healthy"

# Testar endpoints
curl http://localhost/up
# Deve retornar: {"status":"ok"}

curl http://localhost/api/ping  
# Deve retornar 401 (normal, precisa autenticação)

curl http://localhost:3000
# Deve retornar HTML do Next.js

# Testar pela internet
curl http://18.217.114.196/up
curl http://18.217.114.196:3000
```

## 📝 Logs e Debug

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Ver último erro do Laravel
docker-compose exec backend tail -50 storage/logs/laravel.log
```

## ✅ Checklist Final

- [ ] Todos os arquivos foram enviados
- [ ] `setup-production.sh` executado com sucesso
- [ ] Todos os containers estão rodando (7 containers)
- [ ] Backend responde em `/up`
- [ ] Frontend carrega na porta 3000
- [ ] IP público configurado
- [ ] Firewall configurado (portas 80, 443, 3000, 22)
- [ ] Testado acesso pela internet
- [ ] API keys configuradas (se aplicável)
- [ ] Migrations executadas
- [ ] Sem erros nos logs

## 🎉 Sucesso!

Se todos os itens acima estão ✅, sua aplicação está rodando corretamente!

**URLs de Acesso:**
- Frontend: http://18.217.114.196:3000
- Backend API: http://18.217.114.196/api
- API Docs: http://18.217.114.196/api/documentation
