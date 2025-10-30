import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para bcrypt
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  // Tentar pegar o token do Zustand storage primeiro
  const zustandStorage = localStorage.getItem('cardflow-auth');
  let token = null;
  
  if (zustandStorage) {
    try {
      const parsed = JSON.parse(zustandStorage);
      token = parsed.state?.token;
    } catch (e) {
      console.error('Erro ao parsear storage:', e);
    }
  }
  
  // Fallback para auth_token (compatibilidade)
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
