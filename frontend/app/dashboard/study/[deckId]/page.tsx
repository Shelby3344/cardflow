'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Target } from 'lucide-react';
import { studyService, CardToStudy } from '@/services/studyService';
import { deckService } from '@/services/deckService';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionStats {
  totalCards: number;
  currentCard: number;
  confidence: number;
  responses: {
    level: number;
    cardId: number;
    timeSpent: number;
  }[];
}

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
  const [flipped, setFlipped] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [stats, setStats] = useState<SessionStats>({
    totalCards: 0,
    currentCard: 0,
    confidence: 50,
    responses: []
  });

  useEffect(() => {
    loadStudySession();
  }, [deckId]);

  // Atualizar o timer a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
      setStats({
        totalCards: response.cards.length,
        currentCard: 1,
        confidence: 50,
        responses: []
      });
      setSessionStartTime(Date.now());
      setCardStartTime(Date.now());
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar sessão de estudo');
    } finally {
      setLoading(false);
    }
  };

  const calculateConfidence = (responses: { level: number }[]) => {
    if (responses.length === 0) return 50;
    
    // Calcula confiança baseado nos níveis (0-5)
    // 0 = 0%, 1 = 20%, 2 = 40%, 3 = 60%, 4 = 80%, 5 = 100%
    const total = responses.reduce((sum, r) => sum + r.level, 0);
    const average = total / responses.length;
    return Math.round((average / 5) * 100);
  };

  const handleDifficultyRating = async (level: number) => {
    try {
      const timeSpent = Math.floor((Date.now() - cardStartTime) / 1000);

      // Mapear nível (0-5) para o sistema antigo (compatibilidade backend)
      let response: 'know_it' | 'kinda_know' | 'dont_know';
      if (level >= 4) response = 'know_it';
      else if (level >= 2) response = 'kinda_know';
      else response = 'dont_know';

      // Registrar resposta
      await studyService.recordResponse({
        deck_id: deckId,
        card_id: cards[currentCardIndex].id,
        response,
        time_spent_seconds: timeSpent,
      });

      // Atualizar estatísticas
      const newResponses = [...stats.responses, { level, cardId: cards[currentCardIndex].id, timeSpent }];
      const newConfidence = calculateConfidence(newResponses);

      // Próximo card ou finalizar
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setStats({
          ...stats,
          currentCard: currentCardIndex + 2,
          confidence: newConfidence,
          responses: newResponses
        });
        setCardStartTime(Date.now());
        setFlipped(false);
      } else {
        setStats({
          ...stats,
          confidence: newConfidence,
          responses: newResponses
        });
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
    const seconds = Math.floor((currentTime - sessionStartTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl">Carregando sessão...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-900 transition-all"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    const sessionTime = calculateSessionTime();
    const avgTimePerCard = stats.responses.length > 0 
      ? Math.round(stats.responses.reduce((sum, r) => sum + r.timeSpent, 0) / stats.responses.length)
      : 0;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="mb-8">
            <Target size={80} className="text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sessão Completa! </h1>
            
            {/* Confiança Final */}
            <div className="mb-6">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={`${(stats.confidence / 100) * 552.92} 552.92`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900">{stats.confidence}%</div>
                    <div className="text-sm text-gray-600 mt-1">Confiança</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{cards.length}</div>
                <div className="text-sm">Cards estudados</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{sessionTime}</div>
                <div className="text-sm">Tempo total</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{avgTimePerCard}s</div>
                <div className="text-sm">Média por card</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">
                  {stats.responses.filter(r => r.level >= 4).length}
                </div>
                <div className="text-sm">Acertos</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setCompleted(false);
                setCurrentCardIndex(0);
                setFlipped(false);
                loadStudySession();
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Estudar Novamente
            </button>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-900 transition-all"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{deckName}</h1>
                <p className="text-gray-600 text-sm">Sessão de Estudo</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-gray-600 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Nesta rodada: {calculateSessionTime()}</span>
              </div>
              <div className="text-gray-900 font-medium">
                Cartão: {stats.currentCard}/{stats.totalCards}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Confidence Meter */}
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="rgba(0,0,0,0.1)"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#confidence-gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(stats.confidence / 100) * 439.82} 439.82`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="confidence-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{stats.confidence}%</div>
                <div className="text-xs text-gray-600 mt-1">Confiança adquirida</div>
              </div>
            </div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={flipped ? 'back' : 'front'}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl min-h-[300px] flex items-center justify-center"
            >
              <div 
                className="text-gray-900 text-lg text-center prose max-w-none"
                dangerouslySetInnerHTML={{ __html: flipped ? currentCard.back : currentCard.front }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        {!flipped ? (
          <div className="flex justify-center">
            <button
              onClick={() => setFlipped(true)}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Revelar Resposta
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center text-gray-700 text-sm mb-4 font-medium">
              Autoavaliação: Qual foi o nível de dificuldade?
            </div>
            <div className="grid grid-cols-6 gap-3">
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleDifficultyRating(level)}
                  className={`
                    py-4 rounded-xl font-bold text-lg transition-all
                    ${level === 0 ? 'bg-red-500 hover:bg-red-600' : ''}
                    ${level === 1 ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    ${level === 2 ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                    ${level === 3 ? 'bg-lime-500 hover:bg-lime-600' : ''}
                    ${level === 4 ? 'bg-green-500 hover:bg-green-600' : ''}
                    ${level === 5 ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                    text-white shadow-lg hover:shadow-xl hover:scale-105
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 px-1">
              <span>Muito difícil</span>
              <span>Muito fácil</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
