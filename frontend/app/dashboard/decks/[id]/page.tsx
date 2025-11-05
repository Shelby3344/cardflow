'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Volume2,
  Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Card {
  id: number;
  front: string;
  back: string;
  type: 'text' | 'image' | 'audio';
  image_url?: string;
  audio_url?: string;
  tags?: string;
  category?: string;
}

interface Deck {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
}

export default function DeckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const deckId = params.id as string;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    type: 'text' as const,
    image_url: '',
    audio_url: '',
    tags: '',
    category: '',
  });

  // Fetch deck
  const { data: deck } = useQuery<Deck>({
    queryKey: ['deck', deckId],
    queryFn: async () => {
      const response = await api.get(`/decks/${deckId}`);
      return response.data;
    },
  });

  // Fetch cards
  const { data: cards, isLoading } = useQuery<Card[]>({
    queryKey: ['cards', deckId],
    queryFn: async () => {
      const response = await api.get(`/cards?deck_id=${deckId}`);
      return response.data;
    },
  });

  // Create card mutation
  const createMutation = useMutation({
    mutationFn: async (card: typeof newCard) => {
      const response = await api.post('/cards', { ...card, deck_id: Number(deckId) });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', deckId] });
      setIsCreateModalOpen(false);
      setNewCard({
        front: '',
        back: '',
        type: 'text',
        image_url: '',
        audio_url: '',
        tags: '',
        category: '',
      });
    },
  });

  // Update card mutation
  const updateMutation = useMutation({
    mutationFn: async (card: Partial<Card> & { id: number }) => {
      const response = await api.put(`/cards/${card.id}`, card);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', deckId] });
      setEditingCard(null);
    },
  });

  // Delete card mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/cards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', deckId] });
    },
  });

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newCard);
  };

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCard) {
      updateMutation.mutate(editingCard);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-violet-600 hover:text-violet-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Decks
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {deck?.name || 'Carregando...'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {deck?.description || 'Sem descrição'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          <Plus className="h-5 w-5" />
          <span>Adicionar Card</span>
        </button>
        {cards && cards.length > 0 && (
          <Link
            href={`/dashboard/decks/${deckId}/study`}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            <Play className="h-5 w-5" />
            <span>Estudar</span>
          </Link>
        )}
      </div>

      {/* Cards List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 p-5">
                {/* Número do Card - Esquerda */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">#{index + 1}</span>
                  </div>
                </div>

                {/* Conteúdo do Card - Centro */}
                <div className="flex-1 min-w-0">
                  {/* Header com tipo e categoria */}
                  <div className="flex items-center gap-2 mb-2">
                    {card.type === 'image' && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20">
                        <ImageIcon className="h-3 w-3 text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Imagem</span>
                      </div>
                    )}
                    {card.type === 'audio' && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                        <Volume2 className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">Áudio</span>
                      </div>
                    )}
                    {card.type === 'text' && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20">
                        <span className="text-xs text-purple-400 font-medium">Texto</span>
                      </div>
                    )}
                    {card.category && (
                      <span className="px-2 py-1 text-xs bg-violet-500/10 text-violet-400 rounded-md border border-violet-500/20 font-medium">
                        {card.category}
                      </span>
                    )}
                  </div>

                  {/* Frente e Verso */}
                  <div className="grid md:grid-cols-2 gap-3 mb-2">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1 font-medium">FRENTE</p>
                      <p className="text-white font-medium line-clamp-2">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1 font-medium">VERSO</p>
                      <p className="text-zinc-300 line-clamp-2">{card.back}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  {card.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {card.tags.split(',').map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-zinc-800/50 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700/50"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ações - Direita */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Botão Editar */}
                  <button
                    onClick={() => setEditingCard(card)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition-all duration-200 border border-transparent hover:border-blue-500/30"
                    title="Editar card"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {/* Botão Excluir */}
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este card?')) {
                        deleteMutation.mutate(card.id);
                      }
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-200 border border-transparent hover:border-red-500/30"
                    title="Excluir card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Borda inferior gradiente no hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum card criado
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Adicione cards para começar a estudar
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>Adicionar Card</span>
          </button>
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full my-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Adicionar Card
            </h2>
            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frente do Card
                </label>
                <textarea
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Pergunta ou conceito..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verso do Card
                </label>
                <textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Resposta ou explicação..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <select
                  value={newCard.type}
                  onChange={(e) => setNewCard({ ...newCard, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="text">Texto</option>
                  <option value="image">Imagem</option>
                  <option value="audio">Áudio</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria (opcional)
                </label>
                <input
                  type="text"
                  value={newCard.category}
                  onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Vocabulário"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (opcional)
                </label>
                <input
                  type="text"
                  value={newCard.tags}
                  onChange={(e) => setNewCard({ ...newCard, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewCard({
                      front: '',
                      back: '',
                      type: 'text',
                      image_url: '',
                      audio_url: '',
                      tags: '',
                      category: '',
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full my-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Editar Card
            </h2>
            <form onSubmit={handleUpdateCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frente do Card
                </label>
                <textarea
                  value={editingCard.front}
                  onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verso do Card
                </label>
                <textarea
                  value={editingCard.back}
                  onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria (opcional)
                </label>
                <input
                  type="text"
                  value={editingCard.category || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (opcional)
                </label>
                <input
                  type="text"
                  value={editingCard.tags || ''}
                  onChange={(e) => setEditingCard({ ...editingCard, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
