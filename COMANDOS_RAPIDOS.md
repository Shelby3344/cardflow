# ⚡ Comandos Rápidos - CardFlow VPS

## 🚀 Instalação Inicial

### Conectar na VPS
```bash
ssh root@SEU_IP
```

### Instalar tudo automaticamente
```bash
curl -fsSL https://raw.githubusercontent.com/Shelby3344/cardflow/main/install-vps.sh | bash
```

---

## 🐳 Docker - Comandos Essenciais

### Iniciar sistema
```bash
cd ~/cardflow
docker-compose up -d
```

### Parar sistema
```bash
docker-compose down
```

### Reiniciar sistema
```bash
docker-compose restart
```

### Ver status
```bash
docker-compose ps
```

### Ver logs (todos)
```bash
docker-compose logs -f
```

### Ver logs específicos
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### Reconstruir após mudanças
```bash
docker-compose up -d --build
```

---

## 🔧 Laravel (Backend)

### Executar comandos Laravel
```bash
# Gerar chave
docker-compose exec backend php artisan key:generate

# Migrations
docker-compose exec backend php artisan migrate

# Popular banco
docker-compose exec backend php artisan db:seed

# Limpar cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear

# Ver rotas
docker-compose exec backend php artisan route:list
```

### Acessar shell do backend
```bash
docker-compose exec backend bash
```

---

## 🎨 Frontend (Next.js)

### Acessar shell do frontend
```bash
docker-compose exec frontend sh
```

### Reconstruir frontend
```bash
docker-compose up -d --build frontend
```

---

## 🗄️ Banco de Dados

### Acessar PostgreSQL
```bash
docker-compose exec postgres psql -U cardflow -d cardflow
```

### Backup do banco
```bash
docker-compose exec postgres pg_dump -U cardflow cardflow > backup.sql
```

### Restaurar backup
```bash
cat backup.sql | docker-compose exec -T postgres psql -U cardflow -d cardflow
```

---

## 🔴 Redis

### Acessar Redis CLI
```bash
docker-compose exec redis redis-cli
```

### Limpar cache Redis
```bash
docker-compose exec redis redis-cli FLUSHALL
```

---

## 🧹 Limpeza e Manutenção

### Limpar containers parados
```bash
docker container prune -f
```

### Limpar imagens não usadas
```bash
docker image prune -a -f
```

### Ver uso de espaço
```bash
docker system df
```

### Limpar tudo (CUIDADO!)
```bash
docker system prune -a --volumes -f
```

---

## 🔄 Atualização

### Atualizar código
```bash
cd ~/cardflow
git pull origin main
docker-compose up -d --build
docker-compose exec backend php artisan migrate --force
docker-compose exec backend php artisan cache:clear
```

---

## 🐛 Debug

### Ver logs de erro
```bash
# Backend Laravel
docker-compose exec backend tail -f storage/logs/laravel.log

# Nginx
docker-compose logs nginx

# Todos os erros
docker-compose logs | grep -i error
```

### Verificar portas em uso
```bash
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :3000
```

### Reiniciar container específico
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart nginx
```

---

## 📊 Monitoramento

### Ver uso de recursos
```bash
docker stats
```

### Ver processos
```bash
docker-compose top
```

### Verificar saúde dos containers
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🔒 Segurança

### Firewall UFW
```bash
# Habilitar
sudo ufw enable

# Permitir portas
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Frontend
sudo ufw allow 3001  # Voice IA

# Ver status
sudo ufw status
```

### Atualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
```

---

## 🆘 Emergência

### Parar tudo imediatamente
```bash
docker-compose down
```

### Resetar tudo (CUIDADO - apaga dados!)
```bash
docker-compose down -v
docker volume rm cardflow-postgres-data cardflow-redis-data
```

### Reiniciar servidor
```bash
sudo reboot
```

---

## 📱 URLs de Acesso

Substitua `SEU_IP` pelo IP da sua VPS:

- Frontend: `http://SEU_IP:3000`
- Backend API: `http://SEU_IP/api`
- API Docs: `http://SEU_IP/api/documentation`
- Voice IA: `http://SEU_IP:3001`

---

## 📝 Variáveis de Ambiente

### Editar .env do backend
```bash
nano backend/.env
```

### Editar .env do voice-ia
```bash
nano voice-ia-service/.env
```

### Após editar, reiniciar
```bash
docker-compose restart
```

---

## ✅ Verificação Rápida

```bash
# Tudo funcionando?
curl http://localhost/api/ping
curl http://localhost:3000
curl http://localhost:3001/health

# Ver todos os containers
docker-compose ps

# Ver uso de recursos
docker stats --no-stream
```

---

**💡 Dica**: Salve este arquivo na VPS para consulta rápida!

```bash
# Na VPS:
nano comandos-rapidos.md
# Cole este conteúdo e salve (Ctrl+X, Y, Enter)
```
