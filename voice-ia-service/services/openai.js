const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gera áudio usando OpenAI TTS
 * @param {string} text - Texto para conversão
 * @param {object} options - Opções de voz (voice, speed)
 * @returns {Buffer} - Buffer do áudio em MP3
 */
const generateSpeech = async (text, options = {}) => {
  const { voice = 'alloy', speed = 1.0 } = options;

  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice, // alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: speed,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Erro ao gerar áudio com OpenAI:', error);
    throw error;
  }
};

module.exports = { generateSpeech };
