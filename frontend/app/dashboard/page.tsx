'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Play, MoreHorizontal, Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import EditDeckModal from '../components/modals/EditDeckModal';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal';
import SimpleDeleteModal from '../components/modals/SimpleDeleteModal';
import CreateSubDeckModal from '../components/modals/CreateSubDeckModal';
import RichTextEditor from '../components/RichTextEditor';
import Toast, { ToastType } from '../components/Toast';
import { deckService } from '@/services/deckService';
import { cardService } from '@/services/cardService';
import { studyService, DeckStats } from '@/services/studyService';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';

// Função helper para converter classes Tailwind em gradiente CSS
const getGradientFromTailwind = (tailwindClass: string): string => {
  const colorMap: { [key: string]: string } = {
    'from-blue-500 to-blue-700': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    'from-purple-500 to-purple-700': 'linear-gradient(135deg, #a855f7, #7e22ce)',
    'from-pink-500 to-pink-700': 'linear-gradient(135deg, #ec4899, #be185d)',
    'from-green-500 to-green-700': 'linear-gradient(135deg, #22c55e, #15803d)',
    'from-orange-500 to-orange-700': 'linear-gradient(135deg, #f97316, #c2410c)',
    'from-red-500 to-red-700': 'linear-gradient(135deg, #ef4444, #b91c1c)',
    'from-slate-700 to-slate-900': 'linear-gradient(135deg, #334155, #0f172a)',
    'from-teal-500 to-teal-700': 'linear-gradient(135deg, #14b8a6, #0f766e)',
  };
  
  return colorMap[tailwindClass] || 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [selectedDeckForCards, setSelectedDeckForCards] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'sobre' | 'autor'>('cards');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<any>(null);
  const [openCardMenuId, setOpenCardMenuId] = useState<number | null>(null);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<any>(null);
  const [selectedCardForDelete, setSelectedCardForDelete] = useState<any>(null);
  const [showDeleteCardModal, setShowDeleteCardModal] = useState(false);
  const [editingCards, setEditingCards] = useState<{[key: number]: {front: string, back: string}}>({});
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

  // Buscar cards do deck selecionado para edição
  const { data: cardsForEditing = [], isLoading: cardsForEditingLoading } = useQuery({
    queryKey: ['cards', selectedDeckForCards],
    queryFn: async () => {
      if (!selectedDeckForCards) return [];
      const response = await cardService.getCardsByDeck(selectedDeckForCards);
      return response.success && response.data ? response.data : [];
    },
    enabled: !!selectedDeckForCards,
    staleTime: 1000 * 60 * 2,
  });

  // Buscar subdecks do deck selecionado (para exibir como "flashcards")
  const { data: subdecks = [], isLoading: subdecksLoading } = useQuery({
    queryKey: ['subdecks', selectedDeckId],
    queryFn: async () => {
      if (!selectedDeckId) {
        return [];
      }
      
      const response = await deckService.getDecks();
      
      if (response.success && response.data) {
        // Filtrar apenas subdecks do deck selecionado
        const filtered = response.data.filter((deck: any) => deck.parent_id == selectedDeckId);
        return filtered;
      }
      return [];
    },
    enabled: !!selectedDeckId,
    staleTime: 0, // Sem cache para debug
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  // Limpar queries antigas com subdecksRefreshKey ao montar o componente
  useEffect(() => {
    queryClient.removeQueries({ 
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key[0] === 'subdecks' && key.length === 3;
      }
    });
  }, [queryClient]);

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

  // Fechar menu dropdown de cards ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (openCardMenuId !== null && !target.closest('.card-menu-dropdown')) {
        setOpenCardMenuId(null);
      }
    };

    if (openCardMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openCardMenuId]);

  const handleCreateCard = async (cardData: any) => {
    if (selectedCardForEdit) {
      // Modo edição
      await handleUpdateCard(cardData);
    } else {
      // Modo criação
      createCardMutation.mutate(cardData);
    }
  };

  const handleUpdateCard = async (cardData: any) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cards/${selectedCardForEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          front: cardData.front,
          back: cardData.back,
        }),
      });

      if (response.ok) {
        setToast({
          message: 'Card atualizado com sucesso!',
          type: 'success',
          isVisible: true,
        });
        
        // Invalidar queries para atualizar a lista
        queryClient.invalidateQueries({ queryKey: ['cards', selectedDeckId] });
        queryClient.invalidateQueries({ queryKey: ['deck', selectedDeckId] });
        
        setSelectedCardForEdit(null);
      } else {
        setToast({
          message: 'Erro ao atualizar card',
          type: 'error',
          isVisible: true,
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      setToast({
        message: 'Erro ao atualizar card. Tente novamente.',
        type: 'error',
        isVisible: true,
      });
    }
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
    const targetDeck = deckToDelete || selectedDeck;
    if (!targetDeck) return;

    setShowDeleteModal(false);
    setDeleting(true);
    
    try {
      const response = await deckService.deleteDeck(targetDeck.id);
      if (response.success) {
        // Remover deck otimisticamente de todas as queries
        queryClient.setQueryData(['decks'], (old: any) => {
          if (!old) return old;
          return old.filter((deck: any) => deck.id !== targetDeck.id);
        });
        
        // Invalidar todos os caches relacionados
        queryClient.invalidateQueries({ queryKey: ['decks'] });
        queryClient.invalidateQueries({ queryKey: ['subdecks'] });
        queryClient.invalidateQueries({ queryKey: ['deck', targetDeck.id] });
        queryClient.removeQueries({ queryKey: ['deck', targetDeck.id] });
        queryClient.removeQueries({ queryKey: ['cards', targetDeck.id] });
        
        // Força atualização do menu lateral
        forceRefetch();
        
        // Mostrar toast de sucesso
        setToast({
          message: 'Flashcard excluído com sucesso!',
          type: 'success',
          isVisible: true,
        });
        
        // Se for um subdeck, não redirecionar
        if (targetDeck.parent_id) {
          // Apenas fechar o modal e atualizar a lista
          setOpenCardMenuId(null);
          setDeckToDelete(null);
        } else {
          // Se for deck principal, redirecionar para biblioteca
          router.push('/dashboard/library');
        }
      } else {
        setToast({
          message: 'Erro ao excluir flashcard',
          type: 'error',
          isVisible: true,
        });
      }
    } catch (error) {
      console.error('Erro ao excluir flashcard:', error);
      setToast({
        message: 'Erro ao excluir flashcard. Tente novamente.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setDeleting(false);
      setDeckToDelete(null);
    }
  };

  const handleEditCard = (card: any) => {
    setSelectedCardForEdit(card);
    setIsEditMode(true);
    setOpenCardMenuId(null);
    // Scroll to the card in edit mode
    setTimeout(() => {
      const element = document.getElementById(`edit-card-${card.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleEditDeckForCards = (deckId: number) => {
    setSelectedDeckForCards(deckId);
    setIsEditMode(true);
  };

  const handleCreateNewDeck = () => {
    setShowPrompt(true);
  };

  const handleSubdeckSubmit = (subDeckData: any) => {
    handleCreateSubDeck(subDeckData);
  };

  const handleDeleteCardClick = (card: any) => {
    setSelectedCardForDelete(card);
    setShowDeleteCardModal(true);
    setOpenCardMenuId(null);
  };

  const handleConfirmDeleteCard = async () => {
    if (!selectedCardForDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/cards/${selectedCardForDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setToast({
          message: 'Card excluído com sucesso!',
          type: 'success',
          isVisible: true,
        });
        
        // Invalidar queries para atualizar a lista
        queryClient.invalidateQueries({ queryKey: ['cards', selectedDeckId] });
        queryClient.invalidateQueries({ queryKey: ['deck', selectedDeckId] });
      } else {
        setToast({
          message: 'Erro ao excluir card',
          type: 'error',
          isVisible: true,
        });
      }
    } catch (error) {
      console.error('Erro ao excluir card:', error);
      setToast({
        message: 'Erro ao excluir card. Tente novamente.',
        type: 'error',
        isVisible: true,
      });
    } finally {
      setShowDeleteCardModal(false);
      setSelectedCardForDelete(null);
    }
  };

  const handleCreateSubDeck = async (subDeckData: any) => {
    try {
      if (!selectedDeck) {
        setToast({
          message: 'Nenhum deck selecionado',
          type: 'error',
          isVisible: true,
        });
        return;
      }

      const apiData: any = {
        name: subDeckData.name,
        icon: subDeckData.icon || '📚',
        parent_id: selectedDeck.id,
        is_public: false,
      };

      const response = await deckService.createDeck(apiData);
      
      if (response.success) {
        console.log('Subdeck created successfully!');
        console.log('Created subdeck data:', response.data);
        
        // Fechar o modal primeiro
        setShowPrompt(false);
        
        // Mostrar toast de sucesso
        setToast({
          message: 'Flashcard criado com sucesso!',
          type: 'success',
          isVisible: true,
        });
        
        console.log('Invalidating query cache...');
        // Invalidar TODAS as queries relacionadas (força refetch imediato)
        await queryClient.invalidateQueries({ queryKey: ['subdecks'], refetchType: 'all' });
        await queryClient.invalidateQueries({ queryKey: ['decks'], refetchType: 'all' });
        await queryClient.refetchQueries({ queryKey: ['subdecks', selectedDeckId] });
      } else {
        setToast({
          message: 'Erro ao criar flashcard: ' + (response.errors ? JSON.stringify(response.errors) : 'Erro desconhecido'),
          type: 'error',
          isVisible: true,
        });
      }
    } catch (error) {
      console.error('Erro ao criar sub-deck:', error);
      setToast({
        message: 'Erro ao criar flashcard. Verifique o console.',
        type: 'error',
        isVisible: true,
      });
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
              background: selectedDeck.color 
                ? getGradientFromTailwind(selectedDeck.color)
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

      {/* Flashcards do Deck - Estilo Brainscape */}
      <div className="p-8 border-t border-gray-200">
        {/* Menu de Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'cards'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setActiveTab('sobre')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'sobre'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sobre
          </button>
          <button
            onClick={() => setActiveTab('autor')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'autor'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Autor
          </button>
        </div>

        {/* Tab Content: Cards */}
        {activeTab === 'cards' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode && selectedDeckForCards ? 
                  subdecks.find(d => d.id === selectedDeckForCards)?.title || 'Flashcards' 
                  : 'Flashcards'}
              </h2>
              <div className="flex items-center gap-3">
                {isEditMode ? (
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      setSelectedDeckForCards(null);
                      setEditingCards({});
                    }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Voltar
                  </button>
                ) : subdecks.length > 0 ? (
                  <button
                    onClick={handleCreateNewDeck}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Criar Flashcard
                  </button>
                ) : null}
              </div>
            </div>

            {!isEditMode ? (
              /* Lista de Sub-Decks (Flashcards) */
              subdecks.length > 0 ? (
            <div className="space-y-2">
              {subdecks.map((deck: any) => {
                const progress = deck.mastery_percentage || 0;
                
                return (
                  <div
                    key={deck.id}
                    className="group relative bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleEditDeckForCards(deck.id)}
                  >
                    <div className="flex items-center gap-4 py-4 px-5">
                      {/* Porcentagem */}
                      <div className="flex-shrink-0 w-12 text-center">
                        <span className="text-base font-semibold text-gray-700">{progress}%</span>
                      </div>

                      {/* Conteúdo da Matéria - Centro */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {deck.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {deck.card_count || 0} {deck.card_count === 1 ? 'carta' : 'cartas'}
                          </p>
                        </div>
                        
                        {/* Barra de Progresso Horizontal */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              progress >= 75 ? 'bg-green-500' :
                              progress >= 50 ? 'bg-yellow-500' :
                              progress >= 25 ? 'bg-orange-500' :
                              'bg-gray-300'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Botões de Ação - Direita */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Menu de Opções */}
                        <div className="relative card-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenCardMenuId(openCardMenuId === deck.id ? null : deck.id);
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                            title="Mais opções"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Dropdown Menu */}
                          {openCardMenuId === deck.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditDeckForCards(deck.id);
                                  setOpenCardMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Editar Cards
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeckToDelete(deck);
                                  setShowDeleteModal(true);
                                  setOpenCardMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir Flashcard
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Botão Play */}
                        <Link
                          href={`/dashboard/decks/${deck.id}/study`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
                          title="Estudar"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">Nenhum Flashcard criado ainda</p>
              <button
                onClick={handleCreateNewDeck}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all"
              >
                <Plus className="w-5 h-5" />
                Criar primeiro flashcard
              </button>
            </div>
          )
        ) : (
          /* Edit Mode - Inline Editing like Brainscape */
          <div className="space-y-4">
            {/* Cards List in Edit Mode */}
            {cardsForEditing.map((card: any, index: number) => (
              <div
                key={card.id}
                id={`edit-card-${card.id}`}
                className="bg-white border-2 border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-start gap-6">
                  {/* Card Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                    {index + 1}
                  </div>

                  {/* Question (Left Side) */}
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Pergunta
                    </label>
                    <RichTextEditor
                      content={editingCards[card.id]?.front ?? card.front ?? ''}
                      onChange={(content) => setEditingCards({
                        ...editingCards,
                        [card.id]: {
                          ...editingCards[card.id],
                          front: content,
                          back: editingCards[card.id]?.back ?? card.back ?? ''
                        }
                      })}
                      placeholder="Digite a pergunta do flashcard..."
                    />
                  </div>

                  {/* Answer (Right Side) */}
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Resposta
                    </label>
                    <RichTextEditor
                      content={editingCards[card.id]?.back ?? card.back ?? ''}
                      onChange={(content) => setEditingCards({
                        ...editingCards,
                        [card.id]: {
                          front: editingCards[card.id]?.front ?? card.front ?? '',
                          back: content
                        }
                      })}
                      placeholder="Digite a resposta do flashcard..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button
                      onClick={async () => {
                        const cardData = editingCards[card.id];
                        if (cardData) {
                          await handleUpdateCard({ front: cardData.front, back: cardData.back });
                          const newEditingCards = { ...editingCards };
                          delete newEditingCards[card.id];
                          setEditingCards(newEditingCards);
                        }
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Salvar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteCardClick(card)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Card Button */}
            <button
              onClick={async () => {
                if (!selectedDeckForCards) return;
                // Create a new empty card
                const newCard = {
                  deck_id: selectedDeckForCards,
                  front: '',
                  back: ''
                };
                await handleCreateCard(newCard);
              }}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar novo card
            </button>
          </div>
        )}
          </>
        )}

        {/* Tab Content: Sobre */}
        {activeTab === 'sobre' && selectedDeck && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações do Deck</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                <p className="text-gray-900 text-lg">{selectedDeck.title}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <p className="text-gray-600">{selectedDeck.description || 'Sem descrição'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total de Cards</label>
                  <p className="text-gray-900 text-lg">{subdecks.reduce((sum: number, d: any) => sum + (d.card_count || 0), 0)}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-decks</label>
                  <p className="text-gray-900 text-lg">{subdecks.length}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <p className="text-gray-600">{selectedDeck.is_public ? 'Público' : 'Privado'}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Editar Deck
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Autor */}
        {activeTab === 'autor' && selectedDeck && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações do Autor</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{user?.name || 'Usuário'}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Criado em</label>
                <p className="text-gray-600">
                  {selectedDeck.created_at ? new Date(selectedDeck.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Última atualização</label>
                <p className="text-gray-600">
                  {selectedDeck.updated_at ? new Date(selectedDeck.updated_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      <EditDeckModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditDeck}
        onDelete={handleDeleteDeck}
        initialData={selectedDeck ? {
          name: selectedDeck.title,
          description: selectedDeck.description || '',
          icon: selectedDeck.icon || '',
          color: selectedDeck.color || '',
          imageUrl: selectedDeck.image_url || null,
          isPublic: selectedDeck.is_public || false,
        } : undefined}
      />

      {/* Modal de Confirmação de Exclusão do Deck */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeckToDelete(null);
        }}
        onConfirm={handleDeleteDeck}
        title={(deckToDelete || selectedDeck)?.parent_id ? "Excluir Flashcard" : "Excluir Deck"}
        message={(deckToDelete || selectedDeck)?.parent_id 
          ? "Tem certeza que deseja excluir este flashcard? Todos os cards serão permanentemente removidos."
          : "Tem certeza que deseja excluir este deck? Todos os cards e flashcards serão permanentemente removidos."
        }
        itemName={(deckToDelete || selectedDeck)?.title}
      />

      {/* Modal de Confirmação de Exclusão do Card - Simples */}
      <SimpleDeleteModal
        isOpen={showDeleteCardModal}
        onClose={() => {
          setShowDeleteCardModal(false);
          setSelectedCardForDelete(null);
        }}
        onConfirm={handleConfirmDeleteCard}
        itemName={selectedCardForDelete?.front?.replace(/<[^>]*>/g, '') || ''}
      />

      {/* Modal para Criar Flashcard (Subdeck) */}
      <CreateSubDeckModal
        isOpen={showPrompt}
        onClose={() => setShowPrompt(false)}
        onSubmit={handleSubdeckSubmit}
        parentDeckName={selectedDeck?.name || ''}
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
