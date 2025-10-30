import axios from 'axios';

const voiceApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:3001',
});

export interface TTSGenerateRequest {
  text: string;
  provider?: 'openai' | 'elevenlabs';
}

export interface TTSCardRequest {
  front: string;
  back: string;
  pauseDuration?: number;
  provider?: 'openai' | 'elevenlabs';
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  cached?: boolean;
  provider?: string;
  error?: string;
}

/**
 * Gera áudio para um texto simples
 */
export const generateSpeech = async (
  request: TTSGenerateRequest
): Promise<TTSResponse> => {
  try {
    const response = await voiceApi.post('/api/tts/generate', request);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao gerar áudio:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Erro ao gerar áudio',
    };
  }
};

/**
 * Gera áudio para um flashcard (frente + verso com pausa)
 */
export const generateCardSpeech = async (
  request: TTSCardRequest
): Promise<TTSResponse> => {
  try {
    const response = await voiceApi.post('/api/tts/card', request);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao gerar áudio do card:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Erro ao gerar áudio do card',
    };
  }
};

/**
 * Verifica o status do serviço de voz
 */
export const checkVoiceServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await voiceApi.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('Serviço de voz indisponível:', error);
    return false;
  }
};

export default voiceApi;
