const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { generateSpeech } = require('../services/openai');
const { generateSpeechElevenLabs } = require('../services/elevenlabs');
const { getCache, setCache } = require('../utils/redis');
const { uploadAudioToS3 } = require('../utils/s3');

/**
 * POST /api/tts/generate
 * Gera áudio a partir de texto usando OpenAI TTS ou ElevenLabs
 * Com cache Redis e upload para S3
 */
router.post('/generate', async (req, res) => {
  try {
    const { text, voice = 'alloy', speed = 1.0, provider = 'openai' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto é obrigatório.' });
    }

    // Gerar chave de cache baseada no texto + voz + velocidade
    const cacheKey = `tts:${crypto.createHash('md5').update(`${text}-${voice}-${speed}-${provider}`).digest('hex')}`;

    // Verificar cache Redis
    const cachedUrl = await getCache(cacheKey);
    if (cachedUrl) {
      return res.json({ audio_url: cachedUrl, cached: true });
    }

    // Gerar áudio usando IA
    let audioBuffer;
    if (provider === 'elevenlabs') {
      audioBuffer = await generateSpeechElevenLabs(text, { voiceId: voice });
    } else {
      audioBuffer = await generateSpeech(text, { voice, speed });
    }

    // Upload para S3
    const audioUrl = await uploadAudioToS3(audioBuffer);

    // Salvar URL no cache Redis (24h)
    await setCache(cacheKey, audioUrl, 86400);

    res.json({ audio_url: audioUrl, cached: false });
  } catch (error) {
    console.error('Erro ao gerar áudio:', error);
    res.status(500).json({ error: 'Erro ao gerar áudio.', details: error.message });
  }
});

/**
 * POST /api/tts/card
 * Gera áudio para um flashcard (frente + pausa + verso)
 */
router.post('/card', async (req, res) => {
  try {
    const { front, back, pauseDuration = 5, voice = 'alloy', speed = 1.0 } = req.body;

    if (!front || !back) {
      return res.status(400).json({ error: 'Front e back são obrigatórios.' });
    }

    // Gerar chave de cache
    const cacheKey = `card:${crypto.createHash('md5').update(`${front}-${back}-${pauseDuration}-${voice}-${speed}`).digest('hex')}`;

    // Verificar cache
    const cachedUrl = await getCache(cacheKey);
    if (cachedUrl) {
      return res.json({ audio_url: cachedUrl, cached: true });
    }

    // Gerar áudio da frente
    const frontBuffer = await generateSpeech(front, { voice, speed });

    // Gerar áudio do verso
    const backBuffer = await generateSpeech(back, { voice, speed });

    // Por enquanto, retornar URLs separadas (no futuro, combinar em um único áudio)
    const frontUrl = await uploadAudioToS3(frontBuffer, `card-front-${Date.now()}.mp3`);
    const backUrl = await uploadAudioToS3(backBuffer, `card-back-${Date.now()}.mp3`);

    const result = { front_audio: frontUrl, back_audio: backUrl, pause_duration: pauseDuration };

    // Cache
    await setCache(cacheKey, JSON.stringify(result), 86400);

    res.json(result);
  } catch (error) {
    console.error('Erro ao gerar áudio do card:', error);
    res.status(500).json({ error: 'Erro ao gerar áudio do card.', details: error.message });
  }
});

module.exports = router;
