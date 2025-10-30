import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface StudyResponse {
  deck_id: number;
  card_id: number;
  response: 'know_it' | 'kinda_know' | 'dont_know';
  time_spent_seconds?: number;
}

export interface DeckStats {
  deck_id: number;
  total_cards: number;
  studied_cards: number;
  total_sessions: number;
  mastery_percentage: number;
  response_distribution: {
    know_it: number;
    kinda_know: number;
    dont_know: number;
  };
  total_time_spent_minutes: number;
  last_session: {
    date: string;
    response: string;
  } | null;
}

export interface CardToStudy {
  id: number;
  front: string;
  back: string;
  deck_id: number;
  created_at: string;
  updated_at: string;
}

export interface CardsToStudyResponse {
  cards: CardToStudy[];
  total_cards: number;
  studied_cards: number;
}

export const studyService = {
  /**
   * Registrar uma resposta de estudo
   */
  async recordResponse(data: StudyResponse): Promise<any> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_URL}/study/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao registrar resposta');
    }

    return response.json();
  },

  /**
   * Obter estatísticas de um deck
   */
  async getDeckStats(deckId: number): Promise<DeckStats> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_URL}/study/decks/${deckId}/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar estatísticas');
    }

    return response.json();
  },

  /**
   * Obter histórico de estudo de um deck
   */
  async getDeckHistory(deckId: number): Promise<any> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_URL}/study/decks/${deckId}/history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar histórico');
    }

    return response.json();
  },

  /**
   * Obter cards para estudar
   */
  async getCardsToStudy(deckId: number): Promise<CardsToStudyResponse> {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_URL}/study/decks/${deckId}/cards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao buscar cards');
    }

    return response.json();
  },
};
