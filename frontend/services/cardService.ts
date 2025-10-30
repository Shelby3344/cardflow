import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface CardData {
  front: string;
  back: string;
  deck_id: number;
  tags?: string;
  category?: string;
  type?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

class CardService {
  private async getHeaders(): Promise<HeadersInit> {
    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Lista todos os cards do usuário
   */
  async getCards(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/cards`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar cards');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao carregar cards:', error);
      throw error;
    }
  }

  /**
   * Lista cards de um deck específico
   */
  async getCardsByDeck(deckId: number): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/decks/${deckId}/cards`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar cards do deck');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar cards do deck:', error);
      throw error;
    }
  }

  /**
   * Busca um card específico
   */
  async getCard(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/cards/${id}`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar card');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Erro ao carregar card:', error);
      throw error;
    }
  }

  /**
   * Cria um novo card
   */
  async createCard(data: CardData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/cards`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao criar card',
          errors: result.errors,
        };
      }

      return {
        success: true,
        message: 'Card criado com sucesso',
        data: result,
      };
    } catch (error) {
      console.error('Erro ao criar card:', error);
      throw error;
    }
  }

  /**
   * Cria múltiplos cards de uma vez
   */
  async bulkCreateCards(deckId: number, cards: Omit<CardData, 'deck_id'>[]): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${API_URL}/cards/bulk`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({
          deck_id: deckId,
          cards,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao criar cards',
          errors: result.errors,
        };
      }

      return result;
    } catch (error) {
      console.error('Erro ao criar cards em massa:', error);
      throw error;
    }
  }

  /**
   * Atualiza um card existente
   */
  async updateCard(id: number, data: Partial<CardData>): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/cards/${id}`, {
        method: 'PUT',
        headers: await this.getHeaders(),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao atualizar card',
          errors: result.errors,
        };
      }

      return {
        success: true,
        message: 'Card atualizado com sucesso',
        data: result,
      };
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
      throw error;
    }
  }

  /**
   * Deleta um card
   */
  async deleteCard(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_URL}/cards/${id}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao excluir card',
        };
      }

      return {
        success: true,
        message: 'Card excluído com sucesso',
      };
    } catch (error) {
      console.error('Erro ao excluir card:', error);
      throw error;
    }
  }
}

// Exporta uma instância única do serviço
export const cardService = new CardService();
export type { CardData, ApiResponse };
