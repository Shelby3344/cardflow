'use client';

import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  BookOpen, 
  Crown, 
  Settings,
  TrendingUp,
  Calendar,
  Clock,
  LogOut,
  Search,
  Plus
} from 'lucide-react';
import { userStatsService } from '@/services/userStatsService';

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { stats, loadingStats, setStats, setLoading, shouldRefetch, clearStats, lastFetch } = useDashboardStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const loadSidebarStats = async () => {
    try {
      setLoading(true);
      const data = await userStatsService.getSidebarStats();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Dados padrão em caso de erro
      setStats({
        days_streak: 0,
        studied_today: '0m',
        avg_studied_per_day: '0m',
        total_decks: 0,
        my_decks: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar stats quando autenticar ou quando precisar refetch
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      // Sempre carrega se shouldRefetch retornar true (cache expirado ou forceRefetch)
      if (shouldRefetch()) {
        loadSidebarStats();
      }
    }
  }, [hasHydrated, isAuthenticated, lastFetch]); // Adicionado lastFetch como dependência

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    clearStats(); // Limpa o cache ao fazer logout
    logout();
    router.push('/login');
  };

  const navItems = [
    { icon: Home, label: 'Início', href: '/dashboard' },
    { icon: Users, label: 'Amigos', href: '/dashboard/friends' },
    { icon: BookOpen, label: 'Biblioteca', href: '/dashboard/library' },
    { icon: Crown, label: 'Premium', href: '/dashboard/premium' },
  ];

  return (
    <div className="flex h-screen bg-[#2d3b52] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[346px] bg-[#364358] flex flex-col border-r border-[#4a5568]">
        {/* Logo */}
        <div className="p-2 border-b border-[#4a5568] flex items-center justify-center">
          <img 
            src="/logo-white.png" 
            alt="CardFlow Logo" 
            className="h-[80px] w-auto object-contain"
          />
        </div>
        
        {/* User Profile */}
        <div className="p-6 border-b border-[#4a5568]">
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                {user?.profile_photo_url ? (
                  <img 
                    src={`http://localhost${user.profile_photo_url}`} 
                    alt={user.name || 'Profile'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <Link href="/dashboard/settings" className="absolute -top-1 -right-1 w-6 h-6 bg-[#4a5568] rounded-full flex items-center justify-center hover:bg-[#5a6578] transition-colors">
                <Settings className="w-3 h-3 text-gray-300" />
              </Link>
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold">Olá, {user?.name}!</h2>
              {user?.is_pro ? (
                <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">PRO</span>
              ) : (
                <span className="text-xs text-gray-400">Versão Grátis</span>
              )}
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-gray-400 text-xs mb-1">Dias Seguidos</div>
              <div className="text-white font-bold text-xl flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4 text-orange-400" />
                {stats?.days_streak || 0}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">Estudado Hoje</div>
              <div className="text-white font-bold text-xl flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-blue-400" />
                {stats?.studied_today || '0m'}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs mb-1">Média/Dia</div>
              <div className="text-white font-bold text-xl flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                {stats?.avg_studied_per_day || '0m'}
              </div>
            </div>
          </div>
        </div>

        {/* My Flashcards */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">
              Meus Flashcards ({stats?.total_decks || 0} classes)
            </h3>
          </div>
          
          <div className="flex gap-2 mb-4">
            <Link
              href="/dashboard/library"
              className="flex-1 px-4 py-2 bg-[#4a5568] text-white rounded-lg text-sm font-medium hover:bg-[#5a6578] transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </span>
              DESCOBRIR
            </Link>
            <Link
              href="/dashboard/library"
              className="flex-1 px-4 py-2 bg-[#4a5568] text-white rounded-lg text-sm font-medium hover:bg-[#5a6578] transition-colors flex items-center justify-center gap-2"
            >
              <span className="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                <Plus className="w-3 h-3 text-white" />
              </span>
              CRIAR
            </Link>
          </div>

          {/* Deck List */}
          <div className="space-y-2">
            {loadingStats ? (
              <div className="text-center text-gray-400 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : stats && stats.my_decks.length > 0 ? (
              stats.my_decks.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/dashboard?deck=${deck.id}`}
                  className="block p-3 bg-[#2d3b52] rounded-lg hover:bg-[#3d4b62] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded flex-shrink-0 flex items-center justify-center text-2xl"
                    >
                      {deck.icon || '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{deck.name}</div>
                      <div className="w-full bg-[#1a2332] rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${deck.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                Nenhum deck criado ainda
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t border-[#4a5568] p-2">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-[#4a5568] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#3d4b62]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f5f7fa]">
        {children}
      </main>
    </div>
  );
}
