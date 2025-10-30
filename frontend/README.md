# CardFlow Frontend

Interface moderna e responsiva para o CardFlow - plataforma de estudos com flashcards inteligentes e IA de leitura.

## 🚀 Tecnologias

- **Next.js 14+** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização com design system customizado
- **React Query** - Gerenciamento de estado assíncrono
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones modernos

## 📦 Instalação

```bash
cd frontend
npm install
```

## ⚙️ Configuração

Crie o arquivo `.env.local` baseado no `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_VOICE_API_URL=http://localhost/voice-api
```

## 🚀 Desenvolvimento

```bash
# Modo de desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint
```

Acesse [http://localhost:3000](http://localhost:3000) para ver o resultado.

## 🎨 Design System

O projeto utiliza um tema customizado com variáveis CSS:

- **Primary**: Violet/Purple gradient
- **Secondary**: Complementar ao primary
- **Muted**: Cinza para backgrounds
- **Destructive**: Vermelho para ações destrutivas
- **Border**: Borders sutis
- **Dark Mode**: Suporte completo

## 📂 Estrutura de Páginas

```
app/
├── page.tsx                    # Landing page pública
├── login/page.tsx              # Página de login
├── register/page.tsx           # Página de registro
├── dashboard/
│   ├── layout.tsx             # Layout com sidebar
│   ├── page.tsx               # Lista de decks
│   └── decks/[id]/
│       ├── page.tsx           # Visualizar deck e cards
│       └── study/page.tsx     # Modo de estudo
```

## 🔐 Autenticação

O sistema utiliza JWT tokens armazenados no `localStorage`:

```typescript
// Login
const { data } = await api.post('/login', { email, password });
login(data.user, data.token);

// Logout
logout();
router.push('/');
```

## 🎯 Funcionalidades Implementadas

### ✅ Landing Page
- Hero section com gradiente
- Grid de features com ícones
- CTA (Call to Action)
- Footer responsivo
- Design profissional sem emojis

### ✅ Autenticação
- Login com validação
- Registro com confirmação de senha
- Proteção de rotas
- Logout

### ✅ Dashboard
- Sidebar com navegação
- Menu mobile responsivo
- Informações do usuário
- Tema claro/escuro

### ✅ Gerenciamento de Decks
- Listar decks do usuário
- Criar novo deck
- Editar deck existente
- Excluir deck
- Indicador de público/privado
- Contador de cards

### ✅ Gerenciamento de Cards
- Listar cards de um deck
- Adicionar novo card
- Editar card
- Excluir card
- Suporte a tipos: texto, imagem, áudio
- Tags e categorias
- Filtros visuais por tipo

### ✅ Modo de Estudo
- Flashcard com animação de flip 3D
- Barra de progresso
- Navegação entre cards
- Botões de dificuldade (Fácil/Médio/Difícil)
- Placeholder para áudio com IA
- Tela de conclusão

## 🔌 Integração com Backend

### API Client

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Interceptor automático de JWT
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Endpoints Utilizados

```typescript
// Autenticação
POST /api/login
POST /api/register
POST /api/logout

// Decks
GET    /api/decks
POST   /api/decks
GET    /api/decks/:id
PUT    /api/decks/:id
DELETE /api/decks/:id

// Cards
GET    /api/cards?deck_id=:id
POST   /api/cards
PUT    /api/cards/:id
DELETE /api/cards/:id
```

## 🎤 Integração com Voice IA (Próximo Passo)

```typescript
// Gerar áudio para um card
const response = await axios.post(
  `${process.env.NEXT_PUBLIC_VOICE_API_URL}/api/tts/card`,
  {
    front: card.front,
    back: card.back,
    pauseDuration: 1.5,
    provider: 'openai', // ou 'elevenlabs'
  }
);
```

## 📱 Responsividade

- **Mobile First**: Design adaptado para dispositivos móveis
- **Breakpoints Tailwind**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Menu Mobile**: Hamburguer menu no dashboard
- **Cards**: Grid responsivo (1/2/3 colunas)

## 🔄 Próximos Passos

- [ ] Integração real com microserviço de voz
- [ ] Sistema de repetição espaçada (SRS)
- [ ] Estatísticas de estudo
- [ ] Compartilhamento de decks públicos
- [ ] Upload de imagens para cards
- [ ] Integração com Stripe para pagamentos

## 📄 Licença

Este projeto faz parte do CardFlow SaaS.

