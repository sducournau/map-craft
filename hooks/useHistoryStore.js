import { create } from 'zustand';

// Store pour gérer l'historique des actions (undo/redo)
export const useHistoryStore = create((set, get) => ({
  // État initial
  past: [],
  present: null,
  future: [],
  
  // Initialiser l'état présent
  setPresent: (state) => set({
    present: state,
    past: [],
    future: []
  }),
  
  // Sauvegarder l'état actuel dans l'historique
  saveState: (state) => set(prev => ({
    past: [...prev.past, prev.present],
    present: state,
    future: []
  })),
  
  // Annuler la dernière action
  undo: () => {
    const { past, present, future } = get();
    
    if (past.length === 0) return;
    
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    set({
      past: newPast,
      present: previous,
      future: [present, ...future]
    });
    
    return previous;
  },
  
  // Rétablir une action annulée
  redo: () => {
    const { past, present, future } = get();
    
    if (future.length === 0) return;
    
    const next = future[0];
    const newFuture = future.slice(1);
    
    set({
      past: [...past, present],
      present: next,
      future: newFuture
    });
    
    return next;
  },
  
  // Vérifier si undo/redo sont disponibles
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0
}));

export default useHistoryStore;