import { create } from 'zustand';
import { nanoid } from 'nanoid';
import * as turf from '@turf/turf';
import { 
  ScatterplotLayer, 
  GeoJsonLayer, 
  TextLayer, 
  LineLayer, 
  PolygonLayer,
  SolidPolygonLayer,
  IconLayer
} from '@deck.gl/layers';
import {
  HeatmapLayer,
  HexagonLayer,
  GridLayer,
  ContourLayer,
  ScreenGridLayer
} from '@deck.gl/aggregation-layers';
import { 
  TripsLayer, 
  TerrainLayer, 
  H3HexagonLayer 
} from '@deck.gl/geo-layers';
import { ColorScaleShader } from '@deck.gl/extensions';
import { saveDataset, loadDataset } from '@/utils/storage';

const useDataState = create((set, get) => ({
  // Données chargées
  datasets: [],
  selectedDataset: null,

  // État de visualisation
  visualizationType: 'scatterplot',
  visualizationConfig: {
    colorField: null,
    sizeField: null,
    heightField: null,
    timeField: null,
    tooltipFields: [],
    aggregationType: 'count',
    colorScale: 'sequential',
    colorRange: [
      [239, 243, 255],
      [198, 219, 239],
      [158, 202, 225],
      [107, 174, 214],
      [66, 146, 198],
      [33, 113, 181],
      [8, 81, 156],
      [8, 48, 107]
    ],
    reverseColorScale: false,
    opacity: 0.8,
    radius: 100,
    elevationScale: 1,
    cellSize: 1000,
    coverage: 0.8,
    timeAnimation: false,
    timeStep: 1,
    currentTime: 0,
    trail: 10,
    extruded: false,
    wireframe: false,
    filled: true,
    stroked: true,
    lineWidth: 1,
    pointRadiusMinPixels: 2,
    pointRadiusMaxPixels: 100,
    classificationMethod: 'quantile'
  },

  // État de filtrage
  filters: [],

  // Charger un jeu de données
  loadData: async (dataId) => {
    try {
      const data = await loadDataset(dataId);
      
      set(state => ({
        datasets: [...state.datasets, data],
        selectedDataset: data.id
      }));
      
      return data.id;
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      throw error;
    }
  },

  // Ajouter un jeu de données
  addData: async (data, name, type = 'geojson') => {
    try {
      const id = nanoid();
      const datasetInfo = {
        id,
        name,
        type,
        data,
        dateAdded: new Date().toISOString()
      };
      
      // Sauvegarder dans IndexedDB
      await saveDataset(datasetInfo);
      
      set(state => ({
        datasets: [...state.datasets, datasetInfo],
        selectedDataset: id
      }));
      
      return id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout des données:', error);
      throw error;
    }
  },

  // Obtenir les couches de visualisation pour deck.gl
  getVisualizationLayers: () => {
    const { selectedDataset, visualizationType, visualizationConfig } = get();
    
    if (!selectedDataset) return [];
    
    const dataset = get().datasets.find(d => d.id === selectedDataset);
    if (!dataset || !dataset.data) return [];
    
    const data = dataset.data;
    
    // Propriétés communes pour les couches
    const commonProps = {
      pickable: true,
      opacity: visualizationConfig.opacity,
      updateTriggers: {
        getColor: [
          visualizationConfig.colorField, 
          visualizationConfig.colorScale, 
          visualizationConfig.colorRange,
          visualizationConfig.reverseColorScale
        ],
        getRadius: [visualizationConfig.sizeField],
        getElevation: [visualizationConfig.heightField, visualizationConfig.elevationScale]
      }
    };
    
    // Fonction pour obtenir la couleur basée sur un champ et une échelle
    const getColorFromField = (object) => {
      const { colorField, colorRange, colorScale, reverseColorScale } = visualizationConfig;
      
      if (!colorField) return [100, 100, 100, 255];
      
      let value = 0;
      
      if (object.properties) {
        value = object.properties[colorField];
      } else if (object[colorField] !== undefined) {
        value = object[colorField];
      }
      
      if (value === undefined || value === null) {
        return [100, 100, 100, 255];
      }
      
      // Normaliser la valeur entre 0 et 1
      const { min, max } = getFieldMinMax(colorField, data);
      const normalizedValue = (value - min) / (max - min);
      
      // Inverser la valeur si nécessaire
      const scaledValue = reverseColorScale ? 1 - normalizedValue : normalizedValue;
      
      // Obtenir l'index de couleur correspondant
      const colors = visualizationConfig.colorRange;
      const colorIndex = Math.min(
        Math.floor(scaledValue * colors.length),
        colors.length - 1
      );
      
      return [...colors[colorIndex], 255];
    };
    
    // Générer les couches en fonction du type de visualisation
    switch (visualizationType) {
      case 'scatterplot':
        return [
          new ScatterplotLayer({
            id: 'scatterplot-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            radiusUnits: 'meters',
            getPosition: getPosition,
            getRadius: getRadius,
            getFillColor: getColorFromField,
            radiusScale: visualizationConfig.radius,
            radiusMinPixels: visualizationConfig.pointRadiusMinPixels,
            radiusMaxPixels: visualizationConfig.pointRadiusMaxPixels,
            stroked: visualizationConfig.stroked,
            lineWidthUnits: 'pixels',
            getLineColor: [0, 0, 0, 255],
            getLineWidth: visualizationConfig.lineWidth
          })
        ];
        
      case 'geojson':
        return [
          new GeoJsonLayer({
            id: 'geojson-layer',
            data,
            ...commonProps,
            pointRadiusUnits: 'meters',
            pointRadiusScale: visualizationConfig.radius,
            pointRadiusMinPixels: visualizationConfig.pointRadiusMinPixels,
            pointRadiusMaxPixels: visualizationConfig.pointRadiusMaxPixels,
            getPointRadius: getRadius,
            getFillColor: getColorFromField,
            getLineColor: [0, 0, 0, 255],
            getLineWidth: visualizationConfig.lineWidth,
            lineWidthUnits: 'pixels',
            stroked: visualizationConfig.stroked,
            filled: visualizationConfig.filled,
            extruded: visualizationConfig.extruded,
            wireframe: visualizationConfig.wireframe,
            getElevation: getElevation,
            elevationScale: visualizationConfig.elevationScale
          })
        ];
        
      case 'heatmap':
        return [
          new HeatmapLayer({
            id: 'heatmap-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getWeight: getWeight,
            radiusPixels: visualizationConfig.radius,
            colorRange: visualizationConfig.colorRange,
            intensity: visualizationConfig.elevationScale,
            threshold: 0.05,
            aggregation: 'SUM'
          })
        ];
        
      case 'grid':
        return [
          new GridLayer({
            id: 'grid-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getColorWeight: getWeight,
            colorScale: getColorScale(),
            colorRange: visualizationConfig.colorRange,
            elevationRange: [0, visualizationConfig.elevationScale * 5000],
            elevationScale: visualizationConfig.elevationScale,
            extruded: visualizationConfig.extruded,
            cellSize: visualizationConfig.cellSize,
            coverage: visualizationConfig.coverage,
            material: {
              ambient: 0.4,
              diffuse: 0.6,
              shininess: 32,
              specularColor: [30, 30, 30]
            }
          })
        ];
        
      case 'hexagon':
        return [
          new HexagonLayer({
            id: 'hexagon-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getColorWeight: getWeight,
            colorScale: getColorScale(),
            colorRange: visualizationConfig.colorRange,
            elevationRange: [0, visualizationConfig.elevationScale * 5000],
            elevationScale: visualizationConfig.elevationScale,
            extruded: visualizationConfig.extruded,
            radius: visualizationConfig.cellSize,
            coverage: visualizationConfig.coverage,
            material: {
              ambient: 0.4,
              diffuse: 0.6,
              shininess: 32,
              specularColor: [30, 30, 30]
            }
          })
        ];
        
      case 'contour':
        return [
          new ContourLayer({
            id: 'contour-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getWeight: getWeight,
            cellSize: visualizationConfig.cellSize,
            contours: [
              { threshold: 0.1, color: [255, 255, 178, 200], strokeWidth: 2 },
              { threshold: 0.25, color: [254, 204, 92, 200], strokeWidth: 2 },
              { threshold: 0.5, color: [253, 141, 60, 200], strokeWidth: 2 },
              { threshold: 0.75, color: [240, 59, 32, 200], strokeWidth: 2 },
              { threshold: 0.9, color: [189, 0, 38, 200], strokeWidth: 2 }
            ],
            gpuAggregation: true,
            aggregation: 'SUM'
          })
        ];
        
      case 'polygon':
        return [
          new SolidPolygonLayer({
            id: 'polygon-layer',
            data: isPolygon(data) ? data : convertToPolygons(data),
            ...commonProps,
            getPolygon: d => d.geometry.coordinates,
            getFillColor: getColorFromField,
            getLineColor: [0, 0, 0, 255],
            extruded: visualizationConfig.extruded,
            wireframe: visualizationConfig.wireframe,
            getElevation: getElevation,
            elevationScale: visualizationConfig.elevationScale,
            material: {
              ambient: 0.4,
              diffuse: 0.6,
              shininess: 32,
              specularColor: [30, 30, 30]
            }
          })
        ];
        
      case 'line':
        return [
          new LineLayer({
            id: 'line-layer',
            data: convertToLines(data),
            ...commonProps,
            getSourcePosition: d => d.geometry.coordinates[0],
            getTargetPosition: d => d.geometry.coordinates[1],
            getColor: getColorFromField,
            getWidth: visualizationConfig.lineWidth,
            widthUnits: 'pixels',
            widthScale: 1,
            widthMinPixels: 1,
            widthMaxPixels: 10
          })
        ];
        
      case 'icon':
        return [
          new IconLayer({
            id: 'icon-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getIcon: d => 'marker',
            getSize: visualizationConfig.radius,
            getColor: getColorFromField,
            sizeUnits: 'pixels',
            sizeScale: 1,
            sizeMinPixels: 10,
            sizeMaxPixels: 100,
            iconAtlas: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
            iconMapping: {
              marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
            }
          })
        ];
        
      case 'text':
        return [
          new TextLayer({
            id: 'text-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getText: d => {
              if (visualizationConfig.textField) {
                if (d.properties) {
                  return String(d.properties[visualizationConfig.textField] || '');
                } else {
                  return String(d[visualizationConfig.textField] || '');
                }
              }
              return '';
            },
            getSize: visualizationConfig.radius,
            getColor: getColorFromField,
            getAngle: 0,
            sizeUnits: 'pixels',
            sizeScale: 1,
            sizeMinPixels: 10,
            sizeMaxPixels: 100,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            getTextAnchor: 'middle',
            getAlignmentBaseline: 'center'
          })
        ];
        
      case 'screenGrid':
        return [
          new ScreenGridLayer({
            id: 'screenGrid-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getWeight: getWeight,
            cellSizePixels: visualizationConfig.radius,
            colorRange: visualizationConfig.colorRange,
            colorDomain: [0, 1],
            gpuAggregation: true
          })
        ];
        
      case 'h3':
        return [
          new H3HexagonLayer({
            id: 'h3-layer',
            data: convertToH3Hexagons(data, visualizationConfig.cellSize),
            ...commonProps,
            getHexagon: d => d.hex,
            getFillColor: getColorFromField,
            extruded: visualizationConfig.extruded,
            elevationScale: visualizationConfig.elevationScale,
            getElevation: getElevation,
            wireframe: visualizationConfig.wireframe,
            material: {
              ambient: 0.4,
              diffuse: 0.6,
              shininess: 32,
              specularColor: [30, 30, 30]
            }
          })
        ];
        
      case 'trip':
        return [
          new TripsLayer({
            id: 'trip-layer',
            data: visualizationConfig.timeAnimation ? convertToTimeTrips(data) : convertToPointFeatures(data),
            ...commonProps,
            getPath: d => d.path,
            getTimestamps: d => d.timestamps,
            getColor: getColorFromField,
            widthMinPixels: 2,
            rounded: true,
            trailLength: visualizationConfig.trail,
            currentTime: visualizationConfig.currentTime
          })
        ];
        
      case 'terrain':
        return [
          new TerrainLayer({
            id: 'terrain-layer',
            elevationDecoder: {
              rScaler: 1,
              gScaler: 0,
              bScaler: 0,
              offset: 0
            },
            ...getTerrainData(data, visualizationConfig),
            material: {
              ambient: 0.6,
              diffuse: 0.6,
              shininess: 32,
              specularColor: [30, 30, 30]
            }
          })
        ];
        
      default:
        return [
          new ScatterplotLayer({
            id: 'default-scatterplot-layer',
            data: convertToPointFeatures(data),
            ...commonProps,
            getPosition: getPosition,
            getRadius: 100,
            getFillColor: [67, 121, 237, 255]
          })
        ];
    }
  },
  
  // Définir le type de visualisation
  setVisualizationType: (type) => {
    set({ visualizationType: type });
  },
  
  // Mettre à jour la configuration de visualisation
  updateVisualizationConfig: (config) => {
    set(state => ({
      visualizationConfig: {
        ...state.visualizationConfig,
        ...config
      }
    }));
  },
  
  // Ajouter un filtre
  addFilter: (field, operator, value) => {
    set(state => ({
      filters: [...state.filters, { field, operator, value }]
    }));
  },
  
  // Supprimer un filtre
  removeFilter: (index) => {
    set(state => ({
      filters: state.filters.filter((_, i) => i !== index)
    }));
  },
  
  // Supprimer tous les filtres
  clearFilters: () => {
    set({ filters: [] });
  },
  
  // Sélectionner un jeu de données
  selectDataset: (datasetId) => {
    set({ selectedDataset: datasetId });
  },
  
  // Supprimer un jeu de données
  removeDataset: (datasetId) => {
    set(state => ({
      datasets: state.datasets.filter(d => d.id !== datasetId),
      selectedDataset: state.selectedDataset === datasetId ? null : state.selectedDataset
    }));
  }
}));

// Fonction utilitaire pour convertir différents formats vers des points
function convertToPointFeatures(data) {
  if (!data) return [];
  
  // Si c'est déjà un GeoJSON FeatureCollection
  if (data.type === 'FeatureCollection') {
    // Filtrer les points et convertir les autres géométries en points
    return data.features.map(feature => {
      if (feature.geometry.type === 'Point') {
        return feature;
      } else {
        // Convertir d'autres géométries en points (centroid)
        const centroid = turf.centroid(feature);
        return {
          ...centroid,
          properties: feature.properties
        };
      }
    });
  }
  
  // Si c'est un tableau d'objets avec lat/lng
  if (Array.isArray(data)) {
    return data.map(item => {
      const coords = [];
      
      // Déterminer les coordonnées selon les propriétés disponibles
      if (item.latitude !== undefined && item.longitude !== undefined) {
        coords[0] = item.longitude;
        coords[1] = item.latitude;
      } else if (item.lat !== undefined && item.lng !== undefined) {
        coords[0] = item.lng;
        coords[1] = item.lat;
      } else if (item.lat !== undefined && item.lon !== undefined) {
        coords[0] = item.lon;
        coords[1] = item.lat;
      } else if (item.y !== undefined && item.x !== undefined) {
        coords[0] = item.x;
        coords[1] = item.y;
      }
      
      // Créer une feature GeoJSON
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords
        },
        properties: { ...item }
      };
    });
  }
  
  return [];
}

// Fonction pour vérifier si les données sont des polygones
function isPolygon(data) {
  if (!data) return false;
  
  if (data.type === 'FeatureCollection') {
    return data.features.some(feature => 
      feature.geometry.type === 'Polygon' || 
      feature.geometry.type === 'MultiPolygon'
    );
  }
  
  return false;
}

// Fonction pour convertir les données en polygones
function convertToPolygons(data) {
  if (!data) return [];
  
  // Si c'est déjà un GeoJSON FeatureCollection
  if (data.type === 'FeatureCollection') {
    // Filtrer pour ne garder que les polygones
    return data.features.filter(feature => 
      feature.geometry.type === 'Polygon' || 
      feature.geometry.type === 'MultiPolygon'
    );
  }
  
  return [];
}

// Fonction pour convertir les données en lignes
function convertToLines(data) {
  if (!data) return [];
  
  // Si c'est déjà un GeoJSON FeatureCollection
  if (data.type === 'FeatureCollection') {
    // Filtrer pour ne garder que les lignes
    const lineFeatures = data.features.filter(feature => 
      feature.geometry.type === 'LineString' || 
      feature.geometry.type === 'MultiLineString'
    );
    
    // Pour les autres types, créer des lignes
    const pointFeatures = data.features.filter(feature => 
      feature.geometry.type === 'Point'
    );
    
    if (pointFeatures.length >= 2) {
      // Créer des lignes entre points consécutifs
      const lines = [];
      for (let i = 0; i < pointFeatures.length - 1; i++) {
        const start = pointFeatures[i].geometry.coordinates;
        const end = pointFeatures[i + 1].geometry.coordinates;
        
        lines.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [start, end]
          },
          properties: {
            ...pointFeatures[i].properties,
            startPoint: pointFeatures[i].properties,
            endPoint: pointFeatures[i + 1].properties
          }
        });
      }
      
      return [...lineFeatures, ...lines];
    }
    
    return lineFeatures;
  }
  
  // Pour les données tabulaires, essayer de créer des lignes
  if (Array.isArray(data) && data.length >= 2) {
    // Ordonner les points par un champ de temps ou d'ordre s'il existe
    const sortedData = [...data].sort((a, b) => {
      if (a.time && b.time) return a.time - b.time;
      if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
      if (a.order && b.order) return a.order - b.order;
      return 0;
    });
    
    // Créer des lignes entre points consécutifs
    const lines = [];
    for (let i = 0; i < sortedData.length - 1; i++) {
      const startCoords = [
        sortedData[i].longitude || sortedData[i].lng || sortedData[i].lon || sortedData[i].x,
        sortedData[i].latitude || sortedData[i].lat || sortedData[i].y
      ];
      
      const endCoords = [
        sortedData[i+1].longitude || sortedData[i+1].lng || sortedData[i+1].lon || sortedData[i+1].x,
        sortedData[i+1].latitude || sortedData[i+1].lat || sortedData[i+1].y
      ];
      
      lines.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [startCoords, endCoords]
        },
        properties: {
          ...sortedData[i],
          startPoint: sortedData[i],
          endPoint: sortedData[i+1]
        }
      });
    }
    
    return lines;
  }
  
  return [];
}

// Convertir les données pour la visualisation temporelle
function convertToTimeTrips(data) {
  if (!data) return [];
  
  // Si c'est un GeoJSON, convertir les lignes ou points en trips
  if (data.type === 'FeatureCollection') {
    const points = data.features.filter(f => f.geometry.type === 'Point');
    
    if (points.length < 2) return [];
    
    // Ordonner les points par un champ de temps
    const sortedPoints = [...points].sort((a, b) => {
      if (a.properties.time && b.properties.time) return a.properties.time - b.properties.time;
      if (a.properties.timestamp && b.properties.timestamp) return a.properties.timestamp - b.properties.timestamp;
      if (a.properties.order && b.properties.order) return a.properties.order - b.properties.order;
      return 0;
    });
    
    // Créer un trip
    const path = sortedPoints.map(point => point.geometry.coordinates);
    const timestamps = sortedPoints.map((point, index) => {
      if (point.properties.time) return point.properties.time;
      if (point.properties.timestamp) return point.properties.timestamp;
      // Créer une séquence temporelle arbitraire si aucune donnée de temps n'est disponible
      return index * 10;
    });
    
    return [{
      path,
      timestamps,
      properties: sortedPoints[0].properties
    }];
  }
  
  // Pour les données tabulaires
  if (Array.isArray(data) && data.length >= 2) {
    // Grouper par trajectoire si un ID de trajectoire est présent
    const trajectoryGroups = {};
    
    data.forEach(point => {
      const trajectoryId = point.trajectoryId || point.trip_id || point.id || 'default';
      
      if (!trajectoryGroups[trajectoryId]) {
        trajectoryGroups[trajectoryId] = [];
      }
      
      trajectoryGroups[trajectoryId].push(point);
    });
    
    // Convertir chaque groupe en une trajectoire
    return Object.values(trajectoryGroups).map(points => {
      // Trier par temps
      const sortedPoints = [...points].sort((a, b) => {
        if (a.time && b.time) return a.time - b.time;
        if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
        if (a.order && b.order) return a.order - b.order;
        return 0;
      });
      
      // Extraire le chemin et les horodatages
      const path = sortedPoints.map(point => [
        point.longitude || point.lng || point.lon || point.x,
        point.latitude || point.lat || point.y
      ]);
      
      const timestamps = sortedPoints.map((point, index) => {
        if (point.time) return point.time;
        if (point.timestamp) return point.timestamp;
        return index * 10;
      });
      
      return {
        path,
        timestamps,
        properties: { ...sortedPoints[0] }
      };
    });
  }
  
  return [];
}

// Convertir les données en hexagones H3
function convertToH3Hexagons(data, resolution = 8) {
  if (!data) return [];
  
  const h3Bins = {};
  const points = convertToPointFeatures(data);
  
  // Agrégation des points dans des bins H3
  points.forEach(point => {
    const coords = point.geometry.coordinates;
    if (!coords || coords.length < 2) return;
    
    // Convertir les coordonnées en index H3
    const h3Index = turf.point(coords);
    const hexId = h3Index.properties.hex;
    
    if (!h3Bins[hexId]) {
      h3Bins[hexId] = {
        hex: hexId,
        count: 0,
        properties: {}
      };
    }
    
    h3Bins[hexId].count += 1;
    
    // Agréger les propriétés numériques
    if (point.properties) {
      Object.entries(point.properties).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (!h3Bins[hexId].properties[key]) {
            h3Bins[hexId].properties[key] = 0;
          }
          h3Bins[hexId].properties[key] += value;
        }
      });
    }
  });
  
  return Object.values(h3Bins);
}

// Fonction pour préparer les données de terrain
function getTerrainData(data, config) {
  // Dans une application réelle, cette fonction convertirait les données
  // en un format compatible avec TerrainLayer. Pour simplifier, on retourne
  // une configuration basique.
  return {
    terrain: {
      // mesh: terrain data
      // texture: terrain texture
    },
    // Autres propriétés spécifiques au terrain
  };
}

// Obtenir les valeurs min/max pour un champ
function getFieldMinMax(field, data) {
  let min = Infinity;
  let max = -Infinity;
  
  if (!data || !field) return { min: 0, max: 1 };
  
  // Pour les collections de features GeoJSON
  if (data.type === 'FeatureCollection' && data.features) {
    data.features.forEach(feature => {
      if (feature.properties && feature.properties[field] !== undefined) {
        const value = Number(feature.properties[field]);
        if (!isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
    });
  } 
  // Pour les tableaux d'objets
  else if (Array.isArray(data)) {
    data.forEach(item => {
      if (item[field] !== undefined) {
        const value = Number(item[field]);
        if (!isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      }
    });
  }
  
  // Valeurs par défaut si aucune donnée valide
  if (min === Infinity || max === -Infinity) {
    return { min: 0, max: 1 };
  }
  
  return { min, max };
}

// Fonctions auxiliaires pour deck.gl layers
function getPosition(d) {
  // Pour les features GeoJSON
  if (d.geometry && d.geometry.type === 'Point') {
    return d.geometry.coordinates;
  }
  
  // Pour les données tabulaires
  return [
    d.longitude || d.lng || d.lon || d.x || 0,
    d.latitude || d.lat || d.y || 0,
    d.elevation || d.altitude || d.alt || d.z || 0
  ];
}

function getRadius(d) {
  const config = useDataState.getState().visualizationConfig;
  
  if (config.sizeField) {
    let value = 0;
    
    if (d.properties && d.properties[config.sizeField] !== undefined) {
      value = d.properties[config.sizeField];
    } else if (d[config.sizeField] !== undefined) {
      value = d[config.sizeField];
    }
    
    // Normaliser selon le min/max du champ
    const { min, max } = getFieldMinMax(config.sizeField, useDataState.getState().datasets.find(
      dataset => dataset.id === useDataState.getState().selectedDataset
    )?.data);
    
    const normalizedValue = (value - min) / (max - min);
    return config.radius * (0.1 + normalizedValue * 0.9);
  }
  
  return config.radius;
}

function getElevation(d) {
  const config = useDataState.getState().visualizationConfig;
  
  if (config.heightField) {
    let value = 0;
    
    if (d.properties && d.properties[config.heightField] !== undefined) {
      value = d.properties[config.heightField];
    } else if (d[config.heightField] !== undefined) {
      value = d[config.heightField];
    }
    
    return value * config.elevationScale;
  }
  
  return 0;
}

function getWeight(d) {
  const config = useDataState.getState().visualizationConfig;
  
  if (config.weightField) {
    if (d.properties && d.properties[config.weightField] !== undefined) {
      return d.properties[config.weightField];
    } else if (d[config.weightField] !== undefined) {
      return d[config.weightField];
    }
  }
  
  return 1;
}

function getColorScale() {
  const config = useDataState.getState().visualizationConfig;
  
  // Différentes échelles selon la méthode de classification
  switch (config.classificationMethod) {
    case 'quantile':
      return 'quantile';
    case 'equal':
      return 'quantize';
    case 'jenks':
      return 'quantize'; // Approximation
    default:
      return 'quantize';
  }
}

export default useDataState;