# 🚀 Quick Start - CardFlow Docker

## Início Rápido em 3 Passos

### 1️⃣ Configurar Variáveis de Ambiente

**Windows:**
```powershell
Copy-Item .env.docker.example .env.docker
notepad .env.docker
```

**Linux/Mac:**
```bash
cp .env.docker.example .env.docker
nano .env.docker
```

**Configurações obrigatórias:**
- `APP_KEY` - Será gerado automaticamente
- `OPENAI_API_KEY` - Sua chave da OpenAI
- `ELEVENLABS_API_KEY` - Sua chave da ElevenLabs
- `STRIPE_KEY` / `STRIPE_SECRET` - Suas chaves do Stripe

### 2️⃣ Iniciar o Sistema

**Windows (PowerShell):**
```powershell
.\start-docker.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x start-docker.sh
./start-docker.sh
```

**Ou manualmente:**
```bash
docker-compose up -d
```

### 3️⃣ Acessar

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **API**: http://localhost/api
- 📊 **Docs**: http://localhost/api/documentation
- 🎙️ **Voice IA**: http://localhost/voice-api

---

## 📋 Comandos Essenciais

```bash
# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Reiniciar
docker-compose restart

# Ver status
docker-compose ps

# Executar migrações
docker-compose exec backend php artisan migrate

# Limpar cache
docker-compose exec backend php artisan cache:clear
```

---

## 🐛 Problemas Comuns

### Porta 80 já em uso
```bash
# Windows: Parar IIS ou XAMPP
# Ou alterar porta no docker-compose.yml:
# ports: - "8080:80"
```

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs [service-name]

# Reconstruir
docker-compose build --no-cache
docker-compose up -d
```

### Erro de banco de dados
```bash
# Aguardar PostgreSQL iniciar
docker-compose up -d postgres redis
sleep 15
docker-compose up -d
```

---

## 📚 Documentação Completa

Leia o **[DOCKER.md](./DOCKER.md)** para documentação detalhada.

---

**Precisa de ajuda?** Abra uma issue no repositório!
