import React from 'react';
import { COLOR_PALETTES } from '../../utils/colorScales';
import styles from '../../styles/DataPanel.module.css';
import useDataState from '../../hooks/useDataState';
import useMapState from '../../hooks/useMapState';

export default function DataPanel() {
  // Get state from Zustand stores instead of props
  const { viewState } = useMapState();
  const { 
    visualizationConfig, 
    updateVisualizationConfig 
  } = useDataState();
  
  // Extract values from visualization configuration
  const {
    visualizationType = 'choropleth',
    classificationMethod = 'quantile',
    colorScale = 'VIRIDIS',
    opacity = 0.8,
    radius = 5
  } = visualizationConfig;
  
  // Create setter functions
  const setVisualizationType = (type) => {
    updateVisualizationConfig({ visualizationType: type });
  };
  
  const setClassificationMethod = (method) => {
    updateVisualizationConfig({ classificationMethod: method });
  };
  
  const setColorPalette = (palette) => {
    updateVisualizationConfig({ colorScale: palette });
  };
  
  const setOpacity = (value) => {
    updateVisualizationConfig({ opacity: value });
  };
  
  const setRadius = (value) => {
    updateVisualizationConfig({ radius: value });
  };

  return (
    <div className={styles.dataPanel}>
      <h3>Configuration</h3>
      
      <div className={styles.row}>
        <label htmlFor="visualizationType">Type de visualisation:</label>
        <select 
          id="visualizationType"
          value={visualizationType} 
          onChange={e => setVisualizationType(e.target.value)}
        >
          <option value="choropleth">Choroplèthe</option>
          <option value="points">Points</option>
          <option value="heatmap">Carte de chaleur</option>
        </select>
      </div>
      
      {visualizationType !== 'heatmap' && (
        <div className={styles.row}>
          <label htmlFor="classificationMethod">Classification:</label>
          <select 
            id="classificationMethod"
            value={classificationMethod}
            onChange={e => setClassificationMethod(e.target.value)}
          >
            <option value="quantile">Quantiles</option>
            <option value="equal">Intervalles égaux</option>
            <option value="jenks">Jenks (simplifié)</option>
          </select>
        </div>
      )}
      
      <div className={styles.row}>
        <label htmlFor="colorPalette">Palette de couleurs:</label>
        <select
          id="colorPalette"
          value={colorScale}
          onChange={e => setColorPalette(e.target.value)}
        >
          {Object.keys(COLOR_PALETTES).map(key => (
            <option key={key} value={key}>
              {COLOR_PALETTES[key].name}
            </option>
          ))}
        </select>
      </div>
      
      <div className={styles.row}>
        <label htmlFor="opacity">
          Opacité: {opacity}
        </label>
        <input 
          id="opacity"
          type="range" 
          min="0" 
          max="1" 
          step="0.1"
          value={opacity}
          onChange={e => setOpacity(parseFloat(e.target.value))}
        />
      </div>
      
      {visualizationType === 'heatmap' && (
        <div className={styles.row}>
          <label htmlFor="radius">
            Rayon: {radius}px
          </label>
          <input 
            id="radius"
            type="range" 
            min="5" 
            max="100" 
            step="5"
            value={radius}
            onChange={e => setRadius(parseInt(e.target.value))}
          />
        </div>
      )}
      
      {visualizationType === 'points' && (
        <div className={styles.row}>
          <label htmlFor="radius">
            Taille des points: {radius}px
          </label>
          <input 
            id="radius"
            type="range" 
            min="1" 
            max="20" 
            step="1"
            value={radius}
            onChange={e => setRadius(parseInt(e.target.value))}
          />
        </div>
      )}
    </div>
  );
};