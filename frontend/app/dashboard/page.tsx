'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Play, MoreHorizontal, Check, Plus } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import EditDeckModal from '../components/modals/EditDeckModal';
import CreateSubDeckModal from '../components/modals/CreateSubDeckModal';
import CreateCardModal from '../components/modals/CreateCardModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import Toast, { ToastType } from '../components/Toast';
import { deckService } from '@/services/deckService';
import { cardService } from '@/services/cardService';
import { studyService, DeckStats } from '@/services/studyService';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'decks' | 'learners'>('decks');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubDeckModalOpen, setIsSubDeckModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });
  const { forceRefetch } = useDashboardStore();

  // Buscar decks com cache
  const { data: decks = [], isLoading: decksLoading } = useQuery({
    queryKey: ['decks', 'mine'],
    queryFn: async () => {
      const response = await deckService.getDecks('mine');
      return response.success && response.data ? response.data : [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Selecionar deck baseado em URL ou primeiro disponível
  useEffect(() => {
    const deckParam = searchParams.get('deck');
    if (deckParam) {
      setSelectedDeckId(parseInt(deckParam));
    } else if (decks.length > 0 && !selectedDeckId) {
      setSelectedDeckId(decks[0].id);
    }
  }, [decks, searchParams]);

  // Buscar detalhes do deck selecionado
  const { data: selectedDeck, isLoading: deckLoading } = useQuery({
    queryKey: ['deck', selectedDeckId],
    queryFn: async () => {
      if (!selectedDeckId) return null;
      const response = await deckService.getDeck(selectedDeckId);
      return response.success ? response.data : null;
    },
    enabled: !!selectedDeckId,
    staleTime: 1000 * 60 * 5,
  });

  // Buscar cards do deck
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['cards', selectedDeckId],
    queryFn: async () => {
      if (!selectedDeckId) return [];
      const response = await cardService.getCardsByDeck(selectedDeckId);
      return response.success && response.data ? response.data : [];
    },
    enabled: !!selectedDeckId,
    staleTime: 1000 * 60 * 5,
  });

  const loading = decksLoading || deckLoading || cardsLoading;

  // Fechar menu de opções ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.options-menu-container')) {
          setShowOptionsMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  const handleCreateCard = async (cardData: any) => {
    createCardMutation.mutate(cardData);
  };

  // Mutation para criar card com otimistic updates
  const createCardMutation = useMutation({
    mutationFn: async (cardData: any) => {
      const apiData: any = {
        deck_id: selectedDeck.id,
        front: cardData.front,
        back: cardData.back,
      };
      
      // Adicionar sub_deck_id se fornecido
      if (cardData.sub_deck_id) {
        apiData.sub_deck_id = cardData.sub_deck_id;
      }
      
      return await cardService.createCard(apiData);
    },
    onMutate: async (newCard) => {
      // Cancelar queries em andamento
      await queryClient.cancelQueries({ queryKey: ['deck', selectedDeckId] });
      await queryClient.cancelQueries({ queryKey: ['cards', selectedDeckId] });

      // Snapshot dos valores anteriores
      const previousDeck = queryClient.getQueryData(['deck', selectedDeckId]);
      const previousCards = queryClient.getQueryData(['cards', selectedDeckId]);

      // Criar card otimista
      const optimisticCard = {
        id: Date.now(), // ID temporário
        front: newCard.front,
        back: newCard.back,
        deck_id: selectedDeck.id,
        sub_deck_id: newCard.sub_deck_id || null,
        created_at: new Date().toISOString(),
      };

      // Otimisticamente adicionar o card à lista de cards
      queryClient.setQueryData(['cards', selectedDeckId], (old: any) => {
        return [...(old || []), optimisticCard];
      });
      
      // Otimisticamente atualizar o deck
      queryClient.setQueryData(['deck', selectedDeckId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          cards: [...(old.cards || []), optimisticCard],
          cards_count: (old.cards_count || 0) + 1,
        };
      });

      return { previousDeck, previousCards };
    },
    onSuccess: (response) => {
      if (response.success) {
        // Invalidar queries para sincronizar com servidor
        queryClient.invalidateQueries({ queryKey: ['deck', selectedDeckId] });
        queryClient.invalidateQueries({ queryKey: ['cards', selectedDeckId] });
        queryClient.invalidateQueries({ queryKey: ['decks'] }); // Atualizar lista de decks
        // Atualizar menu lateral
        forceRefetch();
        // Fechar modal
        setIsCardModalOpen(false);
        // Mostrar toast de sucesso
        setToast({
          message: 'Flashcard criado com sucesso!',
          type: 'success',
          isVisible: true,
        });
      } else {
        setToast({
          message: 'Erro ao criar flashcard: ' + (response.errors ? JSON.stringify(response.errors) : 'Erro desconhecido'),
          type: 'error',
          isVisible: true,
        });
      }
    },
    onError: (error, newCard, context) => {
      // Rollback em caso de erro
      if (context?.previousDeck) {
        queryClient.setQueryData(['deck', selectedDeckId], context.previousDeck);
      }
      if (context?.previousCards) {
        queryClient.setQueryData(['cards', selectedDeckId], context.previousCards);
      }
      console.error('Erro ao criar flashcard:', error);
      setToast({
        message: 'Erro ao criar flashcard. Tente novamente.',
        type: 'error',
        isVisible: true,
      });
    },
  });

  const handleEditDeck = async (deckData: any) => {
    try {
      const apiData: any = {
        name: deckData.name,
        description: deckData.description || undefined,
        icon: deckData.icon || undefined,
        color: deckData.color || undefined,
        is_public: deckData.isPublic || false,
      };

      if (deckData.image) {
        apiData.image = deckData.image;
      }

      if (deckData.removeImage) {
        apiData.remove_image = true;
      }

      const response = await deckService.updateDeck(selectedDeck.id, apiData);
      if (response.success) {
        alert('Deck atualizado com sucesso!');
        setIsEditModalOpen(false);
        // Recarregar dados do deck
        queryClient.invalidateQueries({ queryKey: ['deck', selectedDeckId] });
        queryClient.invalidateQueries({ queryKey: ['decks'] });
      } else {
        alert('Erro ao atualizar deck: ' + (response.errors ? JSON.stringify(response.errors) : 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao atualizar deck:', error);
      alert('Erro ao atualizar deck. Verifique o console.');
    }
  };

  const handleDeleteDeck = async () => {
    if (!selectedDeck) return;

    setShowDeleteModal(false);
    setDeleting(true);
    
    try {
      const response = await deckService.deleteDeck(selectedDeck.id);
      if (response.success) {
        // Remover deck otimisticamente de todas as queries
        queryClient.setQueryData(['decks'], (old: any) => {
          if (!old) return old;
          return old.filter((deck: any) => deck.id !== selectedDeck.id);
        });
        
        // Invalidar todos os caches relacionados
        queryClient.invalidateQueries({ queryKey: ['decks'] });
        queryClient.invalidateQueries({ queryKey: ['deck', selectedDeck.id] });
        queryClient.removeQueries({ queryKey: ['deck', selectedDeck.id] });
        queryClient.removeQueries({ queryKey: ['cards', selectedDeck.id] });
        
        // Força atualização do menu lateral
        forceRefetch();
        
        // Mostrar toast de sucesso
        setToast({
          message: 'Deck excluído com sucesso!',
          type: 'success',
          isVisible: true,
        });
        
        // Redirecionar para biblioteca imediatamente
        router.push('/dashboard/library');
      } else {
        setToast({
          message: 'Erro ao excluir deck',
          type: 'error',
          isVisible: true,
        });
      }
    } catch (error) {
      console.error('Erro ao excluir deck:', error);
      setToast({
        message: 'Erro ao excluir deck. Tente novamente.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateSubDeck = async (subDeckData: any) => {
    try {
      const apiData: any = {
        name: subDeckData.name,
        description: subDeckData.description || undefined,
        parent_id: selectedDeck.id,
        is_public: false,
      };

      const response = await deckService.createDeck(apiData);
      if (response.success) {
        alert('Sub-deck criado com sucesso!');
        setIsSubDeckModalOpen(false);
        // Recarregar dados do deck
        queryClient.invalidateQueries({ queryKey: ['deck', selectedDeckId] });
        queryClient.invalidateQueries({ queryKey: ['decks'] });
      } else {
        alert('Erro ao criar sub-deck: ' + (response.errors ? JSON.stringify(response.errors) : 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao criar sub-deck:', error);
      alert('Erro ao criar sub-deck. Verifique o console.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Empty state quando não há decks
  if (!selectedDeck) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Nenhum deck criado</h2>
            <p className="text-gray-600 mb-8">
              Comece criando seu primeiro deck de flashcards para começar a estudar de forma eficiente!
            </p>
          </div>
          
          <Link
            href="/dashboard/library"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
          >
            <Plus className="w-6 h-6" />
            CRIAR MEU PRIMEIRO DECK
          </Link>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Ou explore decks públicos da comunidade</p>
            <Link
              href="/dashboard/library?tab=public"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              Ver decks públicos →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header do Deck */}
      <div className="bg-gradient-to-br from-blue-50 to-white p-8">
        <div className="flex items-start gap-6">
          {/* Imagem do Deck */}
          <div 
            className="w-40 h-40 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden"
            style={{
              backgroundColor: selectedDeck.color || '#1e293b',
              background: selectedDeck.color 
                ? `linear-gradient(135deg, ${selectedDeck.color}dd, ${selectedDeck.color})` 
                : 'linear-gradient(135deg, #1e293b, #0f172a)'
            }}
          >
            {selectedDeck.image ? (
              <img 
                src={`http://localhost${selectedDeck.image}`} 
                alt={selectedDeck.name} 
                className="w-full h-full object-cover" 
              />
            ) : selectedDeck.icon ? (
              <span className="text-6xl">{selectedDeck.icon}</span>
            ) : (
              <span className="text-6xl">📚</span>
            )}
          </div>

          {/* Informações do Deck */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-4xl font-bold text-gray-900">{selectedDeck.title}</h1>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {user?.profile_photo_url ? (
                    <img 
                      src={`http://localhost${user.profile_photo_url}`} 
                      alt={user.name || 'User'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedDeck.author?.charAt(0) || user?.name?.charAt(0) || 'U'
                  )}
                </div>
                <span><span className="font-semibold">Por:</span> {selectedDeck.author || user?.name || 'Usuário'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Cartas Estudadas:</span>
                <span className="text-blue-600 font-bold">
                  {selectedDeck.studied_cards || 0} de {selectedDeck.total_cards || 0}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {selectedDeck.mastery_percentage !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Domínio:</span>
                  <span className="text-green-600 font-bold">{selectedDeck.mastery_percentage}%</span>
                </div>
              )}
              {selectedDeck.total_time_spent_minutes > 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Tempo Total:</span>
                  <span className="text-purple-600 font-bold">{selectedDeck.total_time_spent_minutes.toFixed(0)} min</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-semibold">Tempo Restante Estimado:</span>
                <span className="text-orange-600 font-bold">{selectedDeck.estimatedTime || '0m'}</span>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(selectedDeck.cards_count > 0 || cards.length > 0) ? (
                <Link
                  href={`/dashboard/study/${selectedDeck.id}`}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
                >
                  <Play className="w-6 h-6 fill-current" />
                  ESTUDAR
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-10 py-4 bg-gray-300 text-gray-500 rounded-full font-bold text-lg cursor-not-allowed opacity-60"
                  title="Adicione cards para começar a estudar"
                >
                  <Play className="w-6 h-6 fill-current" />
                  ESTUDAR
                </button>
              )}
              <button
                onClick={() => setIsCardModalOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full font-bold transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                CRIAR CARD
              </button>
              <div className="relative options-menu-container">
                <button 
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  className="p-4 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-700 rounded-full transition-all"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                
                {/* Menu dropdown */}
                {showOptionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setIsEditModalOpen(true);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Editar Deck
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        setShowOptionsMenu(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Excluir Deck
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Círculo de Domínio (Mastery) */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#e5e7eb" 
                  strokeWidth="10" 
                  fill="none" 
                />
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  stroke="#3b82f6" 
                  strokeWidth="10" 
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - selectedDeck.mastery / 100)}`}
                  className="transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xs text-gray-500 font-semibold">Domínio</div>
                <div className="text-3xl font-bold text-blue-600">{selectedDeck.mastery_percentage || 0}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards do Deck */}
      <div className="p-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Flashcards</h2>
          <div className="text-sm text-gray-600">
            {cards.length} {cards.length === 1 ? 'card' : 'cards'}
          </div>
        </div>

        {cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card: any) => {
              // Calcular progresso de aprendizagem (simulado - pode ser substituído por dados reais do backend)
              const studyCount = card.study_count || 0;
              const maxStudies = 10; // número máximo de estudos para considerar 100%
              const progress = Math.min((studyCount / maxStudies) * 100, 100);
              
              // Determinar cor baseada no progresso
              let progressColor = 'bg-red-500';
              if (progress >= 75) progressColor = 'bg-green-500';
              else if (progress >= 50) progressColor = 'bg-yellow-500';
              else if (progress >= 25) progressColor = 'bg-orange-500';
              
              return (
                <div key={card.id} className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:shadow-lg transition-all hover:border-blue-300">
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-blue-600 mb-2">PERGUNTA</div>
                    <div 
                      className="prose prose-sm max-w-none text-gray-800"
                      dangerouslySetInnerHTML={{ __html: card.front }}
                    />
                  </div>
                  
                  {/* Barra de Progresso de Aprendizagem */}
                  <div className="mt-4 mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">Progresso de Aprendizagem</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${progressColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>Flashcard #{card.id}</span>
                    {card.sub_deck_id && <span>📁 Subdeck</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500 mb-4">Nenhum flashcard criado ainda</p>
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all"
            >
              <Plus className="w-5 h-5" />
              Criar primeiro flashcard
            </button>
          </div>
        )}
      </div>

      {/* Sub-Decks */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sub-Decks</h2>
          <button
            onClick={() => setIsSubDeckModalOpen(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            + Criar Sub-Deck
          </button>
        </div>

        {selectedDeck.subDecks && selectedDeck.subDecks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDeck.subDecks.map((subDeck: any) => (
              <div key={subDeck.id} className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{subDeck.name}</h3>
                  {subDeck.completed && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {subDeck.cardsStudied || 0} de {subDeck.totalCards || 0} cartas
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${subDeck.progress}%` }}
                  />
                </div>
                <button
                  onClick={() => setIsCardModalOpen(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Criar Card
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">Nenhum sub-deck criado ainda</p>
            <button
              onClick={() => setIsSubDeckModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Criar primeiro sub-deck
            </button>
          </div>
        )}
      </div>

      {/* Modais */}
      <EditDeckModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditDeck}
        onDelete={handleDeleteDeck}
        initialData={{
          name: selectedDeck.title,
          description: selectedDeck.description || '',
          icon: selectedDeck.icon || '',
          color: selectedDeck.color || '',
          imageUrl: selectedDeck.image_url || null,
          isPublic: selectedDeck.is_public || false,
        }}
      />

      <CreateSubDeckModal
        isOpen={isSubDeckModalOpen}
        onClose={() => setIsSubDeckModalOpen(false)}
        onSubmit={handleCreateSubDeck}
        parentDeckName={selectedDeck.title}
      />

      <CreateCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSubmit={handleCreateCard}
        deckName={selectedDeck.title}
        isSubmitting={createCardMutation.isPending}
      />

      {/* Modal de Confirmação de Exclusão */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteDeck}
        title="Excluir Deck"
        message="Tem certeza que deseja excluir este deck? Todos os cards e subdecks serão permanentemente removidos."
        itemName={selectedDeck?.title}
      />

      {/* Toast de Notificação */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
