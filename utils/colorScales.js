import { scaleQuantile, scaleLinear, scaleThreshold } from 'd3-scale';
import { rgb } from 'd3-color';

/**
 * Palettes de couleurs disponibles
 */
export const COLOR_PALETTES = {
  VIRIDIS: {
    name: 'Viridis',
    colors: ['#fafa6e', '#2A4858']
  },
  BLUES: {
    name: 'Blues',
    colors: ['#FFFFFF', '#4169E1']
  },
  REDS: {
    name: 'Reds',
    colors: ['#FFFFFF', '#FF4500']
  },
  GREENS: {
    name: 'Greens',
    colors: ['#FFFFFF', '#008000']
  },
  SPECTRAL: {
    name: 'Spectral',
    colors: ['#d53e4f', '#ffffbf', '#3288bd']
  }
};

/**
 * Convertit une couleur hexadécimale en RGB
 * @param {string} hex - Couleur au format hexadécimal
 * @returns {Array} Tableau RGB [r, g, b]
 */
const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
};

/**
 * Crée une échelle de couleurs basée sur les données et la méthode de classification
 * @param {Array} data - Données à analyser
 * @param {string} classificationMethod - Méthode de classification (quantile, equal, jenks)
 * @param {string} colorPalette - Palette de couleurs
 * @param {Function} valueAccessor - Fonction pour accéder aux valeurs
 * @returns {Function} - Fonction de correspondance valeur -> couleur
 */
export function createColorScale(
  data,
  classificationMethod = 'quantile',
  colorPalette = 'VIRIDIS',
  valueAccessor = (d) => d.properties.value
) {
  if (!data || data.length === 0) return () => [200, 200, 200, 255];

  // Extraire les valeurs
  const values = data.map(valueAccessor).filter(v => v !== undefined && v !== null);
  
  if (values.length === 0) return () => [200, 200, 200, 255];
  
  const palette = COLOR_PALETTES[colorPalette] || COLOR_PALETTES.VIRIDIS;
  const [minColor, maxColor] = palette.colors;
  
  const rgbMin = hexToRgb(minColor);
  const rgbMax = hexToRgb(maxColor);
  
  // Créer des étapes intermédiaires pour les méthodes de classification
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  switch (classificationMethod) {
    case 'quantile':
      // Division en 5 classes de quantiles
      const quantileScale = scaleQuantile()
        .domain(values)
        .range([0, 0.25, 0.5, 0.75, 1]);
        
      return (d) => {
        const value = valueAccessor(d);
        if (value === undefined || value === null) return [200, 200, 200, 255];
        
        const t = quantileScale(value);
        return [
          Math.round(rgbMin[0] + (rgbMax[0] - rgbMin[0]) * t),
          Math.round(rgbMin[1] + (rgbMax[1] - rgbMin[1]) * t),
          Math.round(rgbMin[2] + (rgbMax[2] - rgbMin[2]) * t),
          255
        ];
      };
      
    case 'equal':
      // Division en intervalles égaux
      const linearScale = scaleLinear()
        .domain([min, max])
        .range([0, 1]);
        
      return (d) => {
        const value = valueAccessor(d);
        if (value === undefined || value === null) return [200, 200, 200, 255];
        
        const t = linearScale(value);
        return [
          Math.round(rgbMin[0] + (rgbMax[0] - rgbMin[0]) * t),
          Math.round(rgbMin[1] + (rgbMax[1] - rgbMin[1]) * t),
          Math.round(rgbMin[2] + (rgbMax[2] - rgbMin[2]) * t),
          255
        ];
      };
      
    case 'jenks':
      // Approximation simplifiée de Jenks (5 classes)
      // Note: Une vraie implémentation nécessiterait l'algorithme complet de Jenks
      const range = max - min;
      const breaks = [
        min,
        min + range * 0.2,
        min + range * 0.4,
        min + range * 0.6,
        min + range * 0.8,
        max
      ];
      
      const jenksScale = scaleThreshold()
        .domain(breaks.slice(1, -1))
        .range([0, 0.25, 0.5, 0.75, 1]);
        
      return (d) => {
        const value = valueAccessor(d);
        if (value === undefined || value === null) return [200, 200, 200, 255];
        
        const t = jenksScale(value);
        return [
          Math.round(rgbMin[0] + (rgbMax[0] - rgbMin[0]) * t),
          Math.round(rgbMin[1] + (rgbMax[1] - rgbMin[1]) * t),
          Math.round(rgbMin[2] + (rgbMax[2] - rgbMin[2]) * t),
          255
        ];
      };
      
    default:
      // Par défaut, échelle linéaire
      return (d) => {
        const value = valueAccessor(d);
        if (value === undefined || value === null) return [200, 200, 200, 255];
        
        const t = (value - min) / (max - min);
        return [
          Math.round(rgbMin[0] + (rgbMax[0] - rgbMin[0]) * t),
          Math.round(rgbMin[1] + (rgbMax[1] - rgbMin[1]) * t),
          Math.round(rgbMin[2] + (rgbMax[2] - rgbMin[2]) * t),
          255
        ];
      };
  }
}