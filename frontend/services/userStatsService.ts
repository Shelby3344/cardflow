import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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

export const userStatsService = {
  /**
   * Buscar estatísticas para o sidebar
   */
  async getSidebarStats(): Promise<SidebarStats> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_URL}/user/sidebar-stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar estatísticas');
    }

    const result = await response.json();
    return result.data;
  },
};
