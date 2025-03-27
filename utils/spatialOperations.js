import * as turf from '@turf/turf';

/**
 * Utilitaires pour les opérations d'analyse spatiale
 */

/**
 * Crée une zone tampon autour des entités géométriques
 * @param {Object} geojson - Données GeoJSON
 * @param {number} distance - Distance de la zone tampon en kilomètres
 * @param {Object} options - Options supplémentaires
 * @returns {Object} GeoJSON avec zones tampon
 */
export function createBuffer(geojson, distance, options = {}) {
  if (!geojson || !geojson.features || !geojson.features.length) {
    throw new Error('Données GeoJSON invalides');
  }

  const units = options.units || 'kilometers';
  const steps = options.steps || 64;

  const bufferedFeatures = geojson.features.map(feature => {
    try {
      return turf.buffer(feature, distance, { units, steps });
    } catch (error) {
      console.warn(`Erreur lors de la création d'une zone tampon: ${error.message}`);
      return null;
    }
  }).filter(Boolean);

  return {
    type: 'FeatureCollection',
    features: bufferedFeatures
  };
}

/**
 * Calcule l'intersection entre deux jeux de données
 * @param {Object} sourceGeojson - Première couche GeoJSON
 * @param {Object} targetGeojson - Seconde couche GeoJSON
 * @returns {Object} GeoJSON des intersections
 */
export function calculateIntersection(sourceGeojson, targetGeojson) {
  if (!sourceGeojson?.features?.length || !targetGeojson?.features?.length) {
    throw new Error('Deux jeux de données valides sont nécessaires');
  }

  const intersectionFeatures = [];

  for (const sourceFeature of sourceGeojson.features) {
    if (sourceFeature.geometry.type !== 'Polygon' && 
        sourceFeature.geometry.type !== 'MultiPolygon') {
      continue;
    }

    for (const targetFeature of targetGeojson.features) {
      if (targetFeature.geometry.type !== 'Polygon' && 
          targetFeature.geometry.type !== 'MultiPolygon') {
        continue;
      }

      try {
        const intersection = turf.intersect(sourceFeature, targetFeature);
        if (intersection) {
          intersection.properties = {
            ...sourceFeature.properties,
            ...targetFeature.properties,
            source_id: sourceFeature.id || null,
            target_id: targetFeature.id || null
          };
          intersectionFeatures.push(intersection);
        }
      } catch (error) {
        console.warn(`Erreur lors du calcul d'intersection: ${error.message}`);
      }
    }
  }

  return {
    type: 'FeatureCollection',
    features: intersectionFeatures
  };
}

/**
 * Calcule les centroïdes des entités
 * @param {Object} geojson - Données GeoJSON
 * @returns {Object} GeoJSON des centroïdes
 */
export function calculateCentroids(geojson) {
  if (!geojson || !geojson.features || !geojson.features.length) {
    throw new Error('Données GeoJSON invalides');
  }

  const centroidFeatures = geojson.features.map(feature => {
    try {
      const centroid = turf.centroid(feature);
      centroid.properties = { ...feature.properties };
      return centroid;
    } catch (error) {
      console.warn(`Erreur lors du calcul du centroïde: ${error.message}`);
      return null;
    }
  }).filter(Boolean);

  return {
    type: 'FeatureCollection',
    features: centroidFeatures
  };
}

/**
 * Calcule l'union de plusieurs entités
 * @param {Object} geojson - Données GeoJSON
 * @returns {Object} GeoJSON de l'union
 */
export function calculateUnion(geojson) {
  if (!geojson || !geojson.features || !geojson.features.length) {
    throw new Error('Données GeoJSON invalides');
  }

  try {
    return turf.dissolve(geojson);
  } catch (error) {
    console.error(`Erreur lors du calcul de l'union: ${error.message}`);
    throw error;
  }
}

/**
 * Calcule la différence entre deux jeux de données
 * @param {Object} sourceGeojson - Première couche GeoJSON
 * @param {Object} targetGeojson - Seconde couche GeoJSON
 * @returns {Object} GeoJSON des différences
 */
export function calculateDifference(sourceGeojson, targetGeojson) {
  if (!sourceGeojson?.features?.length || !targetGeojson?.features?.length) {
    throw new Error('Deux jeux de données valides sont nécessaires');
  }

  const differenceFeatures = [];

  for (const sourceFeature of sourceGeojson.features) {
    if (sourceFeature.geometry.type !== 'Polygon' && 
        sourceFeature.geometry.type !== 'MultiPolygon') {
      continue;
    }

    let currentFeature = { ...sourceFeature };

    for (const targetFeature of targetGeojson.features) {
      if (targetFeature.geometry.type !== 'Polygon' && 
          targetFeature.geometry.type !== 'MultiPolygon') {
        continue;
      }

      try {
        const difference = turf.difference(currentFeature, targetFeature);
        if (difference) {
          currentFeature = difference;
        }
      } catch (error) {
        console.warn(`Erreur lors du calcul de différence: ${error.message}`);
      }
    }

    if (currentFeature) {
      differenceFeatures.push(currentFeature);
    }
  }

  return {
    type: 'FeatureCollection',
    features: differenceFeatures
  };
}

/**
 * Crée un diagramme de Voronoï à partir de points
 * @param {Object} geojson - Données GeoJSON de points
 * @param {Array} bbox - Boîte englobante [minX, minY, maxX, maxY]
 * @returns {Object} GeoJSON du diagramme de Voronoï
 */
export function createVoronoi(geojson, bbox) {
  if (!geojson || !geojson.features || !geojson.features.length) {
    throw new Error('Données GeoJSON invalides');
  }

  // Extraire les points
  const points = geojson.features.map(feature => {
    if (feature.geometry.type === 'Point') {
      return feature;
    } else {
      try {
        return turf.centroid(feature);
      } catch (error) {
        console.warn(`Erreur lors de la conversion en point: ${error.message}`);
        return null;
      }
    }
  }).filter(Boolean);

  if (points.length === 0) {
    throw new Error('Aucun point valide trouvé');
  }

  const pointCollection = {
    type: 'FeatureCollection',
    features: points
  };

  // Utiliser la bbox des points si non fournie
  const boundingBox = bbox || turf.bbox(pointCollection);

  try {
    return turf.voronoi(pointCollection, { bbox: boundingBox });
  } catch (error) {
    console.error(`Erreur lors de la création du diagramme de Voronoï: ${error.message}`);
    throw error;
  }
}

/**
 * Calcule des statistiques de base pour un champ
 * @param {Object} geojson - Données GeoJSON
 * @param {string} field - Nom du champ
 * @returns {Object} Statistiques (min, max, mean, etc.)
 */
export function calculateFieldStatistics(geojson, field) {
  if (!geojson || !geojson.features || !geojson.features.length || !field) {
    throw new Error('Données GeoJSON ou champ invalides');
  }

  const values = geojson.features
    .map(feature => feature.properties?.[field])
    .filter(value => value !== undefined && value !== null && !isNaN(Number(value)))
    .map(Number);

  if (values.length === 0) {
    throw new Error(`Aucune valeur numérique valide trouvée pour le champ "${field}"`);
  }

  return {
    count: values.length,
    sum: values.reduce((acc, val) => acc + val, 0),
    min: Math.min(...values),
    max: Math.max(...values),
    mean: values.reduce((acc, val) => acc + val, 0) / values.length,
    median: values.sort()[Math.floor(values.length / 2)]
  };
}