import { useState, useRef, useEffect } from 'react';
import { generateSpeech, TTSGenerateRequest } from '@/lib/voiceApi';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onError?: (error: string) => void;
}

export const useAudioPlayer = (options?: UseAudioPlayerOptions) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Criar elemento de áudio
    audioRef.current = new Audio();

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
      options?.onEnded?.();
    });

    audioRef.current.addEventListener('error', () => {
      setIsPlaying(false);
      setError('Erro ao reproduzir áudio');
      options?.onError?.('Erro ao reproduzir áudio');
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const play = async (text: string, provider: 'openai' | 'elevenlabs' = 'openai') => {
    try {
      setIsLoading(true);
      setError(null);

      // Parar áudio atual se estiver tocando
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      // Gerar novo áudio
      const response = await generateSpeech({ text, provider });

      if (!response.success || !response.audioUrl) {
        throw new Error(response.error || 'Falha ao gerar áudio');
      }

      // Reproduzir áudio
      if (audioRef.current) {
        audioRef.current.src = response.audioUrl;
        setCurrentAudioUrl(response.audioUrl);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao reproduzir áudio';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      console.error('Erro no player de áudio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playFromUrl = async (audioUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Parar áudio atual se estiver tocando
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      // Reproduzir áudio da URL
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        setCurrentAudioUrl(audioUrl);
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: any) {
      const errorMessage = 'Erro ao reproduzir áudio';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      console.error('Erro ao reproduzir áudio da URL:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const toggle = async (text: string, provider: 'openai' | 'elevenlabs' = 'openai') => {
    if (isPlaying) {
      pause();
    } else {
      await play(text, provider);
    }
  };

  return {
    play,
    playFromUrl,
    pause,
    stop,
    toggle,
    isPlaying,
    isLoading,
    error,
    currentAudioUrl,
  };
};
