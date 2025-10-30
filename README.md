#  CardFlow - Sistema inteligente para estudos

**Sistema de Flashcards com IA para Aprendizado Inteligente**

CardFlow é uma plataforma moderna e completa de flashcards com recursos avançados de inteligência artificial, incluindo síntese de voz (TTS), análise de progresso, e um sistema de repetição espaçada para maximizar a retenção de conhecimento.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Executando o Projeto](#-executando-o-projeto)
- [API Endpoints](#-api-endpoints)
- [Modelos de Dados](#-modelos-de-dados)
- [Fluxo de Autenticação](#-fluxo-de-autenticação)
- [Serviço de IA de Voz](#-serviço-de-ia-de-voz)
- [Cache e Performance](#-cache-e-performance)
- [Desenvolvimento](#-desenvolvimento)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

O CardFlow é uma solução completa de flashcards que combina o poder do aprendizado espaçado com inteligência artificial para criar uma experiência de estudo personalizada e eficiente. O sistema permite:

- **Criação e Organização**: Crie decks e sub-decks organizados hierarquicamente
- **Estudo Inteligente**: Sistema de repetição espaçada baseado em algoritmos de aprendizado
- **IA de Voz**: Síntese de voz usando OpenAI TTS e ElevenLabs
- **Análise de Progresso**: Estatísticas detalhadas e visualização de domínio do conteúdo
- **Colaboração**: Compartilhamento de decks públicos
- **Multiplataforma**: Interface responsiva e moderna

---

## 🏗 Arquitetura do Sistema

O CardFlow utiliza uma arquitetura de microserviços moderna:

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Port: 3000    │
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Nginx   │
    │  Proxy   │
    └────┬─────┘
         │
    ┌────▼──────────────────────┐
    │                           │
┌───▼────────┐      ┌──────────▼─────────┐
│  Backend   │      │   Voice IA Service │
│  Laravel   │      │     (Node.js)      │
│  Port: 80  │      │     Port: 3001     │
└───┬────────┘      └──────────┬─────────┘
    │                          │
    ├──────────────┬───────────┤
    │              │           │
┌───▼────┐   ┌────▼───┐   ┌──▼────┐
│Postgres│   │ Redis  │   │  S3   │
│  :5432 │   │ :6379  │   │(AWS)  │
└────────┘   └────────┘   └───────┘
```

### Componentes Principais:

1. **Frontend (Next.js 15)**: Interface do usuário com React 19, TypeScript e TailwindCSS
2. **Backend (Laravel 11)**: API RESTful com PHP 8.2, Sanctum para autenticação
3. **Voice IA Service**: Microserviço Node.js para síntese de voz (OpenAI TTS + ElevenLabs)
4. **PostgreSQL**: Banco de dados principal
5. **Redis**: Cache e filas de trabalho
6. **Nginx**: Proxy reverso e servidor web
7. **AWS S3**: Armazenamento de arquivos de áudio e imagens

---

## 🛠 Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.6** - Framework React com SSR e App Router
- **React 19.1.0** - Biblioteca de interface
- **TypeScript 5** - Tipagem estática
- **TailwindCSS 4** - Framework CSS utility-first
- **Zustand 5** - Gerenciamento de estado
- **TanStack Query 5** - Gerenciamento de dados assíncronos e cache
- **Framer Motion 12** - Animações fluidas
- **TipTap 3** - Editor de texto rico
- **Next-Auth 4** - Autenticação
- **Axios 1.12** - Cliente HTTP

### Backend
- **Laravel 11** - Framework PHP
- **PHP 8.2** - Linguagem de programação
- **PostgreSQL 16** - Banco de dados relacional
- **Redis 7** - Cache e filas
- **Laravel Sanctum** - Autenticação de API
- **L5-Swagger** - Documentação de API (OpenAPI/Swagger)
- **Stripe PHP SDK** - Integração de pagamentos
- **AWS S3 SDK** - Armazenamento de arquivos
- **PHPStan/Larastan** - Análise estática de código

### Voice IA Service
- **Node.js** - Runtime JavaScript
- **Express 5** - Framework web
- **OpenAI SDK** - API de TTS
- **ElevenLabs SDK** - API de voz avançada
- **Redis** - Cache de áudio
- **AWS S3 SDK** - Armazenamento de áudio
- **Multer** - Upload de arquivos

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web e proxy reverso

---

## 📁 Estrutura do Projeto

```
cardflow/
│
├── backend/                    # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/   # Controllers da API
│   │   │       ├── AuthController.php
│   │   │       ├── CardController.php
│   │   │       ├── DeckController.php
│   │   │       ├── StudySessionController.php
│   │   │       ├── UserProfileController.php
│   │   │       └── UserStatsController.php
│   │   └── Models/            # Modelos Eloquent
│   │       ├── User.php
│   │       ├── Deck.php
│   │       ├── Card.php
│   │       ├── StudySession.php
│   │       └── CardProgress.php
│   ├── config/                # Configurações
│   ├── database/
│   │   ├── migrations/        # Migrations do banco
│   │   └── seeders/           # Seeders
│   ├── routes/
│   │   ├── api.php           # Rotas da API
│   │   └── web.php
│   └── tests/                # Testes PHPUnit
│
├── frontend/                  # Aplicação Next.js
│   ├── app/
│   │   ├── api/              # API Routes do Next.js
│   │   ├── components/       # Componentes React
│   │   │   ├── modals/
│   │   │   ├── cards/
│   │   │   └── ui/
│   │   ├── dashboard/        # Páginas do dashboard
│   │   │   ├── page.tsx
│   │   │   ├── library/
│   │   │   ├── decks/
│   │   │   └── study/
│   │   ├── login/
│   │   └── register/
│   ├── hooks/                # Custom React Hooks
│   ├── services/             # Serviços de API
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── deckService.ts
│   │   ├── cardService.ts
│   │   └── studyService.ts
│   ├── store/                # Zustand stores
│   │   └── authStore.ts
│   └── types/                # Definições TypeScript
│
├── voice-ia-service/         # Microserviço de Voz
│   ├── routes/
│   │   └── tts.js           # Rotas de TTS
│   ├── services/
│   │   ├── openai.js        # Integração OpenAI
│   │   └── elevenlabs.js    # Integração ElevenLabs
│   ├── utils/
│   │   ├── redis.js         # Cliente Redis
│   │   └── s3.js            # Cliente S3
│   └── index.js             # Servidor Express
│
├── deploy/
│   └── nginx/               # Configurações Nginx
│       ├── nginx.conf
│       ├── default.conf
│       └── ssl/
│
├── docker-compose.yml       # Orquestração de serviços
├── Makefile                 # Scripts de automação
├── setup.sh                 # Script de setup Linux/Mac
└── setup.bat                # Script de setup Windows
```

---

## ✨ Funcionalidades

### 🔐 Autenticação e Usuários
- [x] Registro e login de usuários
- [x] Autenticação social (Google, GitHub, etc.)
- [x] Gerenciamento de perfil
- [x] Upload de foto de perfil
- [x] Tokens de autenticação (Laravel Sanctum)

### 📚 Decks
- [x] Criar, editar e excluir decks
- [x] Organização hierárquica (decks e sub-decks)
- [x] Customização (ícones, cores, imagens)
- [x] Decks públicos e privados
- [x] Duplicação de decks
- [x] Reordenação de cards
- [x] Compartilhamento de decks

### 🎴 Flashcards
- [x] Criar cards com frente e verso
- [x] Editor de texto rico (TipTap)
- [x] Upload de imagens
- [x] Tags e categorias
- [x] Criação em massa
- [x] Geração de áudio (TTS)

### 📖 Sistema de Estudo
- [x] Repetição espaçada inteligente
- [x] Níveis de domínio (mastery levels)
- [x] Agendamento de revisões
- [x] Sessões de estudo
- [x] Histórico de estudos
- [x] Estatísticas detalhadas

### 📊 Analytics e Estatísticas
- [x] Progresso por deck
- [x] Tempo de estudo
- [x] Taxa de acerto
- [x] Gráficos de evolução
- [x] Estatísticas globais do usuário

### 🎤 IA de Voz
- [x] Text-to-Speech com OpenAI
- [x] Suporte a ElevenLabs
- [x] Múltiplas vozes
- [x] Controle de velocidade
- [x] Cache de áudio (Redis)
- [x] Armazenamento em S3

---

## 🚀 Instalação

### Pré-requisitos

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git**

**OU** (para desenvolvimento local sem Docker):

- **PHP** >= 8.2
- **Composer** >= 2.5
- **Node.js** >= 20
- **npm** ou **yarn**
- **PostgreSQL** >= 16
- **Redis** >= 7

### Clonando o Repositório

```bash
git clone https://github.com/seu-usuario/cardflow.git
cd cardflow
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

#### Backend (.env)

Copie o arquivo `.env.example` e configure:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Application
APP_NAME=CardFlow
APP_ENV=production
APP_KEY=base64:GERE_COM_php_artisan_key:generate
APP_DEBUG=false
APP_URL=http://localhost

# Database
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=cardflow
DB_USERNAME=cardflow
DB_PASSWORD=SUA_SENHA_SEGURA

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Cache & Queue
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# AWS S3 (para uploads)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

# Stripe (opcional)
STRIPE_KEY=
STRIPE_SECRET=

# Social Auth (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

#### Frontend (.env.local)

```bash
cd frontend
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_VOICE_API_URL=http://localhost:3001
NEXTAUTH_SECRET=GERE_UMA_CHAVE_SECRETA
NEXTAUTH_URL=http://localhost:3000
```

#### Voice IA Service (.env)

```bash
cd voice-ia-service
cp .env.example .env
```

```env
PORT=3001
REDIS_HOST=redis
REDIS_PORT=6379
BACKEND_API_URL=http://nginx

# OpenAI
OPENAI_API_KEY=sk-...

# ElevenLabs (opcional)
ELEVENLABS_API_KEY=

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET=
```

### 2. Docker Compose (.env na raiz)

Crie um arquivo `.env` na raiz do projeto:

```env
# PostgreSQL
POSTGRES_DB=cardflow
POSTGRES_USER=cardflow
POSTGRES_PASSWORD=sua_senha_segura_aqui
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Laravel
APP_KEY=base64:...
APP_ENV=production
APP_DEBUG=false
```

---

## 🎮 Executando o Projeto

### Com Docker (Recomendado)

#### 1. Build e Start dos Containers

```bash
# Build das imagens
docker-compose build

# Iniciar todos os serviços
docker-compose up -d
```

#### 2. Configurar o Backend

```bash
# Gerar chave da aplicação
docker-compose exec backend php artisan key:generate

# Executar migrations
docker-compose exec backend php artisan migrate

# (Opcional) Executar seeders
docker-compose exec backend php artisan db:seed

# Criar link simbólico para storage
docker-compose exec backend php artisan storage:link
```

#### 3. Acessar a Aplicação

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost/api
- **Voice IA Service**: http://localhost:3001
- **API Documentation (Swagger)**: http://localhost/api/documentation

### Scripts de Automação (Makefile)

```bash
# Iniciar todos os serviços
make up

# Parar todos os serviços
make down

# Ver logs
make logs

# Executar migrations
make migrate

# Limpar cache
make cache-clear

# Rebuild completo
make rebuild
```

### Desenvolvimento Local (Sem Docker)

#### Backend

```bash
cd backend

# Instalar dependências
composer install

# Gerar chave
php artisan key:generate

# Migrations
php artisan migrate

# Iniciar servidor
php artisan serve
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev
```

#### Voice IA Service

```bash
cd voice-ia-service

# Instalar dependências
npm install

# Iniciar serviço
npm run dev
```

---

## 🔌 API Endpoints

### Autenticação

```http
POST   /api/register          # Registrar usuário
POST   /api/login             # Login
POST   /api/logout            # Logout (auth)
POST   /api/auth/social       # Login social
GET    /api/user              # Dados do usuário (auth)
```

### Usuário

```http
GET    /api/user/sidebar-stats     # Estatísticas do usuário (auth)
PUT    /api/user/profile           # Atualizar perfil (auth)
POST   /api/user/profile-photo     # Upload foto de perfil (auth)
DELETE /api/user/profile-photo     # Remover foto de perfil (auth)
```

### Decks

```http
GET    /api/decks              # Listar decks do usuário (auth)
POST   /api/decks              # Criar deck (auth)
GET    /api/decks/public       # Listar decks públicos (auth)
GET    /api/decks/{id}         # Obter deck específico (auth)
PUT    /api/decks/{id}         # Atualizar deck (auth)
DELETE /api/decks/{id}         # Deletar deck (auth)
POST   /api/decks/{id}/reorder # Reordenar cards (auth)
POST   /api/decks/{id}/duplicate # Duplicar deck (auth)
```

### Cards

```http
GET    /api/cards                   # Listar cards (auth)
POST   /api/cards                   # Criar card (auth)
GET    /api/cards/{id}              # Obter card (auth)
PUT    /api/cards/{id}              # Atualizar card (auth)
DELETE /api/cards/{id}              # Deletar card (auth)
POST   /api/cards/bulk              # Criar múltiplos cards (auth)
GET    /api/decks/{deckId}/cards   # Cards de um deck (auth)
```

### Estudo

```http
POST   /api/study/sessions                    # Registrar sessão de estudo (auth)
GET    /api/study/decks/{deckId}/stats       # Estatísticas do deck (auth)
GET    /api/study/decks/{deckId}/history     # Histórico de estudos (auth)
GET    /api/study/decks/{deckId}/cards       # Cards para estudar (auth)
```

### Voice IA Service

```http
POST   /api/tts/generate      # Gerar áudio de texto
POST   /api/tts/card          # Gerar áudio de flashcard
GET    /health                # Health check
```

#### Exemplo de Request - Gerar Áudio

```bash
curl -X POST http://localhost:3001/api/tts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Olá, este é um teste de síntese de voz",
    "voice": "alloy",
    "speed": 1.0,
    "provider": "openai"
  }'
```

**Response:**

```json
{
  "audio_url": "https://s3.amazonaws.com/bucket/audio-123.mp3",
  "cached": false
}
```

### Documentação Completa

Acesse a documentação Swagger completa em: **http://localhost/api/documentation**

---

## 🗄 Modelos de Dados

### User (Usuário)

```php
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@example.com",
  "profile_photo_url": "https://...",
  "bio": "Estudante de medicina",
  "email_verified_at": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Deck

```php
{
  "id": 1,
  "user_id": 1,
  "parent_id": null,
  "name": "Biologia Celular",
  "description": "Estudo de células",
  "icon": "🧬",
  "color": "#4F46E5",
  "image_url": "https://...",
  "is_public": false,
  "order": 1,
  "progress": 75,
  "cards_count": 50,
  "cards_studied": 38,
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Card (Flashcard)

```php
{
  "id": 1,
  "deck_id": 1,
  "user_id": 1,
  "front": "O que é mitocôndria?",
  "back": "Organela responsável pela produção de energia (ATP)",
  "tags": "biologia,celula,energia",
  "category": "Organelas",
  "image_url": "https://...",
  "audio_url": "https://...",
  "type": "basic",
  "mastery_level": 3,
  "next_review_at": "2024-01-20T10:00:00Z",
  "last_studied_at": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### StudySession (Sessão de Estudo)

```php
{
  "id": 1,
  "user_id": 1,
  "deck_id": 1,
  "card_id": 1,
  "quality": 4,
  "time_spent_seconds": 45,
  "studied_at": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Níveis de Qualidade (quality):**
- 0: Resposta completamente errada
- 1: Resposta errada, mas lembrou algo
- 2: Resposta difícil, mas correta
- 3: Resposta correta com hesitação
- 4: Resposta correta com facilidade
- 5: Resposta perfeita, imediata

**Níveis de Domínio (mastery_level):**
- 0: Nunca estudado
- 1: Iniciante
- 2: Aprendendo
- 3: Praticando
- 4: Proficiente
- 5: Dominado

---

## 🔒 Fluxo de Autenticação

O CardFlow utiliza **Laravel Sanctum** para autenticação de API com tokens.

### Registro de Usuário

```javascript
POST /api/register
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123",
  "password_confirmation": "senha123"
}

// Response
{
  "user": { ... },
  "token": "1|abc123..."
}
```

### Login

```javascript
POST /api/login
{
  "email": "joao@example.com",
  "password": "senha123"
}

// Response
{
  "user": { ... },
  "token": "2|xyz789..."
}
```

### Usando o Token

Todas as requisições autenticadas devem incluir o header:

```
Authorization: Bearer {token}
```

### Logout

```javascript
POST /api/logout
Authorization: Bearer {token}

// Response
{
  "message": "Logout realizado com sucesso"
}
```

---

## 🎤 Serviço de IA de Voz

O CardFlow possui um microserviço dedicado para síntese de voz usando OpenAI TTS e ElevenLabs.

### Recursos

- **Múltiplos Providers**: OpenAI TTS e ElevenLabs
- **Cache Inteligente**: Redis com hash MD5 para evitar regenerações
- **Armazenamento S3**: Áudios persistidos na AWS S3
- **Múltiplas Vozes**: Suporte a diferentes vozes e idiomas
- **Controle de Velocidade**: Ajuste de velocidade de fala

### Vozes Disponíveis (OpenAI)

- `alloy` - Voz neutra e equilibrada
- `echo` - Voz masculina
- `fable` - Voz britânica
- `onyx` - Voz profunda masculina
- `nova` - Voz feminina jovem
- `shimmer` - Voz feminina suave

### Implementação no Frontend

```typescript
import { voiceService } from '@/services/voiceService';

// Gerar áudio de um texto
const audio = await voiceService.generateSpeech({
  text: "Texto a ser falado",
  voice: "alloy",
  speed: 1.0,
  provider: "openai"
});

// Usar a URL do áudio
const audioElement = new Audio(audio.audio_url);
audioElement.play();
```

---

## ⚡ Cache e Performance

### Estratégias de Cache

#### Backend (Redis)

- **Session**: Armazenamento de sessões
- **Cache**: Cache de queries do banco
- **Queue**: Filas de trabalho assíncronas

```php
// Exemplo de cache no Laravel
Cache::remember('user.decks.' . $userId, 3600, function () use ($userId) {
    return Deck::where('user_id', $userId)->get();
});
```

#### Frontend (TanStack Query)

- **Stale Time**: 5 minutos para dados de decks e cards
- **Cache Time**: 10 minutos
- **Refetch on Mount**: Automático para dados desatualizados
- **Persist**: LocalStorage para persistência entre sessões

```typescript
const { data: decks } = useQuery({
  queryKey: ['decks', 'mine'],
  queryFn: () => deckService.getDecks('mine'),
  staleTime: 1000 * 60 * 5, // 5 minutos
});
```

#### Voice IA (Redis + S3)

- **Cache Key**: MD5 hash de texto + voz + velocidade
- **TTL**: 24 horas
- **Storage**: S3 para persistência permanente

---

## 💻 Desenvolvimento

### Code Style

#### PHP (Backend)

```bash
# Laravel Pint (PSR-12)
./vendor/bin/pint

# PHPStan (análise estática)
./vendor/bin/phpstan analyse
```

#### JavaScript/TypeScript (Frontend)

```bash
# ESLint
npm run lint

# Prettier (auto-fix)
npm run format
```

### Testes

#### Backend

```bash
# Executar todos os testes
php artisan test

# Com coverage
php artisan test --coverage

# Teste específico
php artisan test --filter=DeckControllerTest
```

#### Frontend

```bash
# Jest
npm run test

# Watch mode
npm run test:watch
```

### Debug

#### Backend

```php
// Laravel Telescope (desenvolvimento)
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

Acesse: http://localhost/telescope

#### Frontend

```bash
# React DevTools
# Chrome Extension: React Developer Tools

# Next.js Debug
npm run dev -- --inspect
```

---

## 🚢 Deploy

### Docker em Produção

#### 1. Build de Produção

```bash
# Build otimizado
docker-compose -f docker-compose.prod.yml build

# Push para registry
docker-compose -f docker-compose.prod.yml push
```

#### 2. Configurar Variáveis

Certifique-se de configurar todas as variáveis de ambiente para produção:

- `APP_ENV=production`
- `APP_DEBUG=false`
- Chaves de API (OpenAI, AWS, etc.)
- Credenciais de banco de dados seguras

#### 3. SSL/TLS

Configure certificados SSL no Nginx:

```bash
# Certbot (Let's Encrypt)
certbot --nginx -d seudominio.com
```

#### 4. Deploy

```bash
# Deploy em servidor
docker-compose -f docker-compose.prod.yml up -d

# Executar migrations
docker-compose exec backend php artisan migrate --force

# Cache de otimização
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
```

### Plataformas Recomendadas

- **DigitalOcean** - App Platform ou Droplets
- **AWS** - ECS, EC2, RDS, S3
- **Vercel** - Frontend Next.js
- **Railway** - Full-stack com containers
- **Heroku** - Backend Laravel

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estes passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Commit

Siga a convenção de [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona suporte a múltiplas vozes
fix: corrige bug no cache de áudio
docs: atualiza documentação da API
refactor: melhora estrutura do código
test: adiciona testes para DeckController
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

- **Backend**: Laravel 11 + PHP 8.2
- **Frontend**: Next.js 15 + React 19
- **IA de Voz**: Node.js + OpenAI + ElevenLabs
---

**Desenvolvido com ❤️ ZUCKSZINHODEV**
