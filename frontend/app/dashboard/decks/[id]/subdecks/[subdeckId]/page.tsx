'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { cardService } from '@/services/cardService';

interface Card {
  id: number;
  front: string;
  back: string;
  type: 'text' | 'image' | 'audio';
  image_url?: string;
  audio_url?: string;
  tags?: string;
  category?: string;
  study_count?: number;
}

export default function SubDeckCardsPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;
  const subdeckId = params.subdeckId as string;
  
  const [activeTab, setActiveTab] = useState<'preview' | 'browse'>('preview');

  // Buscar cards do subdeck
  const { data: cards = [], isLoading } = useQuery<Card[]>({
    queryKey: ['subdeck-cards', subdeckId],
    queryFn: async () => {
      // Ajustar conforme sua API - pode precisar filtrar por sub_deck_id
      const response = await cardService.getCardsByDeck(parseInt(deckId));
      if (response.success && response.data) {
        // Filtrar cards do subdeck específico
        return response.data.filter((card: any) => card.sub_deck_id === parseInt(subdeckId));
      }
      return [];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <Link
          href={`/dashboard?deck=${deckId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para o deck
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Knowledge Warm-Up
        </h1>
        <p className="text-gray-600">
          Rehabilitate your knowledge with Knowledge Rehab!
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 flex gap-8">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview ({cards.length})
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`py-4 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'browse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Browse ({cards.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="space-y-6">
            {cards.map((card, index) => (
              <div
                key={card.id}
                className="bg-white rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Number and Difficulty Indicator */}
                <div className="flex items-start p-6 gap-6">
                  {/* Left Side - Card Number and Color Bar */}
                  <div className="flex gap-3 items-start flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-400">
                      {index + 1}
                    </div>
                    <div className="w-1 h-24 bg-yellow-400 rounded-full"></div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 grid grid-cols-2 gap-8">
                    {/* Question Side */}
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-3 uppercase">
                        Pergunta
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-gray-900"
                        dangerouslySetInnerHTML={{ __html: card.front }}
                      />
                      {card.image_url && (
                        <div className="mt-4">
                          <img 
                            src={card.image_url} 
                            alt="Card question" 
                            className="max-w-full h-auto rounded-lg border border-gray-200"
                          />
                          <p className="text-xs text-gray-500 mt-2">Credit: Wikimedia.org</p>
                        </div>
                      )}
                    </div>

                    {/* Answer Side */}
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-3 uppercase">
                        Resposta
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: card.back }}
                      />
                    </div>
                  </div>

                  {/* Right Side - Difficulty Dropdown */}
                  <div className="flex-shrink-0">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-700">3</span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Bottom Section - Progress */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="font-medium">Progresso de Aprendizagem</span>
                    <span className="font-semibold">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-300 h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Flashcard #{card.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">Nenhum card neste sub-deck ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}
