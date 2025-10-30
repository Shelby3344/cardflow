'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Target } from 'lucide-react';
import StudyCard from '@/app/components/StudyCard';
import { studyService, CardToStudy } from '@/services/studyService';
import { deckService } from '@/services/deckService';

export default function StudySessionPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = Number(params.deckId);

  const [cards, setCards] = useState<CardToStudy[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deckName, setDeckName] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    loadStudySession();
  }, [deckId]);

  const loadStudySession = async () => {
    try {
      setLoading(true);
      
      // Carregar deck info
      const deckResponse = await deckService.getDeck(deckId);
      setDeckName(deckResponse.data.name);

      // Carregar cards para estudar
      const response = await studyService.getCardsToStudy(deckId);
      
      if (response.cards.length === 0) {
        setError('Este deck não possui cards para estudar.');
        return;
      }

      setCards(response.cards);
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar sessão de estudo');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response: 'know_it' | 'kinda_know' | 'dont_know') => {
    try {
      const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);

      // Registrar resposta
      await studyService.recordResponse({
        deck_id: deckId,
        card_id: cards[currentCardIndex].id,
        response,
        time_spent_seconds: timeSpent,
      });

      // Próximo card ou finalizar
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setCardStartTime(Date.now());
      } else {
        setCompleted(true);
      }
    } catch (err: any) {
      console.error('Erro ao registrar resposta:', err);
    }
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  const calculateSessionTime = () => {
    const seconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando sessão...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <Target size={64} className="text-green-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Sessão Completa! 🎉</h1>
            <p className="text-white/60">
              Você estudou {cards.length} {cards.length === 1 ? 'card' : 'cards'} em{' '}
              {calculateSessionTime()}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCompleted(false);
                setCurrentCardIndex(0);
                loadStudySession();
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all"
            >
              Estudar Novamente
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{deckName}</h1>
                <p className="text-white/60 text-sm">Sessão de Estudo</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/60 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{calculateSessionTime()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Card */}
      {cards.length > 0 && (
        <StudyCard
          front={cards[currentCardIndex].front}
          back={cards[currentCardIndex].back}
          onResponse={handleResponse}
          onClose={handleClose}
          currentCard={currentCardIndex + 1}
          totalCards={cards.length}
        />
      )}
    </div>
  );
}
