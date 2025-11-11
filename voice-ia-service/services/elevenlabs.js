const axios = require('axios');

// Lista de vozes permitidas para prevenir SSRF
const ALLOWED_VOICE_IDS = [
  '21m00Tcm4TlvDq8ikWAM', // Default voice
  'EXAVITQu4vr4xnSDxMaL', // Alternative voice 1
  'ErXwobaYiN019PkySvjV', // Alternative voice 2
];

// URL base fixa para prevenir SSRF
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

/**
 * Valida e sanitiza o voiceId para prevenir SSRF
 * @param {string} voiceId - ID da voz
 * @returns {string} - voiceId validado
 */
const validateVoiceId = (voiceId) => {
  // Validar formato: apenas letras e números, sem caracteres especiais
  if (!/^[a-zA-Z0-9]+$/.test(voiceId)) {
    const safeVoiceId = String(voiceId).replace(/[\r\n]/g, '');
    console.warn(`VoiceId inválido: ${safeVoiceId}. Usando default.`);
    return ALLOWED_VOICE_IDS[0];
  }
  
  // Verificar se está na lista de permitidos
  if (!ALLOWED_VOICE_IDS.includes(voiceId)) {
    console.warn(`VoiceId não permitido: ${voiceId}. Usando default.`);
    return ALLOWED_VOICE_IDS[0];
  }
  
  return voiceId;
};

/**
 * Valida parâmetros numéricos
 * @param {number} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {number} defaultValue - Valor padrão
 * @returns {number} - Valor validado
 */
const validateNumericParam = (value, min, max, defaultValue) => {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return defaultValue;
  }
  return num;
};

/**
 * Gera áudio usando ElevenLabs TTS (alternativa)
 * @param {string} text - Texto para conversão
 * @param {object} options - Opções de voz
 * @returns {Buffer} - Buffer do áudio
 */
const generateSpeechElevenLabs = async (text, options = {}) => {
  // Validar e sanitizar inputs
  if (!text || typeof text !== 'string') {
    throw new Error('Texto inválido para conversão de fala');
  }
  
  // Limitar tamanho do texto para prevenir DoS
  const MAX_TEXT_LENGTH = 5000;
  const sanitizedText = text.slice(0, MAX_TEXT_LENGTH);
  
  // Validar voiceId
  const voiceId = validateVoiceId(options.voiceId || ALLOWED_VOICE_IDS[0]);
  
  // Validar parâmetros numéricos
  const stability = validateNumericParam(options.stability, 0, 1, 0.5);
  const similarityBoost = validateNumericParam(options.similarityBoost, 0, 1, 0.75);

  try {
    // Construir URL de forma segura
    const url = `${ELEVENLABS_API_BASE}/text-to-speech/${voiceId}`;
    
    const response = await axios.post(
      url,
      {
        text: sanitizedText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: stability,
          similarity_boost: similarityBoost,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
        timeout: 30000, // Timeout de 30 segundos
        maxContentLength: 10 * 1024 * 1024, // Máximo 10MB
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Erro ao gerar áudio com ElevenLabs:', error.message);
    throw new Error('Falha ao gerar áudio: ' + error.message);
  }
};

module.exports = { generateSpeechElevenLabs };
