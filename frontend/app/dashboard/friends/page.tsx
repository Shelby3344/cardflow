'use client';

import { useState } from 'react';
import { Users, UserPlus, Search, TrendingUp, Award } from 'lucide-react';

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const friends = [
    { id: 1, name: 'João Silva', avatar: '👨‍⚕️', streak: 15, cardsToday: 45, totalCards: 1250 },
    { id: 2, name: 'Maria Santos', avatar: '👩‍⚕️', streak: 23, cardsToday: 32, totalCards: 980 },
    { id: 3, name: 'Pedro Costa', avatar: '👨‍🎓', streak: 8, cardsToday: 28, totalCards: 560 },
  ];

  const suggestions = [
    { id: 4, name: 'Ana Oliveira', avatar: '👩‍🎓', mutualFriends: 3 },
    { id: 5, name: 'Carlos Mendes', avatar: '👨‍💼', mutualFriends: 2 },
  ];

  return (
    <div className="min-h-full p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Amigos & Classificação</h1>
          <p className="text-gray-600">Conecte-se com amigos e compete nos estudos</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar amigos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Friends List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Meus Amigos ({friends.length})
              </h2>
              
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-4xl">{friend.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{friend.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          🔥 {friend.streak} dias seguidos
                        </span>
                        <span className="flex items-center gap-1">
                          📚 {friend.cardsToday} cartas hoje
                        </span>
                        <span className="flex items-center gap-1">
                          ⭐ {friend.totalCards} total
                        </span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Ver Perfil
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Classificação desta Semana
              </h2>
              
              <div className="space-y-3">
                {[...friends].sort((a, b) => b.cardsToday - a.cardsToday).map((friend, index) => (
                  <div key={friend.id} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="text-2xl">{friend.avatar}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{friend.name}</div>
                      <div className="text-sm text-gray-600">{friend.cardsToday} cartas esta semana</div>
                    </div>
                    {index === 0 && <Award className="w-6 h-6 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Amigos Sugeridos
              </h2>
              
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">{suggestion.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{suggestion.name}</h3>
                        <p className="text-sm text-gray-600">{suggestion.mutualFriends} amigos em comum</p>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Adicionar Amigo
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
