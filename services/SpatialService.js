import * as turf from '@turf/turf';
import { 
  createBuffer, 
  calculateIntersection, 
  calculateCentroids,
  calculateUnion,
  calculateDifference,
  createVoronoi
} from '../utils/spatialOperations';

/**
 * Service d'analyse spatiale encapsulant les opérations géospatiales
 */
class SpatialService {
  /**
   * Exécute une analyse spatiale selon le type demandé
   * @param {string} analysisType - Type d'analyse à effectuer
   * @param {Object} parameters - Paramètres de l'analyse
   * @returns {Promise<Object>} Résultat de l'analyse
   */
  async performAnalysis(analysisType, parameters) {
    try {
      switch (analysisType) {
        case 'buffer':
          return this.createBuffer(parameters);
        
        case 'centroid':
          return this.calculateCentroids(parameters);
        
        case 'intersection':
          return this.calculateIntersection(parameters);
        
        case 'union':
          return this.calculateUnion(parameters);
        
        case 'difference':
          return this.calculateDifference(parameters);
        
        case 'voronoi':
          return this.createVoronoi(parameters);
        
        default:
          throw new Error(`Type d'analyse non pris en charge: ${analysisType}`);
      }
    } catch (error) {
      console.error(`Erreur lors de l'analyse ${analysisType}:`, error);
      throw error;
    }
  }
  
  /**
   * Crée une zone tampon autour des entités
   * @param {Object} params - Paramètres de l'opération
   * @returns {Promise<Object>} GeoJSON résultant
   */
  async createBuffer(params) {
    const { sourceData, distance, units = 'kilometers' } = params;
    
    if (!sourceData || !distance) {
      throw new Error('Données source et distance requises pour créer une zone tampon');
    }
    
    return createBuffer(sourceData, distance, { units });
  }
  
  /**
   * Calcule les centroïdes des entités
   * @param {Object} params - Paramètres de l'opération
   * @returns {Promise<Object>} GeoJSON résultant
   */
  async calculateCentroids(params) {
    const { sourceData } = params;
    
    if (!sourceData) {
      throw new Error('Données source requises pour calculer les centroïdes');
    }
    
    return calculateCentroids(sourceData);
  }
  
  /**
   * Calcule l'intersection entre deux couches
   * @param {Object} params - Paramètres de l'opération
   * @returns {Promise<Object>} GeoJSON résultant
   */
  async calculateIntersection(params) {
    const { sourceData, targetData } = params;
    
    if (!sourceData || !targetData) {
      throw new Error('Données source et cible requises pour calculer l\'intersection');
    }
    
    return calculateIntersection(sourceData, targetData);
  }
  
  /**
   * Calcule l'union de plusieurs entités
   * @param {Object} params - Paramètres de l'opération
   * @returns {Promise<Object>} GeoJSON résultant
   */
  async calculateUnion(params) {
    const { sourceData } = params;
    
    if (!sourceData) {
      throw new Error('Données source requises pour calculer l\'union');
    }
    
    return calculateUnion(sourceData);
  }
  
  /**
   * Calcule la différence entre deux couches
   * @param {Object} params - Paramètres de l'opération
   * @returns {Promise<Object>} GeoJSON résultant
   */
  async calculateDifference(params) {
    const { sourceData, targetData } = params;
    
    if (!sourceData || !targetData) {
      throw new Error('Données source et cible requises pour calculer la différence');
    }
    
    return calculateDifference(sourceData, targetData);
  }
  
  /**
   * Crée un diagramme de Voronoï à partir de points
   * @param {Object} params - Paramètres de l'opération
   * @returns {Promise<Object>} GeoJSON résultant
   */
  async createVoronoi(params) {
    const { sourceData, bbox } = params;
    
    if (!sourceData) {
      throw new Error('Données source requises pour créer un diagramme de Voronoï');
    }
    
    return createVoronoi(sourceData, bbox);
  }
  
  /**
   * Calcule les statistiques d'un jeu de données
   * @param {Object} sourceData - Données GeoJSON
   * @returns {Object} Statistiques calculées
   */
  calculateStatistics(sourceData) {
    if (!sourceData || !sourceData.features || sourceData.features.length === 0) {
      throw new Error('Données source invalides pour le calcul des statistiques');
    }
    
    const stats = {
      count: sourceData.features.length,
      geometryTypes: {}
    };
    
    // Compter les types de géométrie
    sourceData.features.forEach(feature => {
      const geomType = feature.geometry.type;
      stats.geometryTypes[geomType] = (stats.geometryTypes[geomType] || 0) + 1;
    });
    
    // Calculer la surface totale pour les polygones
    if (Object.keys(stats.geometryTypes).some(type => type.includes('Polygon'))) {
      let totalArea = 0;
      
      sourceData.features.forEach(feature => {
        if (feature.geometry.type.includes('Polygon')) {
          try {
            totalArea += turf.area(feature);
          } catch (error) {
            console.warn('Erreur lors du calcul de surface:', error);
          }
        }
      });
      
      stats.totalArea = totalArea;
    }
    
    // Calculer la longueur totale pour les lignes
    if (Object.keys(stats.geometryTypes).some(type => type.includes('LineString'))) {
      let totalLength = 0;
      
      sourceData.features.forEach(feature => {
        if (feature.geometry.type.includes('LineString')) {
          try {
            totalLength += turf.length(feature, { units: 'kilometers' });
          } catch (error) {
            console.warn('Erreur lors du calcul de longueur:', error);
          }
        }
      });
      
      stats.totalLength = totalLength;
    }
    
    return stats;
  }
}

export default new SpatialService();