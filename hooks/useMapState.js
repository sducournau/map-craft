import { useState } from 'react';

/**
 * Hook personnalisé pour gérer l'état de la carte (viewState)
 * @returns {Object} État de la carte et fonctions associées
 */
export function useMapState() {
  // État initial de la carte centré sur la France
  const [viewState, setViewState] = useState({
    longitude: 2.3522,  // Coordonnées de Paris
    latitude: 46.2276,  // Centré sur la France
    zoom: 5,
    pitch: 0,
    bearing: 0,
    transitionDuration: 0
  });

  // Fonction pour définir une nouvelle position de carte avec transition
  const flyTo = (longitude, latitude, zoom = 10) => {
    setViewState({
      ...viewState,
      longitude,
      latitude,
      zoom,
      transitionDuration: 1000
    });
  };

  // Fonction pour basculer en mode 3D
  const toggle3D = (enabled) => {
    setViewState({
      ...viewState,
      pitch: enabled ? 45 : 0,
      transitionDuration: 500
    });
  };

  // Fonction pour réinitialiser la vue
  const resetView = () => {
    setViewState({
      longitude: 2.3522,
      latitude: 46.2276,
      zoom: 5,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000
    });
  };

  return {
    viewState,
    setViewState,
    flyTo,
    toggle3D,
    resetView
  };
}