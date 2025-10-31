## 🐳 Docker - Início Rápido

O CardFlow pode ser executado completamente usando Docker e Docker Compose, sem necessidade de instalar dependências localmente.

### Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+

### Instalação Rápida

**Windows (PowerShell):**
```powershell
# 1. Configurar ambiente
Copy-Item .env.docker.example .env.docker
notepad .env.docker  # Editar configurações

# 2. Iniciar
.\start-docker.ps1
```

**Linux/Mac (Bash):**
```bash
# 1. Configurar ambiente
cp .env.docker.example .env.docker
nano .env.docker  # Editar configurações

# 2. Iniciar
chmod +x start-docker.sh
./start-docker.sh
```

### Acessar

- 🌐 Frontend: http://localhost:3000
- 🔧 API: http://localhost/api
- 📊 Docs: http://localhost/api/documentation

### Comandos Úteis

```bash
# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart

# Ver status
docker-compose ps
```

### Documentação Completa

Para mais informações, consulte:
- 📘 [DOCKER.md](./DOCKER.md) - Documentação completa
- 🚀 [QUICK-START-DOCKER.md](./QUICK-START-DOCKER.md) - Guia rápido
- 🛠️ [Makefile.docker](./Makefile.docker) - Comandos automatizados

---
