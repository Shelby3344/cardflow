# 🔧 CardFlow Docker - Guia de Troubleshooting

Soluções para problemas comuns ao executar o CardFlow com Docker.

## 📋 Índice

- [Problemas de Instalação](#problemas-de-instalação)
- [Problemas de Inicialização](#problemas-de-inicialização)
- [Erros de Conexão](#erros-de-conexão)
- [Problemas de Performance](#problemas-de-performance)
- [Erros Específicos](#erros-específicos)
- [Limpeza e Reset](#limpeza-e-reset)

---

## Problemas de Instalação

### Docker não está instalado ou não inicia

**Sintomas:**
```
docker: command not found
```

**Solução Windows:**
1. Baixe e instale [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
2. Reinicie o computador
3. Inicie o Docker Desktop
4. Aguarde o ícone ficar verde na bandeja do sistema

**Solução Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

**Solução Mac:**
1. Baixe e instale [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
2. Abra o Docker Desktop
3. Aguarde inicializar completamente

### Docker Compose não encontrado

**Sintomas:**
```
docker-compose: command not found
```

**Solução (Docker Desktop):**
Docker Compose já vem incluído, use:
```bash
docker compose up -d
```

**Solução (Linux - instalação manual):**
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## Problemas de Inicialização

### Porta 80 já está em uso

**Sintomas:**
```
Error: bind: address already in use
```

**Solução Windows (IIS):**
```powershell
# Parar IIS
iisreset /stop

# Ou desabilitar permanentemente
Set-Service -Name W3SVC -StartupType Disabled
```

**Solução Windows (outras aplicações):**
```powershell
# Descobrir qual processo está usando a porta 80
netstat -ano | findstr :80

# Matar o processo (substitua PID pelo número encontrado)
taskkill /PID [PID] /F
```

**Solução alternativa - Alterar porta:**
Edite `docker-compose.yml`:
```yaml
nginx:
  ports:
    - "8080:80"  # Usar porta 8080 ao invés de 80
```

### Porta 3000 já está em uso

**Sintomas:**
```
Error starting userland proxy: listen tcp 0.0.0.0:3000: bind: address already in use
```

**Solução:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Ou alterar porta no docker-compose.yml
```

### Erro "APP_KEY not set"

**Sintomas:**
```
No application encryption key has been specified
```

**Solução:**
```bash
# Gerar chave
docker-compose run --rm backend php artisan key:generate --show

# Copiar resultado (exemplo: base64:xxxxxxxxxxxx)
# Editar .env.docker e substituir APP_KEY

# Windows
notepad .env.docker

# Linux/Mac
nano .env.docker

# Reiniciar
docker-compose restart backend
```

### Containers não iniciam

**Sintomas:**
```
ERROR: Service 'backend' failed to build
```

**Solução:**
```bash
# Ver logs detalhados
docker-compose logs backend

# Reconstruir sem cache
docker-compose build --no-cache backend

# Verificar espaço em disco
docker system df

# Limpar recursos não utilizados
docker system prune -a
```

---

## Erros de Conexão

### Backend não conecta ao PostgreSQL

**Sintomas:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Aguardar PostgreSQL estar pronto (15-30 segundos)
docker-compose up -d postgres
sleep 20
docker-compose up -d backend

# Testar conexão manualmente
docker-compose exec postgres pg_isready -U cardflow
```

### Redis não conecta

**Sintomas:**
```
Connection refused [tcp://redis:6379]
```

**Solução:**
```bash
# Verificar se Redis está rodando
docker-compose ps redis

# Reiniciar Redis
docker-compose restart redis

# Testar conexão
docker-compose exec redis redis-cli ping
# Deve retornar: PONG
```

### Frontend não consegue acessar API

**Sintomas:**
```
Network Error
Failed to fetch
```

**Solução:**

1. Verificar variáveis de ambiente do frontend:
```bash
# Verificar .env.docker
cat .env.docker | grep NEXT_PUBLIC_API_URL

# Deve ser: http://localhost (sem /api no final)
```

2. Verificar se Nginx está rodando:
```bash
docker-compose ps nginx
docker-compose logs nginx
```

3. Testar API manualmente:
```bash
curl http://localhost/api/health
# Ou abrir no navegador
```

4. Verificar CORS no backend:
```bash
# Editar backend/config/cors.php se necessário
```

### Voice IA não responde

**Sintomas:**
```
ERR_CONNECTION_REFUSED ao acessar /voice-api
```

**Solução:**
```bash
# Verificar se serviço está rodando
docker-compose ps voice-ia

# Ver logs
docker-compose logs voice-ia

# Verificar variáveis de ambiente
docker-compose exec voice-ia env | grep API_KEY

# Reiniciar serviço
docker-compose restart voice-ia
```

---

## Problemas de Performance

### Containers muito lentos

**Causas comuns:**
- Pouca RAM disponível
- Disco cheio
- WSL2 no Windows com pouca memória alocada

**Solução Windows (WSL2):**

Edite `C:\Users\[SEU_USUARIO]\.wslconfig`:
```ini
[wsl2]
memory=4GB
processors=4
swap=2GB
```

Reinicie o WSL:
```powershell
wsl --shutdown
```

**Solução geral:**
```bash
# Ver uso de recursos
docker stats

# Limpar recursos não utilizados
docker system prune -a --volumes

# Verificar espaço em disco
docker system df

# Limpar imagens antigas
docker image prune -a
```

### Build muito lento

**Solução:**
```bash
# Usar BuildKit (mais rápido)
export DOCKER_BUILDKIT=1

# Construir com múltiplos threads
docker-compose build --parallel

# Usar cache de build
docker-compose build
```

---

## Erros Específicos

### Erro de permissão (Linux/Mac)

**Sintomas:**
```
Permission denied
Cannot create directory
```

**Solução:**
```bash
# Dar permissões corretas
sudo chown -R $USER:$USER backend/storage
sudo chown -R $USER:$USER backend/bootstrap/cache
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache

# Ou executar como root (não recomendado)
sudo docker-compose up -d
```

### Erro de migração do banco

**Sintomas:**
```
Migration table not found
SQLSTATE[42P01]: Undefined table
```

**Solução:**
```bash
# Verificar se banco existe
docker-compose exec postgres psql -U cardflow -c "\l"

# Criar banco se não existir
docker-compose exec postgres psql -U cardflow -c "CREATE DATABASE cardflow;"

# Executar migrações
docker-compose exec backend php artisan migrate:fresh --force

# Se persistir, resetar tudo
docker-compose down -v
docker-compose up -d postgres redis
sleep 15
docker-compose exec backend php artisan migrate --force
```

### Erro "No space left on device"

**Sintomas:**
```
no space left on device
```

**Solução:**
```bash
# Ver uso de disco do Docker
docker system df

# Limpar tudo não utilizado
docker system prune -a --volumes

# Remover volumes órfãos
docker volume prune

# Verificar espaço no sistema
df -h

# Windows: Limpar WSL
wsl --shutdown
# Reabrir Docker Desktop
```

### Erro de healthcheck

**Sintomas:**
```
Unhealthy
Health check failed
```

**Solução:**
```bash
# Ver logs do container
docker-compose logs [service-name]

# Verificar manualmente o healthcheck
docker inspect cardflow-backend | grep -A 10 Health

# Desabilitar temporariamente (não recomendado para produção)
# Comentar seção healthcheck no docker-compose.yml
```

---

## Limpeza e Reset

### Reset completo (apaga tudo!)

```bash
# CUIDADO: Isso vai apagar todos os dados!

# Parar e remover tudo
docker-compose down -v

# Remover imagens
docker-compose down --rmi all -v

# Limpar sistema Docker
docker system prune -a --volumes

# Confirmar com: y

# Recomeçar do zero
docker-compose build --no-cache
docker-compose up -d
```

### Reset apenas do banco de dados

```bash
# Parar serviços
docker-compose down

# Remover apenas volume do PostgreSQL
docker volume rm cardflow-postgres-data

# Reiniciar e executar migrações
docker-compose up -d postgres redis
sleep 15
docker-compose exec backend php artisan migrate:fresh --seed --force
docker-compose up -d
```

### Limpar apenas cache

```bash
# Redis
docker-compose exec redis redis-cli FLUSHALL

# Laravel
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear
docker-compose exec backend php artisan view:clear
```

---

## 🆘 Ainda com Problemas?

### Coleta de informações para suporte

Execute e envie os resultados:

```bash
# Informações do sistema
docker --version
docker-compose --version
uname -a  # Linux/Mac
systeminfo  # Windows

# Status dos containers
docker-compose ps

# Logs completos
docker-compose logs > docker-logs.txt

# Configuração
docker-compose config > docker-config.txt

# Uso de recursos
docker stats --no-stream > docker-stats.txt
```

### Checklist de diagnóstico

- [ ] Docker Desktop está rodando?
- [ ] Todas as portas estão disponíveis?
- [ ] `.env.docker` está configurado corretamente?
- [ ] APP_KEY foi gerada?
- [ ] Há espaço em disco suficiente?
- [ ] Firewall/Antivírus não está bloqueando?
- [ ] Logs mostram erros específicos?

### Recursos adicionais

- [Documentação Docker](https://docs.docker.com/)
- [Docker Troubleshooting](https://docs.docker.com/config/daemon/troubleshoot/)
- [Laravel Docker Issues](https://github.com/laravel/laravel/issues)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)

---

**Se nenhuma solução funcionou, abra uma issue no repositório com:**
1. Sistema operacional e versão
2. Versão do Docker e Docker Compose
3. Logs completos (`docker-compose logs`)
4. Passos que já tentou

---

**Desenvolvido com ❤️ pela equipe CardFlow**
