'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, RotateCw, Check, X, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { checkVoiceServiceHealth } from '@/lib/voiceApi';

interface Card {
  id: number;
  front: string;
  back: string;
  type: 'text' | 'image' | 'audio';
  image_url?: string;
  audio_url?: string;
}

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [voiceServiceAvailable, setVoiceServiceAvailable] = useState(true);
  const [voiceProvider, setVoiceProvider] = useState<'openai' | 'elevenlabs'>('openai');
  
  // Hook de áudio
  const audioPlayer = useAudioPlayer({
    onEnded: () => {
      console.log('Áudio finalizado');
    },
    onError: (error) => {
      console.error('Erro no áudio:', error);
    },
  });

  // Verificar disponibilidade do serviço de voz
  useEffect(() => {
    const checkService = async () => {
      const available = await checkVoiceServiceHealth();
      setVoiceServiceAvailable(available);
      if (!available) {
        console.warn('Serviço de voz indisponível');
      }
    };
    checkService();
  }, []);

  // Fetch cards
  const { data: cards, isLoading } = useQuery<Card[]>({
    queryKey: ['cards', deckId],
    queryFn: async () => {
      const response = await api.get(`/cards?deck_id=${deckId}`);
      return response.data;
    },
  });

  const currentCard = cards?.[currentIndex];

  if (!currentCard) {
    return null;
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < (cards?.length || 0) - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePlayAudio = async () => {
    if (!currentCard) return;
    
    const text = isFlipped ? currentCard.back : currentCard.front;
    
    if (audioPlayer.isPlaying) {
      audioPlayer.pause();
    } else {
      await audioPlayer.play(text, voiceProvider);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando cards...</p>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Nenhum card para estudar
        </h2>
        <Link
          href={`/dashboard/decks/${deckId}`}
          className="inline-flex items-center text-violet-600 hover:text-violet-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao deck
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/decks/${deckId}`}
          className="inline-flex items-center text-violet-600 hover:text-violet-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao deck
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Modo Estudo
            </h1>
            <span className="text-gray-600 dark:text-gray-400">
              Card {currentIndex + 1} de {cards.length}
            </span>
          </div>
          
          {/* Voice Provider Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Voz:</span>
            <select
              value={voiceProvider}
              onChange={(e) => setVoiceProvider(e.target.value as 'openai' | 'elevenlabs')}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="openai">OpenAI TTS</option>
              <option value="elevenlabs">ElevenLabs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <div
          onClick={handleFlip}
          className="relative h-96 cursor-pointer perspective-1000"
        >
          <div
            className={`absolute inset-0 transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center">
              <p className="text-sm text-violet-600 mb-4 font-semibold uppercase">
                Pergunta
              </p>
              <p className="text-2xl text-gray-900 dark:text-white text-center">
                {currentCard.front}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Clique para ver a resposta
              </p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden bg-violet-50 dark:bg-violet-900/20 rounded-2xl shadow-2xl border border-violet-200 dark:border-violet-700 p-8 flex flex-col items-center justify-center rotate-y-180">
              <p className="text-sm text-violet-600 dark:text-violet-400 mb-4 font-semibold uppercase">
                Resposta
              </p>
              <p className="text-2xl text-gray-900 dark:text-white text-center">
                {currentCard.back}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
                Como você se saiu?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePlayAudio}
            disabled={audioPlayer.isLoading || !voiceServiceAvailable}
            className="p-4 bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-full hover:bg-violet-200 dark:hover:bg-violet-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
            title={voiceServiceAvailable ? 'Ouvir áudio' : 'Serviço de voz indisponível'}
          >
            {audioPlayer.isLoading ? (
              <div className="h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Volume2 className={`h-6 w-6 ${audioPlayer.isPlaying ? 'animate-pulse' : ''}`} />
            )}
          </button>
          <button
            onClick={handleFlip}
            className="p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
            title="Virar card"
          >
            <RotateCw className="h-6 w-6" />
          </button>
        </div>
        
        {/* Audio Status */}
        {audioPlayer.isLoading && (
          <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
            Gerando áudio com {voiceProvider === 'openai' ? 'OpenAI' : 'ElevenLabs'}...
          </p>
        )}
        {audioPlayer.isPlaying && !audioPlayer.isLoading && (
          <p className="text-xs text-violet-600 dark:text-violet-400">
            🎵 Reproduzindo áudio...
          </p>
        )}
      </div>

      {/* Audio Error Message */}
      {audioPlayer.error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{audioPlayer.error}</p>
        </div>
      )}

      {/* Voice Service Warning */}
      {!voiceServiceAvailable && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Serviço de voz temporariamente indisponível. Continue estudando sem áudio.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Anterior</span>
        </button>

        {isFlipped && (
          <div className="flex space-x-3">
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
              title="Difícil"
            >
              <X className="h-5 w-5" />
              <span>Difícil</span>
            </button>
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors"
              title="Médio"
            >
              <span>Médio</span>
            </button>
            <button
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-3 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
              title="Fácil"
            >
              <Check className="h-5 w-5" />
              <span>Fácil</span>
            </button>
          </div>
        )}

        {!isFlipped && (
          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="flex items-center space-x-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Próximo</span>
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
        )}
      </div>

      {/* Completion */}
      {currentIndex === cards.length - 1 && isFlipped && (
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-center">
          <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Parabéns! Você completou este deck!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Continue praticando para melhorar sua retenção
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Estudar Novamente
            </button>
            <Link
              href={`/dashboard/decks/${deckId}`}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Voltar ao Deck
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
