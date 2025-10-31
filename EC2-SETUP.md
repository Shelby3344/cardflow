# 🚀 Setup Rápido no EC2

## 1. Configurar Variáveis de Ambiente

No servidor EC2, crie o arquivo `.env.docker`:

```bash
cd /home/ubuntu/cardflow

cat > .env.docker << 'EOF'
# Application
APP_ENV=production
APP_DEBUG=false
APP_KEY=
APP_URL=http://seu-ip-ou-dominio

# Database
DB_PASSWORD=cardflow_secure_pass_2024

# Redis
REDIS_PASSWORD=

# Frontend
FRONTEND_URL=http://seu-ip-ou-dominio:3000
SANCTUM_STATEFUL_DOMAINS=localhost,seu-ip-ou-dominio

# Next.js
NEXT_PUBLIC_API_URL=http://seu-ip-ou-dominio
NEXT_PUBLIC_VOICE_API_URL=http://seu-ip-ou-dominio/voice-api

# APIs (obrigatórias)
OPENAI_API_KEY=sk-sua-chave-aqui
ELEVENLABS_API_KEY=sua-chave-aqui

# Stripe
STRIPE_KEY=pk_test_sua-chave
STRIPE_SECRET=sk_test_sua-chave
EOF
```

## 2. Gerar APP_KEY

```bash
# Construir apenas o backend primeiro
docker-compose build backend

# Gerar a chave
APP_KEY=$(docker-compose run --rm backend php artisan key:generate --show)

# Adicionar ao .env.docker
sed -i "s|APP_KEY=|APP_KEY=$APP_KEY|" .env.docker

echo "✅ APP_KEY gerada: $APP_KEY"
```

## 3. Construir e Iniciar

```bash
# Construir todas as imagens
docker-compose build

# Iniciar infraestrutura
docker-compose up -d postgres redis

# Aguardar 15 segundos
sleep 15

# Executar migrações
docker-compose run --rm backend php artisan migrate --force

# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps
```

## 4. Verificar Logs

```bash
# Ver todos os logs
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## 5. Configurar Firewall

```bash
# Abrir portas necessárias
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable
```

## 6. Acessar

- Frontend: http://SEU-IP:3000
- API: http://SEU-IP/api
- Docs: http://SEU-IP/api/documentation

## Troubleshooting

### Se houver erro de build:

```bash
# Limpar e reconstruir
docker-compose down -v
docker system prune -a -f
docker-compose build --no-cache
docker-compose up -d
```

### Se faltar package-lock.json:

```bash
# Criar os arquivos localmente
cd frontend
npm install
cd ../voice-ia-service
npm install
cd ..
git add **/package-lock.json
git commit -m "Add package-lock files"
```

### Remover aviso do version:

Edite `docker-compose.yml` e remova a primeira linha `version: '3.8'`

```bash
sed -i '1d' docker-compose.yml
```
