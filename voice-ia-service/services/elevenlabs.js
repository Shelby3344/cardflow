const axios = require('axios');

/**
 * Gera áudio usando ElevenLabs TTS (alternativa)
 * @param {string} text - Texto para conversão
 * @param {object} options - Opções de voz
 * @returns {Buffer} - Buffer do áudio
 */
const generateSpeechElevenLabs = async (text, options = {}) => {
  const { voiceId = '21m00Tcm4TlvDq8ikWAM', stability = 0.5, similarityBoost = 0.75 } = options;

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: text,
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
      }
    );

    const buffer = Buffer.from(await response.arrayBuffer());

  return buffer;
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Erro ao gerar áudio com ElevenLabs:', error.message);
    throw error;
  }
};

module.exports = { generateSpeechElevenLabs };
