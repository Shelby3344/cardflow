'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { SessionProvider } from 'next-auth/react';
import { useState, useEffect, ReactNode } from 'react';

// Componente interno que força o tema dark
function DarkThemeForcer({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Força o tema dark no HTML
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    
    // Remove qualquer classe light que possa existir
    document.documentElement.classList.remove('light');
    
    // Garante que o body tenha as classes corretas
    document.body.classList.add('bg-gray-900', 'text-white');
    document.body.classList.remove('bg-white', 'text-black');

    // Observa mudanças no DOM para prevenir remoção acidental da classe dark
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

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutos
            gcTime: 1000 * 60 * 60 * 24, // 24 horas (era cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [persister] = useState(() =>
    typeof window !== 'undefined'
      ? createSyncStoragePersister({
          storage: window.localStorage,
        })
      : undefined
  );

  if (persister) {
    return (
      <SessionProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          <DarkThemeForcer>{children}</DarkThemeForcer>
        </PersistQueryClientProvider>
      </SessionProvider>
    );
  }

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <DarkThemeForcer>{children}</DarkThemeForcer>
      </QueryClientProvider>
    </SessionProvider>
  );
}
