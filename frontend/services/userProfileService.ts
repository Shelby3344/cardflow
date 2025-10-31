import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

class UserProfileService {
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

  async uploadPhoto(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/user/profile-photo`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return response.json();
  }

  async deletePhoto(): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/user/profile-photo`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    
    return response.json();
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    bio?: string;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    return response.json();
  }
}

export const userProfileService = new UserProfileService();
