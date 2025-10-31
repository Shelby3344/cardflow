'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

interface StudyCardProps {
  front: string;
  back: string;
  onResponse: (response: 'know_it' | 'kinda_know' | 'dont_know') => void;
  onClose: () => void;
  currentCard: number;
  totalCards: number;
}

export default function StudyCard({
  front,
  back,
  onResponse,
  onClose,
  currentCard,
  totalCards,
}: StudyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleResponse = (response: 'know_it' | 'kinda_know' | 'dont_know') => {
    onResponse(response);
    setIsFlipped(false); // Reset para o próximo card
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-white/60 text-sm">
            Card {currentCard} de {totalCards}
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/10 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${(currentCard / totalCards) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Card Container */}
        <div
          className="relative h-[400px] cursor-pointer mb-6"
          onClick={handleFlip}
          style={{ perspective: '1000px' }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="text-white text-center prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: front }}
              />
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/10 rounded-2xl p-8 flex items-center justify-center"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div
                className="text-white text-center prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: back }}
              />
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        {!isFlipped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-white/60 text-sm mb-6"
          >
            Clique no card para ver a resposta
          </motion.div>
        )}

        {/* Response Buttons */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={() => handleResponse('dont_know')}
              className="flex-1 max-w-[160px] bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 group"
            >
              <ThumbsDown size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Não Sei</span>
            </button>

            <button
              onClick={() => handleResponse('kinda_know')}
              className="flex-1 max-w-[160px] bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 py-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 group"
            >
              <Minus size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Mais ou Menos</span>
            </button>

            <button
              onClick={() => handleResponse('know_it')}
              className="flex-1 max-w-[160px] bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 py-4 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 group"
            >
              <ThumbsUp size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Sei Bem</span>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
