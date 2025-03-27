import React from 'react';
import styles from '../../styles/MapControls.module.css';

export default function MapControls({ viewState, setViewState }) {
  // Zoom in sur la carte
  const handleZoomIn = () => {
    setViewState({
      ...viewState,
      zoom: viewState.zoom + 1,
      transitionDuration: 300
    });
  };

  // Zoom out sur la carte
  const handleZoomOut = () => {
    setViewState({
      ...viewState,
      zoom: viewState.zoom - 1,
      transitionDuration: 300
    });
  };

  // Réinitialiser l'orientation vers le nord
  const handleResetNorth = () => {
    setViewState({
      ...viewState,
      bearing: 0,
      pitch: 0,
      transitionDuration: 500
    });
  };

  // Réinitialiser la vue (revenir à la vue initiale)
  const handleResetView = () => {
    setViewState({
      longitude: 2.3522,  // Paris (centre de la France)
      latitude: 46.2276,
      zoom: 5,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000
    });
  };

  return (
    <div className={styles.mapControls}>
      <button 
        className={styles.controlButton} 
        onClick={handleZoomIn}
        title="Zoom avant"
      >
        +
      </button>
      <button 
        className={styles.controlButton} 
        onClick={handleZoomOut}
        title="Zoom arrière"
      >
        -
      </button>
      <button 
        className={styles.controlButton} 
        onClick={handleResetNorth}
        title="Réinitialiser l'orientation"
      >
        ⇧
      </button>
      <button 
        className={styles.controlButton} 
        onClick={handleResetView}
        title="Réinitialiser la vue"
      >
        ↺
      </button>
    </div>
  );
}