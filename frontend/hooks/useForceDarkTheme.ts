'use client';

import { useEffect } from 'react';

/**
 * Hook para forçar tema dark em toda a aplicação
 * Garante que mesmo em dispositivos diferentes, o tema dark seja mantido
 */
export function useForceDarkTheme() {
  useEffect(() => {
    // Força o tema dark no HTML
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      
      // Remove qualquer classe light que possa existir
      document.documentElement.classList.remove('light');
      
      // Garante que o body tenha as classes corretas
      document.body.classList.add('bg-gray-900', 'text-white');
      document.body.classList.remove('bg-white', 'text-black');
    }
  }, []);

  // Observa mudanças no DOM para prevenir remoção acidental da classe dark
  useEffect(() => {
    if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const html = document.documentElement;
          if (!html.classList.contains('dark')) {
            html.classList.add('dark');
            html.style.colorScheme = 'dark';
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);
}
