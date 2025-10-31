# 🧠 CardFlow - Plataforma Inteligente de Flashcards

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.x-black.svg)
![Docker](https://img.shields.io/badge/Docker-enabled-blue.svg)

**CardFlow** é uma plataforma moderna de estudos com flashcards inteligentes, utilizando IA para geração de áudio e análise de progresso. Desenvolvido com arquitetura de microserviços, oferece uma experiência completa de aprendizado com repetição espaçada.

---

## 📑 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Desenvolvimento](#-desenvolvimento)
- [API Documentation](#-api-documentation)
- [Deploy](#-deploy)
- [Modelos de Dados](#-modelos-de-dados)
- [Fluxo de Estudo](#-fluxo-de-estudo)
- [Contribuindo](#-contribuindo)

---

## 🎯 Visão Geral

O CardFlow é uma solução completa para estudos com flashcards que combina:

- **Interface Moderna**: Frontend em Next.js 15 com design system Tailwind CSS v4
- **Backend Robusto**: API RESTful em Laravel 11 com autenticação Sanctum
- **IA de Voz**: Microserviço Node.js para Text-to-Speech com OpenAI e ElevenLabs
- **Sistema de Repetição Espaçada**: Algoritmo inteligente para otimizar aprendizado
- **Cache Inteligente**: Redis para performance e economia de recursos
- **Armazenamento S3**: Upload de imagens e áudios na AWS

### Principais Diferenciais

✅ Geração automática de áudio para flashcards  
✅ Sistema de progresso e estatísticas detalhadas  
✅ Organização hierárquica de decks (decks e subdecks)  
✅ Compartilhamento de decks públicos  
✅ Upload de imagens personalizadas  
✅ Sistema de tags e categorias  
✅ Dashboard com métricas em tempo real  
✅ Autenticação social (Google, Facebook)  
✅ Integração com Stripe para pagamentos  

---

## 🏗️ Arquitetura

O CardFlow utiliza uma arquitetura de **microserviços containerizada** com Docker:

```
┌─────────────────────────────────────────────────────────────┐
│                          NGINX                              │
│              (Reverse Proxy & Load Balancer)                │
└─────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌─────────┐    ┌────────────┐   ┌──────────────┐
    │Frontend │    │  Backend   │   │  Voice IA    │
    │Next.js  │    │  Laravel   │   │   Service    │
    │ :3000   │    │   :8000    │   │    :3001     │
    └─────────┘    └────────────┘   └──────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌──────────┐   ┌───────────┐   ┌──────────┐
    │PostgreSQL│   │   Redis   │   │  Queue   │
    │  :5432   │   │   :6379   │   │  Worker  │
    └──────────┘   └───────────┘   └──────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   AWS S3     │
                   │ (Armazenamento)│
                   └──────────────┘
```

### Componentes

| Serviço | Tecnologia | Porta | Função |
|---------|-----------|-------|---------|
| **Frontend** | Next.js 15 + TypeScript | 3000 | Interface do usuário |
| **Backend** | Laravel 11 + PHP 8.2 | 8000 | API RESTful |
| **Voice IA** | Node.js + Express | 3001 | Geração de áudio TTS |
| **PostgreSQL** | PostgreSQL 16 | 5432 | Banco de dados |
| **Redis** | Redis 7 | 6379 | Cache e filas |
| **Nginx** | Nginx Alpine | 80/443 | Proxy reverso |
| **Queue Worker** | Laravel Queue | - | Processamento assíncrono |

---

## 🚀 Tecnologias

### Backend (Laravel 11)

```json
{
  "php": "^8.2",
  "laravel/framework": "^11.0",
  "laravel/sanctum": "^4.2",
  "stripe/stripe-php": "^18.0",
  "darkaonline/l5-swagger": "^9.0",
  "league/flysystem-aws-s3-v3": "^3.30",
  "predis/predis": "^3.2"
}
```

**Principais Pacotes:**
- **Sanctum**: Autenticação API via tokens
- **Swagger**: Documentação automática da API
- **Flysystem S3**: Upload de arquivos para AWS
- **Predis**: Cliente Redis para cache
- **Stripe**: Integração de pagamentos

### Frontend (Next.js 15)

```json
{
  "next": "15.5.6",
  "react": "19.1.0",
  "typescript": "^5",
  "@tanstack/react-query": "^5.90.5",
  "zustand": "^5.0.8",
  "axios": "^1.12.2",
  "tailwindcss": "^4",
  "framer-motion": "^12.23.24",
  "@tiptap/react": "^3.7.2"
}
```

**Principais Bibliotecas:**
- **React Query**: Gerenciamento de estado assíncrono
- **Zustand**: Estado global simplificado
- **Tailwind CSS v4**: Design system moderno
- **Framer Motion**: Animações fluidas
- **TipTap**: Editor de texto rico
- **Lucide React**: Biblioteca de ícones

### Voice IA Service (Node.js)

```json
{
  "express": "^5.1.0",
  "openai": "^6.6.0",
  "@aws-sdk/client-s3": "^3.913.0",
  "redis": "^5.8.3",
  "axios": "^1.12.2"
}
```

**Recursos:**
- Geração TTS com OpenAI (modelo `tts-1`)
- Alternativa com ElevenLabs API
- Cache Redis para economia de custos
- Upload automático para S3

---

## ✨ Funcionalidades

### 👤 Usuários

- ✅ Registro e login com email/senha
- ✅ Autenticação social (Google, Facebook)
- ✅ Upload de foto de perfil
- ✅ Edição de perfil (nome, bio)
- ✅ Estatísticas de progresso na sidebar
- ✅ Soft delete (dados preservados)

### 📚 Decks

- ✅ Criar decks personalizados com ícone e cor
- ✅ Upload de imagem de capa para decks
- ✅ Organização hierárquica (decks → subdecks)
- ✅ Decks públicos/privados
- ✅ Duplicação de decks
- ✅ Reordenação de decks
- ✅ Busca e filtros
- ✅ Estatísticas por deck

### 🃏 Cards (Flashcards)

- ✅ Criação com frente (front) e verso (back)
- ✅ Editor rich text com TipTap
- ✅ Upload de imagem por card
- ✅ Geração automática de áudio com IA
- ✅ Sistema de tags e categorias
- ✅ Múltiplos tipos (texto, imagem, áudio)
- ✅ Criação em massa (bulk import)
- ✅ Níveis de domínio (mastery levels)

### 📊 Sistema de Estudo

- ✅ **Repetição Espaçada**: Algoritmo inteligente baseado em SM-2
- ✅ **3 Níveis de Resposta**:
  - `know_it`: Domina o conteúdo
  - `kinda_know`: Conhece parcialmente
  - `dont_know`: Não sabe
- ✅ Agendamento automático de revisões (`next_review_at`)
- ✅ Histórico de sessões de estudo
- ✅ Tempo de estudo rastreado
- ✅ Estatísticas detalhadas por deck
- ✅ Dashboard com progresso visual

### 🎙️ IA de Voz (Voice IA Service)

- ✅ Text-to-Speech com OpenAI (`tts-1`)
- ✅ Suporte alternativo ElevenLabs
- ✅ Múltiplas vozes disponíveis
- ✅ Controle de velocidade de fala
- ✅ Cache Redis (24h) para economia
- ✅ Geração de áudio para flashcards completos
- ✅ Upload automático para S3

---

## 📂 Estrutura do Projeto

```
cardflow/
├── backend/                      # API Laravel
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/      # Controladores da API
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── CardController.php
│   │   │   │   ├── DeckController.php
│   │   │   │   ├── StudySessionController.php
│   │   │   │   ├── UserProfileController.php
│   │   │   │   └── UserStatsController.php
│   │   │   └── Middleware/
│   │   └── Models/               # Models Eloquent
│   │       ├── User.php
│   │       ├── Deck.php
│   │       ├── Card.php
│   │       ├── StudySession.php
│   │       └── CardProgress.php
│   ├── database/
│   │   ├── migrations/           # Migrations do banco
│   │   ├── factories/            # Factories para testes
│   │   └── seeders/              # Seeders
│   ├── routes/
│   │   ├── api.php               # Rotas da API
│   │   └── web.php
│   ├── storage/
│   │   └── api-docs/             # Swagger docs
│   ├── composer.json
│   └── Dockerfile
│
├── frontend/                     # Frontend Next.js
│   ├── app/
│   │   ├── api/                  # API Routes do Next.js
│   │   ├── dashboard/            # Páginas do dashboard
│   │   │   ├── page.tsx          # Dashboard principal
│   │   │   ├── decks/            # Gestão de decks
│   │   │   ├── study/            # Sessões de estudo
│   │   │   ├── library/          # Biblioteca
│   │   │   ├── settings/         # Configurações
│   │   │   └── premium/          # Planos premium
│   │   ├── components/           # Componentes React
│   │   ├── login/                # Página de login
│   │   ├── register/             # Página de registro
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Landing page
│   ├── hooks/
│   │   └── useAudioPlayer.ts     # Hook para player de áudio
│   ├── lib/
│   │   ├── api.ts                # Cliente Axios configurado
│   │   ├── utils.ts              # Utilidades
│   │   └── voiceApi.ts           # Cliente Voice IA
│   ├── services/                 # Serviços de API
│   │   ├── cardService.ts
│   │   ├── deckService.ts
│   │   ├── studyService.ts
│   │   ├── userProfileService.ts
│   │   └── userStatsService.ts
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts          # Estado de autenticação
│   │   └── dashboardStore.ts     # Estado do dashboard
│   ├── types/                    # TypeScript types
│   ├── package.json
│   └── Dockerfile
│
├── voice-ia-service/             # Microserviço de IA de Voz
│   ├── routes/
│   │   └── tts.js                # Rotas de Text-to-Speech
│   ├── services/
│   │   ├── openai.js             # Integração OpenAI
│   │   └── elevenlabs.js         # Integração ElevenLabs
│   ├── utils/
│   │   ├── redis.js              # Cliente Redis
│   │   └── s3.js                 # Upload S3
│   ├── index.js                  # Entry point
│   ├── package.json
│   └── Dockerfile
│
├── deploy/                       # Configurações de deploy
│   └── nginx/
│       ├── default.conf          # Configuração Nginx
│       ├── nginx.conf
│       └── ssl/                  # Certificados SSL
│
├── docker-compose.yml            # Orquestração de containers
├── Makefile                      # Comandos úteis
├── Makefile.docker               # Comandos Docker
├── setup-ec2.sh                  # Script de deploy EC2
├── DEPLOY_EC2.md                 # Guia de deploy
└── README.md                     # Este arquivo
```

---

## 🔧 Instalação e Configuração

### Pré-requisitos

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Node.js** 18+ (para desenvolvimento local)
- **PHP** 8.2+ (para desenvolvimento local)
- **Composer** 2.x

### Instalação Rápida com Docker

```bash
# 1. Clone o repositório
git clone https://github.com/Shelby3344/cardflow.git
cd cardflow

# 2. Configure as variáveis de ambiente
cp backend/.env.example backend/.env
cp voice-ia-service/.env.example voice-ia-service/.env

# 3. Configure as variáveis obrigatórias no backend/.env
# APP_KEY será gerado automaticamente
# DB_PASSWORD=cardflow_secure_pass_2024
# OPENAI_API_KEY=sua-chave-openai
# AWS_ACCESS_KEY_ID=sua-key-aws
# AWS_SECRET_ACCESS_KEY=seu-secret-aws

# 4. Inicie todos os serviços
make setup

# OU manualmente:
docker-compose up -d
docker-compose exec backend php artisan key:generate
docker-compose exec backend php artisan migrate --seed
```

### Acessar os Serviços

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost/api
- **API Documentation**: http://localhost/api/documentation
- **Voice IA Service**: http://localhost:3001

---

## 💻 Desenvolvimento

### Comandos Úteis (Makefile)

```bash
# Iniciar todos os containers
make up

# Parar todos os containers
make down

# Ver logs em tempo real
make logs
make logs-backend
make logs-voice

# Acessar shell dos containers
make shell-backend
make shell-voice

# Executar migrations
make migrate

# Resetar banco de dados
make fresh

# Popular banco com dados de teste
make seed

# Executar testes
make test

# Limpar cache
make cache-clear
```

### Desenvolvimento Backend (Laravel)

```bash
cd backend

# Instalar dependências
composer install

# Gerar chave da aplicação
php artisan key:generate

# Executar migrations
php artisan migrate

# Popular banco com seeders
php artisan seed

# Iniciar servidor local
php artisan serve

# Executar testes
php artisan test

# Análise estática (PHPStan)
./vendor/bin/phpstan analyse

# Formatação de código (Pint)
./vendor/bin/pint
```

### Desenvolvimento Frontend (Next.js)

```bash
cd frontend

# Instalar dependências
npm install

# Modo desenvolvimento (com Turbopack)
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint
```

### Desenvolvimento Voice IA Service

```bash
cd voice-ia-service

# Instalar dependências
npm install

# Modo desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

---

## 📖 API Documentation

A documentação completa da API está disponível via **Swagger/OpenAPI**.

### Acessar Swagger UI

```
http://localhost/api/documentation
```

### Principais Endpoints

#### Autenticação

```http
POST /api/register
POST /api/login
POST /api/logout (auth)
POST /api/auth/social
```

#### Usuários

```http
GET  /api/user (auth)
GET  /api/user/sidebar-stats (auth)
PUT  /api/user/profile (auth)
POST /api/user/profile-photo (auth)
DELETE /api/user/profile-photo (auth)
```

#### Decks

```http
GET    /api/decks (auth)
POST   /api/decks (auth)
GET    /api/decks/public (auth)
GET    /api/decks/{id} (auth)
PUT    /api/decks/{id} (auth)
DELETE /api/decks/{id} (auth)
POST   /api/decks/{id}/reorder (auth)
POST   /api/decks/{id}/duplicate (auth)
```

#### Cards

```http
GET    /api/cards (auth)
POST   /api/cards (auth)
GET    /api/cards/{id} (auth)
PUT    /api/cards/{id} (auth)
DELETE /api/cards/{id} (auth)
POST   /api/cards/bulk (auth)
GET    /api/decks/{deckId}/cards (auth)
```

#### Estudo

```http
POST /api/study/sessions (auth)
GET  /api/study/decks/{deckId}/stats (auth)
GET  /api/study/decks/{deckId}/history (auth)
GET  /api/study/decks/{deckId}/cards (auth)
```

#### Voice IA Service

```http
POST /api/tts/generate
POST /api/tts/card
```

**Exemplo de Request:**

```bash
curl -X POST http://localhost:3001/api/tts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Olá, este é um teste de TTS",
    "voice": "alloy",
    "speed": 1.0,
    "provider": "openai"
  }'
```

---

## 🚀 Deploy

### Deploy Automático na AWS EC2

```bash
# 1. Conecte-se ao servidor EC2
ssh -i sua-chave.pem ubuntu@SEU-IP

# 2. Execute o script de deploy automático
curl -fsSL https://raw.githubusercontent.com/Shelby3344/cardflow/main/setup-ec2.sh | bash
```

O script irá:
- ✅ Instalar Docker e Docker Compose
- ✅ Clonar o repositório
- ✅ Configurar variáveis de ambiente
- ✅ Iniciar todos os containers
- ✅ Executar migrations

### Variáveis de Ambiente Obrigatórias

**Backend (.env)**

```env
APP_NAME=CardFlow
APP_ENV=production
APP_KEY=base64:...  # Gerado automaticamente
APP_DEBUG=false
APP_URL=https://seu-dominio.com

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=cardflow
DB_USERNAME=cardflow
DB_PASSWORD=senha_segura_aqui

REDIS_HOST=redis
REDIS_PASSWORD=
REDIS_PORT=6379

FRONTEND_URL=https://seu-dominio.com
SANCTUM_STATEFUL_DOMAINS=seu-dominio.com

# AWS S3
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=seu-secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=seu-bucket

# Stripe (opcional)
STRIPE_KEY=pk_...
STRIPE_SECRET=sk_...
```

**Voice IA (.env)**

```env
PORT=3001
NODE_ENV=production

OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...

# AWS S3
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=seu-secret
AWS_REGION=us-east-1
AWS_BUCKET=seu-bucket

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

### Configurar SSL/HTTPS

Edite `deploy/nginx/default.conf` e adicione certificados SSL:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... resto da configuração
}
```

---

## 🗄️ Modelos de Dados

### Diagrama ER Simplificado

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    Users     │──────<│    Decks     │──────<│    Cards     │
│              │  1:N  │              │  1:N  │              │
│ id           │       │ id           │       │ id           │
│ name         │       │ user_id      │       │ deck_id      │
│ email        │       │ parent_id    │       │ user_id      │
│ password     │       │ name         │       │ front        │
│ profile_photo│       │ description  │       │ back         │
│ bio          │       │ icon         │       │ image_url    │
└──────────────┘       │ color        │       │ audio_url    │
       │               │ image_url    │       │ type         │
       │               │ is_public    │       │ mastery_level│
       │               └──────────────┘       │ next_review  │
       │                      │               └──────────────┘
       │                      │                      │
       └──────────────────────┴──────────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │  StudySessions   │
                   │                  │
                   │ id               │
                   │ user_id          │
                   │ deck_id          │
                   │ card_id          │
                   │ response         │
                   │ time_spent       │
                   │ created_at       │
                   └──────────────────┘
```

### User

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | bigint | ID único |
| name | string | Nome do usuário |
| email | string | Email (único) |
| password | string | Senha hash (bcrypt) |
| profile_photo_url | string | URL da foto de perfil |
| bio | text | Biografia |
| email_verified_at | timestamp | Verificação de email |
| created_at | timestamp | Data de criação |
| deleted_at | timestamp | Soft delete |

### Deck

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | bigint | ID único |
| user_id | bigint | FK para users |
| parent_id | bigint | FK para decks (subdeck) |
| name | string | Nome do deck |
| description | text | Descrição |
| icon | string | Ícone emoji ou classe |
| color | string | Cor hex (#RRGGBB) |
| image_url | string | URL da imagem de capa |
| is_public | boolean | Visibilidade pública |
| order | integer | Ordem de exibição |
| created_at | timestamp | Data de criação |
| deleted_at | timestamp | Soft delete |

### Card

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | bigint | ID único |
| deck_id | bigint | FK para decks |
| user_id | bigint | FK para users |
| front | text | Frente do card |
| back | text | Verso do card |
| tags | string | Tags separadas por vírgula |
| category | string | Categoria |
| image_url | string | URL da imagem |
| audio_url | string | URL do áudio TTS |
| type | string | Tipo (text, image, audio) |
| mastery_level | integer | Nível de domínio (0-5) |
| next_review_at | timestamp | Próxima revisão agendada |
| last_studied_at | timestamp | Última vez estudado |
| created_at | timestamp | Data de criação |
| deleted_at | timestamp | Soft delete |

### StudySession

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | bigint | ID único |
| user_id | bigint | FK para users |
| deck_id | bigint | FK para decks |
| card_id | bigint | FK para cards |
| response | enum | know_it, kinda_know, dont_know |
| quality | integer | Qualidade da resposta (0-5) |
| time_spent_seconds | integer | Tempo gasto no card |
| created_at | timestamp | Data da sessão |

---

## 📊 Fluxo de Estudo

### 1. Algoritmo de Repetição Espaçada

O CardFlow utiliza um algoritmo baseado no **SM-2** (SuperMemo 2) para otimizar a retenção de memória:

```
Intervalo de Revisão = baseado no mastery_level

mastery_level 0: revisar imediatamente
mastery_level 1: revisar em 1 dia
mastery_level 2: revisar em 3 dias
mastery_level 3: revisar em 7 dias
mastery_level 4: revisar em 14 dias
mastery_level 5: revisar em 30 dias
```

### 2. Fluxo de Sessão de Estudo

```
1. Usuário seleciona um deck para estudar
   ↓
2. Backend retorna cards com next_review_at <= hoje
   ↓
3. Frontend exibe card (frente)
   ↓
4. Usuário pensa na resposta
   ↓
5. Card vira (mostra verso)
   ↓
6. Usuário avalia seu conhecimento:
   - ❌ dont_know: mastery_level -= 2 (min 0)
   - 🤔 kinda_know: mastery_level += 1
   - ✅ know_it: mastery_level += 2 (max 5)
   ↓
7. Backend registra StudySession
   ↓
8. Backend atualiza Card:
   - mastery_level
   - next_review_at (calculado)
   - last_studied_at
   ↓
9. Próximo card ou fim da sessão
```

### 3. Exemplo de Request de Estudo

```javascript
// Registrar resposta
POST /api/study/sessions
{
  "deck_id": 1,
  "card_id": 42,
  "response": "know_it",
  "time_spent_seconds": 15
}

// Buscar estatísticas
GET /api/study/decks/1/stats
Response:
{
  "deck_id": 1,
  "total_cards": 50,
  "studied_cards": 30,
  "total_sessions": 145,
  "mastery_percentage": 60,
  "response_distribution": {
    "know_it": 90,
    "kinda_know": 35,
    "dont_know": 20
  },
  "total_time_spent_minutes": 127
}
```

---

## 🎨 Frontend - Páginas Principais

### Landing Page (`/`)

- Hero section com animação de rede neural
- Apresentação de funcionalidades
- Depoimentos
- Planos e preços
- Call-to-action para registro

### Dashboard (`/dashboard`)

- Visão geral de estatísticas
- Decks recentes
- Progresso de estudo
- Gráficos de desempenho
- Atalhos rápidos

### Decks (`/dashboard/decks`)

- Lista de todos os decks
- Criação de novo deck
- Edição e exclusão
- Duplicação de decks
- Organização hierárquica

### Estudo (`/dashboard/study/[deckId]`)

- Sessão de estudo interativa
- Player de áudio para TTS
- Sistema de 3 botões (dont_know, kinda_know, know_it)
- Progresso em tempo real
- Estatísticas pós-sessão

### Biblioteca (`/dashboard/library`)

- Explorar decks públicos
- Busca e filtros
- Importar decks de outros usuários

### Configurações (`/dashboard/settings`)

- Edição de perfil
- Upload de foto
- Preferências de estudo
- Gerenciamento de conta

---

## 🧪 Testes

### Backend (PHPUnit)

```bash
cd backend

# Executar todos os testes
php artisan test

# Testes com coverage
php artisan test --coverage

# Testes específicos
php artisan test --filter DeckControllerTest
```

### Frontend (Jest - configurar)

```bash
cd frontend

# Executar testes
npm test

# Testes em watch mode
npm test -- --watch
```

---

## 🔒 Segurança

### Autenticação

- **Laravel Sanctum**: Tokens SPA e API
- **bcrypt**: Hash de senhas
- **CSRF Protection**: Tokens CSRF
- **Rate Limiting**: Limite de requisições

### Autorização

- **Policies**: Controle de acesso granular
- **Middleware**: Verificação de autenticação
- **Ownership Check**: Usuário só acessa seus recursos

### Melhores Práticas

- ✅ Variáveis de ambiente para secrets
- ✅ HTTPS obrigatório em produção
- ✅ Validação rigorosa de inputs
- ✅ SQL Injection prevenido (Eloquent)
- ✅ XSS prevenido (sanitização)
- ✅ Soft deletes para preservar dados

---

## 📈 Performance

### Otimizações Implementadas

- **Redis Cache**: Cache de queries e sessões
- **Eager Loading**: Prevenção de N+1 queries
- **Index Database**: Índices em colunas frequentes
- **CDN S3**: Assets servidos via CloudFront
- **Image Optimization**: Next.js Image Component
- **Code Splitting**: Carregamento sob demanda
- **Turbopack**: Build otimizado no Next.js 15

### Monitoramento

```bash
# Logs do Laravel
tail -f backend/storage/logs/laravel.log

# Logs do Docker
docker-compose logs -f backend

# Monitorar Redis
docker-compose exec redis redis-cli MONITOR
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

1. **Fork o projeto**
2. **Crie uma branch** para sua feature
   ```bash
   git checkout -b feature/MinhaFeature
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'Adiciona MinhaFeature'
   ```
4. **Push para a branch**
   ```bash
   git push origin feature/MinhaFeature
   ```
5. **Abra um Pull Request**

### Padrões de Código

- **Backend**: PSR-12, Laravel Pint
- **Frontend**: ESLint, Prettier
- **Commits**: Conventional Commits

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Shelby3344** - *Desenvolvedor Principal* - [GitHub](https://github.com/Shelby3344)

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/Shelby3344/cardflow/issues)
- **Email**: suporte@cardflow.com
- **Documentação**: [Wiki](https://github.com/Shelby3344/cardflow/wiki)

---

## 🗺️ Roadmap

### Em Desenvolvimento

- [ ] App mobile (React Native)
- [ ] Gamificação (pontos, badges)
- [ ] Sistema de amigos
- [ ] Compartilhamento social
- [ ] Import/Export de decks
- [ ] Integração com Anki

### Futuro

- [ ] Modo offline (PWA)
- [ ] IA para gerar flashcards automaticamente
- [ ] Reconhecimento de voz para respostas
- [ ] Multiplayer (estudar com amigos)
- [ ] Marketplace de decks premium

---

## 🙏 Agradecimentos

- [Laravel](https://laravel.com) - Framework PHP
- [Next.js](https://nextjs.org) - Framework React
- [OpenAI](https://openai.com) - API de Text-to-Speech
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Docker](https://docker.com) - Containerização

---

**Desenvolvido com ❤️ para revolucionar seus estudos!**

🧠 **CardFlow** - Aprenda mais, lembre melhor.
