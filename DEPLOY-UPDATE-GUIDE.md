# 🚀 Guia de Atualização - CardFlow VPS

Este guia explica como atualizar o sistema CardFlow na VPS usando Docker.

## 📋 Pré-requisitos

- Acesso SSH à VPS
- Docker e Docker Compose instalados na VPS
- Backup recente (recomendado)

## 🔧 Método 1: Atualização Automática (Recomendado)

### Passo 1: Enviar arquivos para VPS

Na sua máquina local (Windows), execute:

```powershell
# Compactar projeto (excluindo node_modules e vendor)
Compress-Archive -Path "c:\Users\zucks\OneDrive\Área de Trabalho\fg\cardflow\*" -DestinationPath cardflow-update.zip -Force

# Enviar para VPS via SCP
scp cardflow-update.zip usuario@seu-servidor.com:/home/usuario/
```

### Passo 2: Na VPS, extrair e atualizar

Conecte via SSH:

```bash
ssh usuario@seu-servidor.com
```

Execute os comandos:

```bash
# Ir para o diretório do projeto
cd /caminho/do/cardflow

# Fazer backup
./deploy-update.sh

# OU manualmente:

# 1. Backup do banco
docker-compose exec postgres pg_dump -U cardflow cardflow > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Extrair arquivos novos
unzip -o ~/cardflow-update.zip -d /tmp/cardflow-new

# 3. Parar containers
docker-compose down

# 4. Copiar arquivos novos (exceto .env)
rsync -av --exclude='.env' --exclude='node_modules' --exclude='vendor' /tmp/cardflow-new/ ./

# 5. Rebuild e iniciar
docker-compose build --no-cache
docker-compose up -d

# 6. Executar migrations
docker-compose exec backend php artisan migrate --force

# 7. Limpar cache
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:cache

# 8. Verificar status
docker-compose ps
```

## 🔄 Método 2: Atualização via Git (Se usar repositório)

### Passo 1: Conectar à VPS

```bash
ssh usuario@seu-servidor.com
cd /caminho/do/cardflow
```

### Passo 2: Atualizar código

```bash
# Backup do banco
docker-compose exec postgres pg_dump -U cardflow cardflow > backup_$(date +%Y%m%d_%H%M%S).sql

# Parar containers
docker-compose down

# Atualizar código
git pull origin main

# Rebuild e iniciar
docker-compose build
docker-compose up -d

# Executar migrations
docker-compose exec backend php artisan migrate --force

# Limpar e otimizar
docker-compose exec backend php artisan optimize:clear
docker-compose exec backend php artisan optimize
```

## 📦 Método 3: Atualização Manual Simplificada

### Na sua máquina Windows:

```powershell
# Criar arquivo de transferência
cd "c:\Users\zucks\OneDrive\Área de Trabalho\fg\cardflow"

# Criar .zip excluindo pastas grandes
$exclude = @('node_modules', 'vendor', '.git', '.next', 'storage/logs')
Get-ChildItem -Exclude $exclude | Compress-Archive -DestinationPath cardflow-slim.zip -Force
```

### Na VPS:

```bash
# Receber arquivo (via SCP, FTP ou upload manual)

# No servidor
cd /var/www/cardflow  # ou seu caminho

# Backup
docker-compose exec postgres pg_dump -U cardflow cardflow > backup.sql

# Parar
docker-compose down

# Extrair novos arquivos
unzip -o cardflow-slim.zip

# Iniciar
docker-compose up -d --build

# Migrations
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan optimize
```

## 🔍 Verificação Pós-Atualização

### 1. Verificar containers rodando:

```bash
docker-compose ps
```

Todos devem estar "Up" e "healthy".

### 2. Verificar logs:

```bash
# Logs gerais
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 3. Testar endpoints:

```bash
# Backend API
curl http://localhost:8000/api/health

# Frontend
curl http://localhost:3000
```

### 4. Verificar banco de dados:

```bash
docker-compose exec postgres psql -U cardflow -d cardflow -c "SELECT COUNT(*) FROM users;"
```

## 🆘 Rollback (Se necessário)

Se algo der errado:

```bash
# Parar containers
docker-compose down

# Restaurar backup do banco
cat backup_YYYYMMDD_HHMMSS.sql | docker-compose exec -T postgres psql -U cardflow cardflow

# Reverter código (se usar git)
git reset --hard HEAD~1

# Ou restaurar arquivos do backup anterior

# Reiniciar
docker-compose up -d
```

## 📝 Checklist Completo

- [ ] Backup do banco de dados criado
- [ ] Backup dos arquivos .env salvos
- [ ] Código atualizado na VPS
- [ ] Containers parados com `docker-compose down`
- [ ] Imagens reconstruídas com `--build`
- [ ] Containers iniciados com `docker-compose up -d`
- [ ] Migrations executadas
- [ ] Cache limpo e otimizado
- [ ] Logs verificados sem erros
- [ ] Frontend acessível
- [ ] Backend API respondendo
- [ ] Login funcionando
- [ ] Criação de cards testada

## 🔐 Variáveis de Ambiente (.env)

**IMPORTANTE**: Nunca substitua o `.env` da produção! Apenas atualize variáveis novas se necessário.

Para adicionar novas variáveis:

```bash
# Editar .env na VPS
nano .env

# Adicionar novas variáveis necessárias

# Recarregar configuração
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan config:cache
```

## 📊 Comandos Úteis

```bash
# Ver logs em tempo real
docker-compose logs -f --tail=100

# Reiniciar apenas um serviço
docker-compose restart backend

# Ver uso de recursos
docker stats

# Limpar volumes órfãos
docker volume prune

# Limpar imagens antigas
docker image prune -a

# Entrar no container
docker-compose exec backend bash
docker-compose exec frontend sh

# Executar comandos artisan
docker-compose exec backend php artisan migrate:status
docker-compose exec backend php artisan route:list
```

## 🐛 Troubleshooting

### Container não inicia:

```bash
docker-compose logs nome-do-container
```

### Erro de permissão:

```bash
docker-compose exec backend chown -R www-data:www-data storage bootstrap/cache
```

### Banco não conecta:

```bash
# Verificar se postgres está rodando
docker-compose ps postgres

# Reiniciar postgres
docker-compose restart postgres
```

### Frontend não carrega:

```bash
# Rebuild do frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## 📞 Suporte

Em caso de problemas, verificar:
1. Logs: `docker-compose logs`
2. Status: `docker-compose ps`
3. Recursos: `docker stats`
4. Disco: `df -h`
