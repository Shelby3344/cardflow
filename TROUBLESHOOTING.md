# 🔧 Troubleshooting - Soluções Rápidas

## ⚡ Comandos Rápidos de Emergência

### 🔄 Reiniciar Tudo do Zero

```bash
cd ~/cardflow
docker-compose down -v
rm -rf backend/storage/logs/*
rm -rf backend/bootstrap/cache/*
bash setup-production.sh
```

### 🧹 Limpar Completamente e Reconstruir

```bash
# Parar e remover tudo
docker-compose down -v --remove-orphans

# Remover imagens antigas
docker rmi cardflow-backend cardflow-frontend cardflow-voice-ia cardflow-queue-worker

# Limpar sistema Docker
docker system prune -af

# Recriar tudo
bash setup-production.sh
```

---

## 🚨 Problemas Comuns e Soluções

### 1. Backend retorna 500 Error

**Causa:** Geralmente APP_KEY vazia ou cache corrompido

```bash
# Verificar APP_KEY
docker-compose exec backend cat /var/www/.env | grep APP_KEY

# Se vazia, gerar nova
docker-compose run --rm backend php artisan key:generate --show
# Copiar a chave e adicionar ao backend/.env

# Limpar caches
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
docker-compose exec backend php artisan route:clear
docker-compose restart backend
```

### 2. Backend retorna 502 Bad Gateway

**Causa:** PHP-FPM não está rodando ou crashou

```bash
# Verificar logs
docker-compose logs backend

# Verificar se PHP-FPM está rodando
docker-compose exec backend sh -c "ls -la /proc/1/exe"
# Deve apontar para php-fpm

# Reiniciar
docker-compose restart backend

# Se não resolver, rebuild
docker-compose up -d --build --force-recreate backend
```

### 3. Container de Backend não Inicia

**Causa:** Permissões ou diretórios faltando

```bash
# Criar diretórios necessários
mkdir -p backend/storage/framework/{sessions,views,cache}
mkdir -p backend/storage/app/public
mkdir -p backend/storage/logs
mkdir -p backend/bootstrap/cache

# Corrigir permissões
sudo chmod -R 777 backend/storage
sudo chmod -R 775 backend/bootstrap/cache

# Reiniciar
docker-compose up -d backend
```

### 4. APP_KEY Vazia no Container

**Causa:** Volume do .env não está montado ou arquivo vazio

```bash
# Verificar se volume está montado
docker inspect cardflow-backend --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}' | grep .env

# Se não aparecer, o docker-compose.yml está desatualizado
# Fazer upload do docker-compose.yml correto

# Verificar .env no host
cat backend/.env | grep APP_KEY

# Se vazio, adicionar
sed -i '/^APP_KEY=/d' backend/.env
echo "APP_KEY=base64:$(openssl rand -base64 32)" >> backend/.env

# Recriar container
docker-compose up -d --force-recreate backend
```

### 5. Erro "No application encryption key has been specified"

```bash
# Solução rápida
docker-compose run --rm backend php artisan key:generate --show

# Adicionar ao .env (substituir CHAVE_GERADA)
sed -i '/^APP_KEY=/d' backend/.env
echo "APP_KEY=CHAVE_GERADA" >> backend/.env

# Recriar backend
docker-compose up -d --force-recreate backend
```

### 6. Erro de Conexão com Banco de Dados

```bash
# Verificar se postgres está rodando
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Testar conexão
docker-compose exec backend php artisan tinker
# >>> DB::connection()->getPdo();

# Se falhar, verificar credenciais
docker-compose exec backend env | grep DB_

# Reiniciar postgres
docker-compose restart postgres
sleep 5
docker-compose restart backend
```

### 7. Frontend não Carrega

```bash
# Ver logs
docker-compose logs frontend

# Verificar se está rodando
docker-compose ps frontend

# Reiniciar
docker-compose restart frontend

# Se não resolver, rebuild
docker-compose up -d --build --force-recreate frontend
```

### 8. Nginx retorna 404

```bash
# Verificar configuração
docker-compose exec nginx nginx -t

# Ver logs
docker-compose logs nginx

# Reiniciar
docker-compose restart nginx

# Se falhar, verificar se backend está respondendo
docker-compose exec backend php artisan route:list
```

### 9. Migrations não Executam

```bash
# Ver erro
docker-compose exec backend php artisan migrate

# Forçar execução
docker-compose exec backend php artisan migrate --force

# Se banco não existe
docker-compose exec postgres psql -U cardflow -c "CREATE DATABASE cardflow;"

# Tentar novamente
docker-compose exec backend php artisan migrate --force
```

### 10. Permissões Negadas

```bash
# Corrigir todas as permissões de uma vez
sudo chown -R $USER:$USER .
sudo chmod -R 777 backend/storage
sudo chmod -R 775 backend/bootstrap/cache
sudo chmod +x setup-production.sh

# Reiniciar containers
docker-compose restart backend queue-worker
```

---

## 📊 Comandos de Diagnóstico

### Verificar Status Geral

```bash
# Status de todos os containers
docker-compose ps

# Uso de recursos
docker stats --no-stream

# Espaço em disco
df -h

# Logs combinados
docker-compose logs --tail=50
```

### Verificar Configuração

```bash
# Ver variáveis de ambiente do backend
docker-compose exec backend env

# Ver .env montado
docker-compose exec backend cat /var/www/.env

# Ver volumes montados
docker inspect cardflow-backend --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'

# Ver configuração do Laravel
docker-compose exec backend php artisan config:show
```

### Testar Conectividade

```bash
# Testar backend
curl -v http://localhost/up

# Testar API
curl -v http://localhost/api/ping

# Testar frontend
curl -v http://localhost:3000

# Testar voice-ia
curl -v http://localhost:3001/health

# Testar postgres
docker-compose exec postgres pg_isready -U cardflow

# Testar redis
docker-compose exec redis redis-cli ping
```

---

## 🔑 APP_KEY - Guia Definitivo

### Gerar Nova APP_KEY

```bash
# Método 1: Dentro do container
docker-compose run --rm backend php artisan key:generate --show

# Método 2: Com OpenSSL
echo "APP_KEY=base64:$(openssl rand -base64 32)"

# Método 3: Com PHP
php -r 'echo "APP_KEY=base64:".base64_encode(random_bytes(32))."\n";'
```

### Adicionar APP_KEY ao .env

```bash
# Remover linhas antigas
sed -i '/^APP_KEY=/d' backend/.env

# Adicionar nova (substitua CHAVE)
echo "APP_KEY=base64:SUA_CHAVE_AQUI" >> backend/.env

# Verificar
grep APP_KEY backend/.env

# Aplicar
docker-compose restart backend queue-worker
```

### Verificar se APP_KEY Está Funcionando

```bash
# Ver no container
docker-compose exec backend cat /var/www/.env | grep APP_KEY

# Ver na aplicação
docker-compose exec backend php artisan tinker
# >>> config('app.key')

# Testar endpoint
curl http://localhost/up
# Se retornar {"status":"ok"}, APP_KEY está OK
```

---

## 🆘 Quando Tudo Falha

### Reset Completo

```bash
# 1. Parar tudo
docker-compose down -v

# 2. Limpar Docker completamente
docker system prune -af --volumes

# 3. Remover diretórios problemáticos
sudo rm -rf backend/storage/logs/*
sudo rm -rf backend/storage/framework/cache/*
sudo rm -rf backend/storage/framework/sessions/*
sudo rm -rf backend/storage/framework/views/*
sudo rm -rf backend/bootstrap/cache/*

# 4. Recriar estrutura
mkdir -p backend/storage/framework/{sessions,views,cache}
mkdir -p backend/storage/app/public
mkdir -p backend/storage/logs
mkdir -p backend/bootstrap/cache

# 5. Corrigir permissões
sudo chmod -R 777 backend/storage
sudo chmod -R 775 backend/bootstrap/cache

# 6. Remover .env antigo
rm -f backend/.env

# 7. Executar setup novamente
bash setup-production.sh
```

---

## 📞 Obter Ajuda

### Coletar Informações para Debug

```bash
# Criar arquivo de debug
{
  echo "=== DOCKER COMPOSE PS ==="
  docker-compose ps
  echo ""
  echo "=== BACKEND LOGS ==="
  docker-compose logs --tail=100 backend
  echo ""
  echo "=== NGINX LOGS ==="
  docker-compose logs --tail=50 nginx
  echo ""
  echo "=== BACKEND ENV ==="
  docker-compose exec backend env
  echo ""
  echo "=== LARAVEL LOGS ==="
  docker-compose exec backend tail -100 /var/www/storage/logs/laravel.log
  echo ""
  echo "=== MOUNTED VOLUMES ==="
  docker inspect cardflow-backend --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{"\n"}}{{end}}'
} > debug-info.txt

# Enviar debug-info.txt para análise
```

---

## ✅ Checklist de Verificação

- [ ] Todos os containers estão "Up" (`docker-compose ps`)
- [ ] Backend está "healthy"
- [ ] `curl http://localhost/up` retorna JSON
- [ ] `backend/.env` tem APP_KEY preenchida
- [ ] `.env` está montado no container
- [ ] Permissões corretas em `storage/` (777)
- [ ] Permissões corretas em `bootstrap/cache/` (775)
- [ ] Migrations executadas
- [ ] Sem erros nos logs do backend
- [ ] Nginx está rodando

Se todos estiverem ✅, a aplicação deve estar funcionando!
