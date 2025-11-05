'use client';

import { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, TrendingUp, Play, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface Deck {
  id: number;
  name: string;
  description: string;
  cards_count: number;
  studied_cards?: number;
  progress?: number;
  created_at: string;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const response = await api.get('/decks');
      setDecks(response.data);
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/decks', {
        name: newDeckName,
        description: newDeckDescription,
      });
      setShowCreateModal(false);
      setNewDeckName('');
      setNewDeckDescription('');
      loadDecks();
    } catch (error) {
      console.error('Erro ao criar deck:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Meus Decks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie seus baralhos de estudo
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Deck</span>
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Nenhum deck ainda
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crie seu primeiro deck para começar a estudar
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Criar Primeiro Deck</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {decks.map((deck) => {
            const progress = deck.progress || 0;
            const studiedCards = deck.studied_cards || 0;
            
            return (
              <div
                key={deck.id}
                className="group relative bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4 p-5">
                  {/* Progresso Circular - Esquerda */}
                  <div className="relative flex-shrink-0">
                    <svg className="w-16 h-16 transform -rotate-90">
                      {/* Círculo de fundo */}
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-zinc-800"
                      />
                      {/* Círculo de progresso */}
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                        className={`transition-all duration-500 ${
                          progress >= 75 ? 'text-green-500' :
                          progress >= 50 ? 'text-yellow-500' :
                          progress >= 25 ? 'text-orange-500' :
                          'text-purple-500'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Texto de porcentagem */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{Math.round(progress)}%</span>
                    </div>
                  </div>

                  {/* Informações do Deck - Centro */}
                  <Link 
                    href={`/dashboard/decks/${deck.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-purple-400 transition-colors">
                      {deck.name}
                    </h3>
                    <p className="text-sm text-zinc-400 truncate mb-2">
                      {deck.description || 'Sem descrição'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {deck.cards_count} {deck.cards_count === 1 ? 'card' : 'cards'}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {studiedCards} estudados
                      </span>
                    </div>
                  </Link>

                  {/* Ações - Direita */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Botão Play */}
                    <Link
                      href={`/dashboard/decks/${deck.id}/study`}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105 group/play"
                    >
                      <Play className="w-5 h-5 ml-0.5 group-hover/play:scale-110 transition-transform" fill="currentColor" />
                    </Link>

                    {/* Menu de Opções */}
                    <button
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-all duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Adicionar menu dropdown
                        console.log('Menu do deck:', deck.id);
                      }}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Borda inferior gradiente no hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criar Deck */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Criar Novo Deck
            </h2>
            <form onSubmit={createDeck} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Deck
                </label>
                <input
                  type="text"
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Inglês - Vocabulário"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Descreva o conteúdo deste deck..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                >
                  Criar Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
