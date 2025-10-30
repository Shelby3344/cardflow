import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface DeckProgress {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  image: string | null;
  progress: number;
  total_cards: number;
  studied_cards: number;
}

export interface SidebarStats {
  days_streak: number;
  studied_today: string;
  avg_studied_per_day: string;
  total_decks: number;
  my_decks: DeckProgress[];
}

interface DashboardState {
  stats: SidebarStats | null;
  loadingStats: boolean;
  lastFetch: number | null;
  setStats: (stats: SidebarStats) => void;
  setLoading: (loading: boolean) => void;
  clearStats: () => void;
  shouldRefetch: () => boolean;
  forceRefetch: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      stats: null,
      loadingStats: false,
      lastFetch: null,
      
      setStats: (stats) => {
        set({ stats, lastFetch: Date.now(), loadingStats: false });
      },
      
      setLoading: (loading) => {
        set({ loadingStats: loading });
      },
      
      clearStats: () => {
        set({ stats: null, lastFetch: null, loadingStats: false });
      },
      
      shouldRefetch: () => {
        const { lastFetch } = get();
        if (!lastFetch) return true;
        return Date.now() - lastFetch > CACHE_DURATION;
      },
      
      forceRefetch: () => {
        set({ lastFetch: null });
      },
    }),
    {
      name: 'cardflow-dashboard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stats: state.stats,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
