# 🚨 Solução Rápida - Erros de Permissão

## Problema: "Permission denied" no diretório storage/logs

### ✅ Solução Automática (RECOMENDADO)

Execute na VPS:

```bash
cd /home/ubuntu/cardflow

# Baixar e executar script de correção
curl -fsSL https://raw.githubusercontent.com/Shelby3344/cardflow/main/fix-permissions.sh | bash

# OU se já está na pasta do projeto:
chmod +x fix-permissions.sh
./fix-permissions.sh
```

---

### 🛠️ Solução Manual (Passo a Passo)

```bash
cd /home/ubuntu/cardflow

# 1. Criar diretórios necessários
mkdir -p backend/storage/logs
mkdir -p backend/storage/framework/cache
mkdir -p backend/storage/framework/sessions
mkdir -p backend/storage/framework/views
mkdir -p backend/storage/app/public
mkdir -p backend/bootstrap/cache

# 2. Dar permissões (fora do container)
sudo chown -R $USER:$USER backend/storage
sudo chown -R $USER:$USER backend/bootstrap/cache
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache

# 3. Adicionar variáveis faltantes no .env
echo "" >> backend/.env
echo "STRIPE_KEY=" >> backend/.env
echo "STRIPE_SECRET=" >> backend/.env

# Se tiver o arquivo voice-ia-service/.env
echo "ELEVENLABS_API_KEY=" >> voice-ia-service/.env

# 4. Reiniciar containers
docker-compose down
docker-compose up -d

# 5. Aguardar containers iniciarem
sleep 20

# 6. Configurar permissões DENTRO do container
docker-compose exec backend chown -R www-data:www-data /var/www/storage
docker-compose exec backend chown -R www-data:www-data /var/www/bootstrap/cache
docker-compose exec backend chmod -R 775 /var/www/storage
docker-compose exec backend chmod -R 775 /var/www/bootstrap/cache

# 7. Gerar chave da aplicação
docker-compose exec backend php artisan key:generate --force

# 8. Executar migrations
docker-compose exec backend php artisan migrate --force

# 9. Limpar cache
docker-compose exec backend php artisan config:clear
docker-compose exec backend php artisan cache:clear
```

---

### 🔍 Verificar se Funcionou

```bash
# Ver logs
docker-compose logs backend

# Testar API
curl http://localhost/api/ping

# Ver status
docker-compose ps
```

---

### 💡 Explicação dos Erros

#### 1. **Permission denied em /var/www/storage/logs**
**Causa**: Diretórios não existem ou sem permissão de escrita

**Solução**: 
- Criar diretórios antes de iniciar containers
- Dar permissão 775 para o usuário www-data

#### 2. **STRIPE_KEY, STRIPE_SECRET, ELEVENLABS_API_KEY não definidos**
**Causa**: Variáveis opcionais faltando no .env

**Solução**: 
- Adicionar variáveis vazias (ou com valores reais se tiver)
- São opcionais, não impedem o funcionamento básico

---

### 🎯 Comandos Rápidos para Copy/Paste

**Solução completa em 1 comando:**
```bash
cd /home/ubuntu/cardflow && \
mkdir -p backend/storage/{logs,framework/{cache,sessions,views},app/public} backend/bootstrap/cache && \
chmod -R 775 backend/storage backend/bootstrap/cache && \
docker-compose down && docker-compose up -d && sleep 20 && \
docker-compose exec -T backend chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache && \
docker-compose exec -T backend chmod -R 775 /var/www/storage /var/www/bootstrap/cache && \
docker-compose exec -T backend php artisan key:generate --force && \
docker-compose exec -T backend php artisan migrate --force && \
docker-compose exec -T backend php artisan config:clear && \
echo "✓ Tudo corrigido!"
```

---

### 🆘 Se Ainda Não Funcionar

```bash
# 1. Parar tudo
docker-compose down -v

# 2. Remover containers antigos
docker system prune -a -f

# 3. Limpar storage e recriar
sudo rm -rf backend/storage/logs/*
mkdir -p backend/storage/logs
chmod -R 777 backend/storage
chmod -R 777 backend/bootstrap/cache

# 4. Iniciar novamente
docker-compose up -d --build

# 5. Aguardar
sleep 30

# 6. Configurar novamente
docker-compose exec backend php artisan key:generate --force
docker-compose exec backend php artisan migrate --force
```

---

### 📝 Estrutura de Diretórios Necessária

```
backend/
├── storage/
│   ├── logs/              ← Precisa existir!
│   ├── framework/
│   │   ├── cache/         ← Precisa existir!
│   │   ├── sessions/      ← Precisa existir!
│   │   └── views/         ← Precisa existir!
│   └── app/
│       └── public/        ← Precisa existir!
└── bootstrap/
    └── cache/             ← Precisa existir!
```

---

### ✅ Checklist de Verificação

- [ ] Diretórios criados em `backend/storage`
- [ ] Permissões 775 configuradas
- [ ] Propriedade www-data:www-data dentro do container
- [ ] Variáveis STRIPE_KEY e STRIPE_SECRET no .env
- [ ] Containers reiniciados
- [ ] APP_KEY gerado
- [ ] Migrations executadas sem erros
- [ ] API respondendo em `/api/ping`

---

### 🔧 Comandos de Debug

```bash
# Verificar permissões
ls -la backend/storage/

# Verificar dentro do container
docker-compose exec backend ls -la /var/www/storage/

# Verificar usuário do processo PHP
docker-compose exec backend whoami

# Ver logs completos
docker-compose logs backend | tail -100

# Testar escrita no storage
docker-compose exec backend touch /var/www/storage/logs/test.log
```

---

### 📞 Suporte

Se os erros persistirem:

1. Cole o output completo de:
   ```bash
   docker-compose logs backend | tail -50
   ls -la backend/storage/
   cat backend/.env | grep -E "APP_KEY|DB_"
   ```

2. Verifique se tem espaço em disco:
   ```bash
   df -h
   ```

3. Verifique memória RAM:
   ```bash
   free -h
   ```
