// Script para forçar tema dark antes do carregamento da página
(function() {
  'use strict';
  
  // Força tema dark imediatamente
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.classList.remove('light');
  }
  
  // Previne flash de tema claro
  if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      
      if (document.body) {
        document.body.classList.add('bg-gray-900', 'text-white');
        document.body.classList.remove('bg-white', 'text-black');
      }
    });
  }
})();
