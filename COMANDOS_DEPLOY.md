# ⚡ Comandos Rápidos - CardFlow Deploy

## 🚀 Deploy

### Do Windows (Recomendado):
```powershell
# Deploy completo
.\deploy.ps1 -KeyPath "C:\caminho\sua-chave.pem"

# Deploy rápido
.\deploy.ps1 -KeyPath "C:\caminho\sua-chave.pem" -Quick
```

### Do Servidor EC2:
```bash
# Deploy completo
cd /home/ubuntu/cardflow && ./deploy-ec2.sh

# Deploy rápido
cd /home/ubuntu/cardflow && ./quick-deploy.sh
```

---

## 🔌 Conectar SSH

```powershell
# Do Windows
ssh -i "sua-chave.pem" ubuntu@18.217.114.196

# Copiar arquivos
scp -i "sua-chave.pem" arquivo.txt ubuntu@18.217.114.196:/home/ubuntu/
```

---

## 🐳 Docker

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar
docker-compose restart
docker-compose restart backend

# Parar/Iniciar
docker-compose down
docker-compose up -d

# Rebuild
docker-compose up -d --build
docker-compose up -d --build frontend

# Limpar tudo
docker-compose down -v
docker system prune -a --volumes
```

---

## 🗄️ Laravel (Backend)

```bash
# Cache
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan route:clear
docker-compose exec backend php artisan view:clear

# Migrations
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan migrate:fresh --seed

# Gerar chave
docker-compose exec backend php artisan key:generate

# Acessar container
docker-compose exec backend bash
```

---

## ⚛️ Next.js (Frontend)

```bash
# Rebuild frontend
docker-compose up -d --build frontend

# Ver logs
docker-compose logs -f frontend

# Acessar container
docker-compose exec frontend sh
```

---

## 🗂️ PostgreSQL

```bash
# Acessar banco
docker-compose exec postgres psql -U cardflow -d cardflow

# Backup
docker-compose exec postgres pg_dump -U cardflow cardflow > backup.sql

# Restore
cat backup.sql | docker-compose exec -T postgres psql -U cardflow cardflow

# Ver tabelas
docker-compose exec postgres psql -U cardflow -d cardflow -c "\dt"
```

---

## 🔴 Redis

```bash
# Acessar CLI
docker-compose exec redis redis-cli

# Limpar cache
docker-compose exec redis redis-cli FLUSHALL

# Ver chaves
docker-compose exec redis redis-cli KEYS "*"
```

---

## 🌐 Nginx

```bash
# Ver configuração
docker-compose exec nginx cat /etc/nginx/conf.d/default.conf

# Testar configuração
docker-compose exec nginx nginx -t

# Recarregar
docker-compose exec nginx nginx -s reload

# Reiniciar
docker-compose restart nginx
```

---

## 📊 Monitoramento

```bash
# Status geral
docker-compose ps
docker stats

# Espaço em disco
df -h
du -sh /var/lib/docker

# Logs do sistema
sudo journalctl -u docker -f

# Processos
top
htop
```

---

## 🧪 Testes

```bash
# Testar URLs
curl -I http://localhost
curl -I http://localhost:3000
curl -I http://localhost/api/health

# Do Windows
curl -I http://18.217.114.196
curl -I http://18.217.114.196:3000
curl -I http://18.217.114.196/api/health
```

---

## 🔧 Correções Rápidas

### Erro de permissão:
```bash
chmod -R 777 backend/storage
chmod -R 777 backend/bootstrap/cache
```

### Containers não iniciam:
```bash
docker-compose down
docker-compose up -d
docker-compose logs
```

### Porta em uso:
```bash
sudo lsof -i :80
sudo lsof -i :3000
sudo kill -9 PID
```

### Sem espaço em disco:
```bash
docker system prune -a --volumes
docker volume prune
```

### Reset completo:
```bash
docker-compose down -v
docker system prune -a --volumes
./deploy-ec2.sh
```

---

## 📝 Git

```bash
# Status
git status
git log --oneline -5

# Atualizar
git pull origin main

# Commit e push
git add .
git commit -m "Mensagem"
git push origin main

# Ver diferenças
git diff
git diff HEAD~1
```

---

## 🔐 Segurança

```bash
# Ver portas abertas
sudo netstat -tulpn | grep LISTEN
sudo ss -tulpn | grep LISTEN

# Firewall (UFW)
sudo ufw status
sudo ufw allow 80
sudo ufw allow 3000

# Ver usuários logados
who
w
last
```

---

## 💾 Backup

```bash
# Backup banco de dados
docker-compose exec postgres pg_dump -U cardflow cardflow > backup_$(date +%Y%m%d).sql

# Backup código
tar -czf cardflow_backup_$(date +%Y%m%d).tar.gz /home/ubuntu/cardflow

# Backup .env
cp backend/.env backend/.env.backup
cp .env .env.backup
```

---

## 🆘 Emergência

```bash
# Parar tudo imediatamente
docker-compose down
sudo systemctl stop docker

# Reiniciar servidor
sudo reboot

# Ver últimos erros
sudo journalctl -p err -n 50

# Espaço crítico
docker system prune -a --volumes -f
rm -rf /tmp/*
```

---

## 📞 URLs Importantes

- **Frontend**: http://18.217.114.196:3000
- **Backend API**: http://18.217.114.196/api
- **API Docs**: http://18.217.114.196/api/documentation
- **Voice IA**: http://18.217.114.196/voice-api
- **Backend Health**: http://18.217.114.196/api/health

---

## 🔗 Links Úteis

- [Docker Docs](https://docs.docker.com/)
- [Laravel Docs](https://laravel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Nginx Docs](https://nginx.org/en/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**💡 Dica**: Salve este arquivo como favorito no seu navegador ou editor!
