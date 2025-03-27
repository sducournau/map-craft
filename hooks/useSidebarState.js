import { create } from 'zustand';

// Store pour gérer l'état de la barre latérale
export const useSidebarStore = create((set) => ({
  // État initial: sidebar ouverte, onglet "layers" actif
  isOpen: true,
  activeTab: 'layers',
  
  // Actions pour modifier l'état
  setIsOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  
  // Action combinée: ouvrir et définir un onglet
  openTab: (tabId) => set({ isOpen: true, activeTab: tabId }),
  
  // Toggle: basculer l'état ouvert/fermé
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen }))
}));

export default useSidebarStore;