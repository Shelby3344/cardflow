'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, BookOpen, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CreateDeckModal, { DeckFormData } from '@/app/components/modals/CreateDeckModal';
import { deckService } from '@/services/deckService';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'public'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { forceRefetch } = useDashboardStore();
  const { user } = useAuthStore();

  // Usar React Query para buscar e cachear decks
  const { data: decks = [], isLoading: loading } = useQuery({
    queryKey: ['decks', activeFilter],
    queryFn: async () => {
      const response = await deckService.getDecks(activeFilter);
      return response.success && response.data ? response.data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos - dados considerados frescos
    gcTime: 1000 * 60 * 30, // 30 minutos no cache
  });

  // Mutation para criar deck
  const createDeckMutation = useMutation({
    mutationFn: async (deckData: DeckFormData) => {
      return await deckService.createDeck({
        name: deckData.name,
        description: deckData.description,
        icon: deckData.icon,
        color: deckData.color,
        image: deckData.image,
        is_public: deckData.isPublic,
      });
    },
    onMutate: async (newDeck) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['decks', activeFilter] });

      // Snapshot do valor anterior
      const previousDecks = queryClient.getQueryData(['decks', activeFilter]);

      // Otimisticamente adicionar o novo deck
      queryClient.setQueryData(['decks', activeFilter], (old: any) => {
        const optimisticDeck = {
          id: Date.now(), // ID temporário
          name: newDeck.name,
          description: newDeck.description,
          icon: newDeck.icon,
          color: newDeck.color,
          image_url: null,
          is_public: newDeck.isPublic,
          cards_count: 0,
          progress: 0,
          user: null,
        };
        return [...(old || []), optimisticDeck];
      });

      return { previousDecks };
    },
    onSuccess: (response) => {
      if (response.success) {
        // Refetch para sincronizar com servidor (sem loading)
        queryClient.invalidateQueries({ queryKey: ['decks'] });
        // Forçar atualização do menu lateral
        forceRefetch();
        setIsCreateModalOpen(false);
      }
    },
    onError: (error, newDeck, context) => {
      // Rollback em caso de erro
      if (context?.previousDecks) {
        queryClient.setQueryData(['decks', activeFilter], context.previousDecks);
      }
      console.error('Erro ao criar deck:', error);
    },
  });

  const filteredDecks = decks.filter((deck: any) => 
    deck.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDeck = (deckData: DeckFormData) => {
    createDeckMutation.mutate(deckData);
  };

  return (
    <div className="min-h-full p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Biblioteca de Flashcards</h1>
        <p className="text-gray-600">Navegue e gerencie todos os seus decks de flashcards</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveFilter('mine')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'mine'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Meus Decks
          </button>
          <button
            onClick={() => setActiveFilter('public')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'public'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Públicos
          </button>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Criar Deck
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Decks Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDecks.map((deck) => (
            <Link
              key={deck.id}
              href={`/dashboard?deck=${deck.id}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="flex items-start gap-3 mb-3">
                {deck.image_url ? (
                  <img src={deck.image_url} alt={deck.name} className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className={`w-12 h-12 bg-gradient-to-br ${deck.color || 'from-slate-700 to-slate-900'} rounded flex-shrink-0 flex items-center justify-center`}>
                    {deck.icon ? (
                      <span className="text-2xl">{deck.icon}</span>
                    ) : (
                      <BookOpen className="w-6 h-6 text-white" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{deck.name}</h3>
                  <p className="text-xs text-gray-500">{deck.cards_count || 0} cartas</p>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progresso</span>
                  <span className="font-semibold">{deck.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${deck.progress || 0}%` }}
                  />
                </div>
              </div>

              {deck.user && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {user?.profile_photo_url ? (
                    <img 
                      src={`http://localhost${user.profile_photo_url}`}
                      alt={deck.user.name || 'User'}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[8px] font-bold">
                      {deck.user.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span>por {deck.user.name || 'Você'}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredDecks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum deck encontrado</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery 
              ? 'Tente ajustar sua busca ou filtros'
              : 'Comece criando seu primeiro deck de flashcards!'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
             Que tal criar seu primeiro?
            </button>
          )}
        </div>
      )}

      {/* Modal de Criar Deck */}
      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDeck}
        isSubmitting={createDeckMutation.isPending}
      />
    </div>
  );
}
