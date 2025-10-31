# 📦 CardFlow - Arquivos Docker Criados

Este documento lista todos os arquivos criados para suportar o Docker no CardFlow.

## 📂 Estrutura de Arquivos

```
cardflow/
├── docker-compose.yml              # Configuração principal do Docker Compose
├── .dockerignore                   # Arquivos ignorados no build Docker
├── .env.docker.example             # Exemplo de variáveis de ambiente
│
├── start-docker.sh                 # Script de inicialização (Linux/Mac)
├── start-docker.ps1                # Script de inicialização (Windows)
├── validate-docker.sh              # Validação de ambiente (Linux/Mac)
├── validate-docker.ps1             # Validação de ambiente (Windows)
│
├── Makefile.docker                 # Comandos automatizados (make)
│
├── DOCKER.md                       # Documentação completa do Docker
├── QUICK-START-DOCKER.md           # Guia de início rápido
├── README-DOCKER-SECTION.md        # Seção para adicionar ao README principal
│
├── backend/
│   └── Dockerfile                  # ✓ Já existia
│
├── frontend/
│   └── Dockerfile                  # ✓ Já existia
│
├── voice-ia-service/
│   └── Dockerfile                  # ✓ Já existia
│
└── deploy/
    └── nginx/
        ├── default.conf            # ✓ Já existia
        └── nginx.conf              # ✓ Já existia
```

## 📋 Descrição dos Arquivos

### Arquivos de Configuração Principal

#### `docker-compose.yml`
- Orquestra todos os 7 serviços (frontend, backend, nginx, voice-ia, postgres, redis, queue-worker)
- Define networks e volumes
- Configura health checks
- Gerencia dependências entre serviços

#### `.env.docker.example`
- Template de variáveis de ambiente
- Contém todas as configurações necessárias
- Deve ser copiado para `.env.docker` e editado

#### `.dockerignore`
- Lista de arquivos/pastas ignorados no build
- Otimiza o tamanho das imagens
- Reduz tempo de build

### Scripts de Inicialização

#### `start-docker.sh` (Linux/Mac)
- Verifica pré-requisitos
- Cria `.env.docker` se não existir
- Gera APP_KEY automaticamente
- Executa migrações e seeders
- Otimiza a aplicação
- Inicia todos os serviços

#### `start-docker.ps1` (Windows PowerShell)
- Versão Windows do script acima
- Mesmas funcionalidades adaptadas para PowerShell
- Interface colorida e amigável

### Scripts de Validação

#### `validate-docker.sh` (Linux/Mac)
- Verifica instalação do Docker
- Valida configuração do ambiente
- Checa disponibilidade de portas
- Valida sintaxe do docker-compose.yml

#### `validate-docker.ps1` (Windows PowerShell)
- Versão Windows do script de validação
- Mesmas verificações adaptadas para Windows

### Automação com Make

#### `Makefile.docker`
- Comandos simplificados para gerenciar o ambiente
- Targets disponíveis:
  - `make install` - Instalação completa
  - `make up/down` - Iniciar/parar serviços
  - `make logs` - Ver logs
  - `make migrate/seed` - Database
  - `make shell` - Acessar containers
  - E muitos outros...

### Documentação

#### `DOCKER.md`
- Guia completo de uso do Docker
- Arquitetura detalhada
- Comandos úteis
- Troubleshooting extensivo
- Boas práticas de segurança

#### `QUICK-START-DOCKER.md`
- Guia rápido de 3 passos
- Comandos essenciais
- Problemas comuns
- Referências rápidas

#### `README-DOCKER-SECTION.md`
- Seção pronta para incluir no README.md principal
- Resume as informações mais importantes
- Links para documentação completa

## 🚀 Como Usar

### Início Rápido

**1. Configurar ambiente:**
```bash
# Linux/Mac
cp .env.docker.example .env.docker
nano .env.docker

# Windows
Copy-Item .env.docker.example .env.docker
notepad .env.docker
```

**2. Validar (opcional):**
```bash
# Linux/Mac
chmod +x validate-docker.sh
./validate-docker.sh

# Windows
.\validate-docker.ps1
```

**3. Iniciar:**
```bash
# Linux/Mac
chmod +x start-docker.sh
./start-docker.sh

# Windows
.\start-docker.ps1

# Ou manualmente
docker-compose up -d
```

### Usando Make (Linux/Mac)

```bash
# Instalação completa
make -f Makefile.docker install

# Comandos rápidos
make -f Makefile.docker up
make -f Makefile.docker logs
make -f Makefile.docker health
```

## 📊 Serviços Configurados

| Serviço | Container | Porta | Descrição |
|---------|-----------|-------|-----------|
| Frontend | cardflow-frontend | 3000 | Next.js application |
| Backend | cardflow-backend | 9000* | Laravel API (PHP-FPM) |
| Nginx | cardflow-nginx | 80, 443 | Reverse proxy |
| Voice IA | cardflow-voice-ia | 3001 | Node.js microservice |
| Queue Worker | cardflow-queue-worker | - | Laravel queue processor |
| PostgreSQL | cardflow-postgres | 5432 | Database |
| Redis | cardflow-redis | 6379 | Cache & queues |

*Porta interna, não exposta

## 🔧 Configurações Importantes

### Variáveis de Ambiente Obrigatórias

Edite `.env.docker`:

```bash
# Gerada automaticamente
APP_KEY=base64:...

# APIs externas (obter em seus respectivos sites)
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# Banco de dados (pode manter padrão)
DB_PASSWORD=cardflow_secure_pass_2024
```

### Portas Utilizadas

Certifique-se de que as seguintes portas estão disponíveis:
- 80 (Nginx HTTP)
- 443 (Nginx HTTPS)
- 3000 (Frontend)
- 3001 (Voice IA)
- 5432 (PostgreSQL)
- 6379 (Redis)

## 🐛 Troubleshooting

### Problemas Comuns

**Porta 80 em uso no Windows:**
```powershell
# Parar IIS
iisreset /stop

# Ou alterar porta no docker-compose.yml
ports: - "8080:80"
```

**Erro APP_KEY:**
```bash
docker-compose run --rm backend php artisan key:generate --show
# Copiar o resultado para .env.docker
```

**Banco de dados não conecta:**
```bash
# Aguardar PostgreSQL estar pronto
docker-compose up -d postgres redis
sleep 15
docker-compose up -d
```

## 📚 Recursos

- [Documentação Completa](./DOCKER.md)
- [Guia Rápido](./QUICK-START-DOCKER.md)
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## ✅ Checklist de Configuração

- [ ] Docker e Docker Compose instalados
- [ ] Arquivo `.env.docker` criado e configurado
- [ ] Portas disponíveis (80, 3000, 3001, 5432, 6379)
- [ ] API keys configuradas (OpenAI, ElevenLabs, Stripe)
- [ ] Scripts de inicialização com permissão de execução
- [ ] Validação executada com sucesso

## 🎉 Pronto!

Com todos esses arquivos, você tem um ambiente Docker completo, documentado e fácil de usar para o CardFlow!

Para iniciar:
```bash
./start-docker.sh  # Linux/Mac
.\start-docker.ps1  # Windows
```

Acesse:
- 🌐 Frontend: http://localhost:3000
- 🔧 API: http://localhost/api
- 📊 Docs: http://localhost/api/documentation

---

**Desenvolvido com ❤️ pela equipe CardFlow**
