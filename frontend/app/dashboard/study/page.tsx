'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Volume2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
  id: number;
  front: string;
  back: string;
}

export default function StudyPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([
    { id: 1, front: 'O que é hipertensão arterial?', back: 'Pressão arterial sistólica ≥140 mmHg e/ou diastólica ≥90 mmHg' },
    { id: 2, front: 'Principais sintomas de pneumonia?', back: 'Febre, tosse com expectoração, dispneia, dor torácica' },
    { id: 3, front: 'O que é diabetes mellitus?', back: 'Doença metabólica caracterizada por hiperglicemia crônica' },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState(0);
  const [masteryScore, setMasteryScore] = useState(0);

  const currentCard = cards[currentIndex];
  const totalCards = cards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;

  const handleConfidence = (level: 'low' | 'medium' | 'high') => {
    // Update mastery score based on confidence
    const scoreMap = { low: 1, medium: 2, high: 3 };
    const newScore = masteryScore + scoreMap[level];
    setMasteryScore(newScore);
    setStudiedCards(studiedCards + 1);

    // Move to next card
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Study session complete
      alert(`Session complete! Mastery: ${Math.min(100, Math.round((newScore / (totalCards * 3)) * 100))}%`);
      router.push('/dashboard');
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao Dashboard</span>
          </button>
          
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Progresso</div>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {currentIndex + 1} / {totalCards}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Domínio</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.min(100, Math.round((masteryScore / (totalCards * 3)) * 100))}%
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <div 
              className="relative w-full h-96 cursor-pointer perspective-1000"
              onClick={handleFlip}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center border-4 border-blue-500"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-sm font-semibold text-blue-600 mb-4">PERGUNTA</div>
                  <p className="text-2xl font-bold text-gray-900 text-center mb-6">
                    {currentCard.front}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentCard.front);
                    }}
                    className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-blue-600" />
                  </button>
                  <div className="absolute bottom-6 text-sm text-gray-400">
                    Clique para virar
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-sm font-semibold text-blue-100 mb-4">RESPOSTA</div>
                  <p className="text-2xl font-bold text-white text-center mb-6">
                    {currentCard.back}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentCard.back);
                    }}
                    className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Volume2 className="w-5 h-5 text-white" />
                  </button>
                  <div className="absolute bottom-6 text-sm text-blue-100">
                    Clique para virar de volta
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Confidence Buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4"
          >
            <button
              onClick={() => handleConfidence('low')}
              className="py-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              😕
              <div className="text-sm mt-2">Não Sei</div>
            </button>
            <button
              onClick={() => handleConfidence('medium')}
              className="py-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              🤔
              <div className="text-sm mt-2">Sei Mais ou Menos</div>
            </button>
            <button
              onClick={() => handleConfidence('high')}
              className="py-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
            >
              😊
              <div className="text-sm mt-2">Sei Bem</div>
            </button>
          </motion.div>
        )}

        {!isFlipped && (
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Vire a carta para ver a resposta e avalie sua confiança
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="max-w-4xl mx-auto mt-12 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{studiedCards}</div>
            <div className="text-sm text-gray-600">Cartas Estudadas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">{totalCards - currentIndex - 1}</div>
            <div className="text-sm text-gray-600">Cartas Restantes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">
              {currentIndex > 0 ? Math.round((studiedCards / currentIndex) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Taxa de Retenção</div>
          </div>
        </div>
      </div>
    </div>
  );
}
