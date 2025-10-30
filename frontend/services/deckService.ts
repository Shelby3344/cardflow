import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface DeckData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  image?: File | null;
  is_public?: boolean;
  parent_id?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

class DeckService {
  private async getHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Lista todos os decks do usuário
   */
  async getDecks(filter?: 'all' | 'mine' | 'public'): Promise<ApiResponse<any[]>> {
    try {
      const url = filter ? `${API_URL}/decks?filter=${filter}` : `${API_URL}/decks`;
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar decks');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar decks:', error);
      throw error;
    }
  }

  /**
   * Lista decks públicos
   */
  async getPublicDecks(search?: string): Promise<ApiResponse<any>> {
    try {
      const url = search 
        ? `${API_URL}/decks/public?search=${encodeURIComponent(search)}`
        : `${API_URL}/decks/public`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar decks públicos');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar decks públicos:', error);
      throw error;
    }
  }

  /**
   * Busca um deck específico
   */
  async getDeck(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/decks/${id}`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar deck');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao carregar deck:', error);
      throw error;
    }
  }

  /**
   * Cria um novo deck
   */
  async createDeck(data: DeckData): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      
      if (data.description) formData.append('description', data.description);
      if (data.icon) formData.append('icon', data.icon);
      if (data.color) formData.append('color', data.color);
      if (data.image) formData.append('image', data.image);
      if (data.parent_id) formData.append('parent_id', data.parent_id.toString());
      formData.append('is_public', data.is_public ? '1' : '0');

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/decks`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao criar deck',
          errors: result.errors,
        };
      }

      return result;
    } catch (error) {
      console.error('Erro ao criar deck:', error);
      throw error;
    }
  }

  /**
   * Atualiza um deck existente
   */
  async updateDeck(id: number, data: DeckData & { remove_image?: boolean }): Promise<ApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('_method', 'PUT'); // Laravel method spoofing
      
      if (data.description) formData.append('description', data.description);
      if (data.icon) formData.append('icon', data.icon);
      if (data.color) formData.append('color', data.color);
      if (data.image) formData.append('image', data.image);
      if (data.remove_image) formData.append('remove_image', '1');
      formData.append('is_public', data.is_public ? '1' : '0');

      const token = useAuthStore.getState().token;
      const response = await fetch(`${API_URL}/decks/${id}`, {
        method: 'POST', // Usando POST com _method=PUT para suportar multipart
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao atualizar deck',
          errors: result.errors,
        };
      }

      return result;
    } catch (error) {
      console.error('Erro ao atualizar deck:', error);
      throw error;
    }
  }

  /**
   * Remove um deck
   */
  async deleteDeck(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_URL}/decks/${id}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao excluir deck',
        };
      }

      return result;
    } catch (error) {
      console.error('Erro ao excluir deck:', error);
      throw error;
    }
  }

  /**
   * Duplica um deck público
   */
  async duplicateDeck(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/decks/${id}/duplicate`, {
        method: 'POST',
        headers: await this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao duplicar deck',
        };
      }

      return result;
    } catch (error) {
      console.error('Erro ao duplicar deck:', error);
      throw error;
    }
  }

  /**
   * Reordena sub-decks
   */
  async reorderSubDecks(deckId: number, subDecks: { id: number; order: number }[]): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_URL}/decks/${deckId}/reorder`, {
        method: 'POST',
        headers: await this.getHeaders(),
        body: JSON.stringify({ sub_decks: subDecks }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Falha ao reordenar sub-decks',
        };
      }

      return result;
    } catch (error) {
      console.error('Erro ao reordenar sub-decks:', error);
      throw error;
    }
  }
}

export const deckService = new DeckService();
