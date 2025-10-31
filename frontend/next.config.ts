import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Configurações para produção
  poweredByHeader: false,
  compress: true,
  
  // Configurações de imagem
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
    NEXT_PUBLIC_VOICE_API_URL: process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:3001',
  },
};

export default nextConfig;
