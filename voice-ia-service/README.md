# Voice IA Service - CardFlow

Microserviço Node.js para geração de áudio Text-to-Speech (TTS) com IA.

## Funcionalidades

- ✅ Geração de áudio com **OpenAI TTS** (modelo `tts-1`)
- ✅ Alternativa com **ElevenLabs API**
- ✅ Cache de áudio no **Redis** (economia de custo e tempo)
- ✅ Upload automático para **AWS S3**
- ✅ Endpoint para flashcards (frente + pausa + verso)

## Instalação

```bash
npm install
```

## Configuração

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Preencha as variáveis:
- `OPENAI_API_KEY` - Chave da OpenAI
- `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` - Credenciais AWS
- `REDIS_HOST` - Host do Redis (padrão: localhost)

## Execução

```bash
npm start
```

Modo desenvolvimento (com nodemon):
```bash
npm run dev
```

## Endpoints

### `POST /api/tts/generate`
Gera áudio a partir de texto.

**Body:**
```json
{
  "text": "Olá, mundo!",
  "voice": "alloy",
  "speed": 1.0,
  "provider": "openai"
}
```

**Response:**
```json
{
  "audio_url": "https://bucket.s3.amazonaws.com/audio/xyz.mp3",
  "cached": false
}
```

### `POST /api/tts/card`
Gera áudio para flashcard (frente e verso).

**Body:**
```json
{
  "front": "What is React?",
  "back": "A JavaScript library for building UIs",
  "pauseDuration": 5,
  "voice": "alloy",
  "speed": 1.0
}
```

**Response:**
```json
{
  "front_audio": "https://...",
  "back_audio": "https://...",
  "pause_duration": 5
}
```

## Tecnologias

- Node.js + Express
- OpenAI TTS API
- ElevenLabs API
- Redis (cache)
- AWS S3 (armazenamento)
