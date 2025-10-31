# 🐳 CardFlow - Guia Docker

Guia completo para executar o CardFlow usando Docker e Docker Compose.

## 📋 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) 20.10 ou superior
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0 ou superior
- 4GB de RAM livres (mínimo recomendado)
- 10GB de espaço em disco

## 🚀 Início Rápido

### Windows (PowerShell)

```powershell
# 1. Copiar arquivo de configuração
Copy-Item .env.docker.example .env.docker

# 2. Editar configurações (especialmente APP_KEY e API keys)
notepad .env.docker

# 3. Executar script de inicialização
.\start-docker.ps1
```

### Linux/Mac (Bash)

```bash
# 1. Copiar arquivo de configuração
cp .env.docker.example .env.docker

# 2. Editar configurações
nano .env.docker  # ou vim, code, etc.

# 3. Dar permissão de execução e executar
chmod +x start-docker.sh
./start-docker.sh
```

### Método Manual

```bash
# 1. Configurar ambiente
cp .env.docker.example .env.docker
# Edite o arquivo .env.docker

# 2. Construir e iniciar
docker-compose up -d

# 3. Executar migrações
docker-compose exec backend php artisan migrate --force

# 4. Otimizar (opcional)
docker-compose exec backend php artisan config:cache
```

## 🏗️ Arquitetura

O ambiente Docker é composto por 7 serviços:

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│                   localhost:3000                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│                   Nginx (Reverse Proxy)              │
│                     localhost:80                     │
└──────┬──────────────────────────────┬────────────────┘
       │                              │
       ↓                              ↓
┌──────────────────┐        ┌─────────────────────────┐
│  Backend (Laravel) │        │  Voice IA (Node.js)     │
│    PHP-FPM 8.2    │        │   Express Server        │
└────┬─────────────┘        └─────────────────────────┘
     │
     ├─────────────┬─────────────────┐
     ↓             ↓                 ↓
┌─────────┐  ┌─────────┐  ┌──────────────────┐
│PostgreSQL│  │  Redis  │  │  Queue Worker   │
│   :5432  │  │  :6379  │  │   (Laravel)     │
└─────────┘  └─────────┘  └──────────────────┘
```

## 📦 Serviços

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| `frontend` | 3000 | Aplicação Next.js (interface do usuário) |
| `nginx` | 80, 443 | Servidor web e reverse proxy |
| `backend` | 9000* | API Laravel (PHP-FPM) |
| `queue-worker` | - | Worker de filas Laravel |
| `voice-ia` | 3001 | Microserviço de IA de voz |
| `postgres` | 5432 | Banco de dados PostgreSQL |
| `redis` | 6379 | Cache e filas |

*Porta interna (não exposta)

## 🔧 Configuração

### Variáveis de Ambiente Importantes

Edite o arquivo `.env.docker`:

```bash
# Chave da aplicação (gerada automaticamente)
APP_KEY=base64:...

# APIs externas (obrigatórias para funcionalidades completas)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# Pagamentos Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# Banco de dados (pode manter padrão para desenvolvimento)
DB_PASSWORD=cardflow_secure_pass_2024

# URLs públicas (ajustar para produção)
APP_URL=http://localhost
FRONTEND_URL=http://localhost:3000
```

## 📝 Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver status de todos os serviços
docker-compose ps

# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart backend

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
```

### Backend (Laravel)

```bash
# Executar migrações
docker-compose exec backend php artisan migrate

# Executar seeders
docker-compose exec backend php artisan db:seed

# Limpar cache
docker-compose exec backend php artisan cache:clear

# Gerar nova APP_KEY
docker-compose run --rm backend php artisan key:generate

# Acessar console do Laravel
docker-compose exec backend php artisan tinker

# Executar testes
docker-compose exec backend php artisan test
```

### Banco de Dados

```bash
# Conectar ao PostgreSQL
docker-compose exec postgres psql -U cardflow -d cardflow

# Backup do banco de dados
docker-compose exec postgres pg_dump -U cardflow cardflow > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U cardflow cardflow < backup.sql

# Ver logs do PostgreSQL
docker-compose logs -f postgres
```

### Redis

```bash
# Conectar ao Redis CLI
docker-compose exec redis redis-cli

# Limpar todo o cache Redis
docker-compose exec redis redis-cli FLUSHALL

# Ver informações do Redis
docker-compose exec redis redis-cli INFO
```

### Frontend (Next.js)

```bash
# Reconstruir frontend
docker-compose up -d --build frontend

# Ver logs do frontend
docker-compose logs -f frontend

# Acessar shell do container
docker-compose exec frontend sh
```

## 🐛 Troubleshooting

### Containers não iniciam

```bash
# Ver logs detalhados
docker-compose logs

# Verificar erros de um serviço específico
docker-compose logs backend

# Reconstruir imagens
docker-compose build --no-cache
docker-compose up -d
```

### Erro de conexão com banco de dados

```bash
# Verificar se PostgreSQL está pronto
docker-compose exec postgres pg_isready

# Reiniciar serviços de banco de dados
docker-compose restart postgres redis

# Aguardar e tentar novamente
docker-compose exec backend php artisan migrate
```

### Erro "APP_KEY not set"

```bash
# Gerar nova chave
docker-compose run --rm backend php artisan key:generate --show

# Copiar a chave gerada e adicionar ao .env.docker
# Depois reiniciar
docker-compose restart backend
```

### Porta já em uso

```bash
# Verificar processos usando as portas
# Windows PowerShell
netstat -ano | findstr :3000
netstat -ano | findstr :80

# Linux/Mac
lsof -i :3000
lsof -i :80

# Alterar portas no docker-compose.yml se necessário
```

### Problemas de permissão (Linux/Mac)

```bash
# Dar permissões corretas
sudo chown -R $USER:$USER backend/storage
sudo chown -R $USER:$USER backend/bootstrap/cache

# Ou executar com permissões apropriadas
sudo docker-compose up -d
```

### Limpar tudo e recomeçar

```bash
# Parar e remover tudo (CUIDADO: apaga dados!)
docker-compose down -v

# Remover imagens antigas
docker-compose down --rmi all -v

# Limpar sistema Docker
docker system prune -a --volumes

# Reconstruir do zero
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Segurança em Produção

Antes de usar em produção:

1. **Variáveis de Ambiente**
   - Gere senhas fortes para `DB_PASSWORD` e `REDIS_PASSWORD`
   - Use `APP_DEBUG=false`
   - Configure `APP_ENV=production`

2. **SSL/TLS**
   - Configure certificados SSL no Nginx
   - Descomente configuração HTTPS em `deploy/nginx/default.conf`
   - Use Let's Encrypt ou certificados próprios

3. **Firewall**
   - Feche portas desnecessárias
   - Mantenha apenas 80 e 443 abertas
   - Use VPN ou whitelist para acessar banco de dados

4. **Backup**
   - Configure backups automáticos do PostgreSQL
   - Faça backup dos volumes Docker regularmente

5. **Monitoramento**
   - Configure logs centralizados
   - Use ferramentas de monitoramento (Prometheus, Grafana)
   - Configure alertas para erros críticos

## 📊 Monitoramento

### Ver uso de recursos

```bash
# Uso de CPU e memória
docker stats

# Espaço em disco dos volumes
docker system df -v

# Listar volumes
docker volume ls
```

### Health Checks

```bash
# Status de saúde dos containers
docker-compose ps

# Verificar logs de health check
docker inspect cardflow-backend | grep -A 10 Health
```

## 🔄 Atualizações

```bash
# Atualizar código e reconstruir
git pull
docker-compose build
docker-compose up -d

# Executar migrações pendentes
docker-compose exec backend php artisan migrate --force

# Limpar cache
docker-compose exec backend php artisan optimize:clear
docker-compose exec backend php artisan optimize
```

## 📚 Recursos Adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Laravel Docker Best Practices](https://laravel.com/docs/deployment)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Consulte a seção de Troubleshooting acima
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ pela equipe CardFlow**
