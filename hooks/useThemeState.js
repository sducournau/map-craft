import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store pour gérer le thème de l'application
export const useThemeStore = create(
  persist(
    (set) => ({
      // État initial: thème sombre
      theme: 'dark',
      
      // Action pour définir le thème
      setTheme: (theme) => set({ theme }),
      
      // Toggle: basculer entre les thèmes clair et sombre
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'dark' ? 'light' : 'dark' 
      })),
    }),
    {
      name: 'theme-storage', // Nom pour le stockage
      getStorage: () => localStorage, // Utiliser localStorage
    }
  )
);

export default useThemeStore;