import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import * as turf from '@turf/turf';
import {
  ScatterplotLayer,
  GeoJsonLayer,
  SolidPolygonLayer,
  LineLayer,
  TextLayer,
  IconLayer
} from '@deck.gl/layers';
import {
  HeatmapLayer,
  HexagonLayer,
  GridLayer
} from '@deck.gl/aggregation-layers';
import { schemeBlues, schemeReds, schemeGreens, schemePurples, schemeViridis } from 'd3-scale-chromatic';

// Store pour la gestion avancée des couches
const useLayerManager = create((set, get) => ({
  // État des couches
  layers: [],
  visibleLayers: [],
  activeLayer: null,
  lockedLayers: [],
  layerGroups: [],
  layerOrder: [], // Pour contrôler l'ordre d'affichage
  
  // Options globales d'affichage
  globalOpacity: 1.0,
  
  // Récupérer les couches actives pour deck.gl
  get activeLayers() {
    const layers = get().layers;
    const visibleLayers = get().visibleLayers;
    const layerOrder = get().layerOrder;
    
    // Filtrer les couches visibles et les trier selon l'ordre défini
    const activeLayerObjects = layers
      .filter(layer => visibleLayers.includes(layer.id))
      .sort((a, b) => {
        const indexA = layerOrder.indexOf(a.id);
        const indexB = layerOrder.indexOf(b.id);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });
    
    // Générer les couches deck.gl
    return activeLayerObjects.map(layer => layer.deckGlLayer);
  },
  
  // Ajouter une nouvelle couche
  addLayer: (layerConfig) => {
    const id = layerConfig.id || nanoid();
    const defaultStyle = getDefaultStyle(layerConfig.type);
    
    const newLayer = {
      ...layerConfig,
      id,
      style: layerConfig.style || defaultStyle,
      metadata: {
        ...layerConfig.metadata,
        createdAt: Date.now()
      }
    };
    
    // Générer la couche deck.gl initiale
    newLayer.deckGlLayer = generateDeckGlLayer(newLayer);
    
    set(state => {
      // Ajouter la couche en haut (au début) de l'ordre d'affichage
      const newLayerOrder = [id, ...state.layerOrder];
      
      return {
        layers: [...state.layers, newLayer],
        visibleLayers: [...state.visibleLayers, id],
        activeLayer: id,
        layerOrder: newLayerOrder
      };
    });
    
    return id;
  },
  
  // Supprimer une couche
  removeLayer: (layerId) => {
    set(state => ({
      layers: state.layers.filter(layer => layer.id !== layerId),
      visibleLayers: state.visibleLayers.filter(id => id !== layerId),
      activeLayer: state.activeLayer === layerId ? null : state.activeLayer,
      layerOrder: state.layerOrder.filter(id => id !== layerId)
    }));
  },
  
  // Définir les couches (remplacement complet)
  setLayers: (layers) => {
    const procesedLayers = layers.map(layer => ({
      ...layer,
      deckGlLayer: generateDeckGlLayer(layer)
    }));
    
    set(state => {
      // Reconstruire l'ordre des couches
      const layerOrder = procesedLayers.map(layer => layer.id);
      
      return {
        layers: procesedLayers,
        layerOrder,
        // Conserver seulement les couches visibles qui existent encore
        visibleLayers: state.visibleLayers.filter(id => 
          procesedLayers.some(layer => layer.id === id)
        )
      };
    });
  },
  
  // Définir la couche active
  setActiveLayer: (layerId) => {
    set({ activeLayer: layerId });
  },
  
  // Définir les couches visibles
  setVisibleLayers: (visibleLayers) => {
    set({ visibleLayers });
  },
  
  // Basculer la visibilité d'une couche
  toggleLayerVisibility: (layerId) => {
    set(state => {
      const isVisible = state.visibleLayers.includes(layerId);
      
      return {
        visibleLayers: isVisible
          ? state.visibleLayers.filter(id => id !== layerId)
          : [...state.visibleLayers, layerId]
      };
    });
  },
  
  // Mettre à jour le style d'une couche
  updateLayerStyle: (layerId, styleUpdates) => {
    set(state => {
      const updatedLayers = state.layers.map(layer => {
        if (layer.id !== layerId) return layer;
        
        const updatedLayer = {
          ...layer,
          style: {
            ...layer.style,
            ...styleUpdates
          }
        };
        
        // Regenerer la couche deck.gl avec le nouveau style
        updatedLayer.deckGlLayer = generateDeckGlLayer(updatedLayer);
        
        return updatedLayer;
      });
      
      return { layers: updatedLayers };
    });
  },
  
  // Mettre à jour les données d'une couche
  updateLayerData: (layerId, data) => {
    set(state => {
      const updatedLayers = state.layers.map(layer => {
        if (layer.id !== layerId) return layer;
        
        const updatedLayer = {
          ...layer,
          data
        };
        
        // Regenerer la couche deck.gl avec les nouvelles données
        updatedLayer.deckGlLayer = generateDeckGlLayer(updatedLayer);
        
        return updatedLayer;
      });
      
      return { layers: updatedLayers };
    });
  },
  
  // Mettre à jour les métadonnées d'une couche
  updateLayerMetadata: (layerId, metadata) => {
    set(state => ({
      layers: state.layers.map(layer => 
        layer.id === layerId
          ? {
              ...layer,
              ...metadata, // Mise à jour directe des propriétés au niveau supérieur
              metadata: {
                ...layer.metadata,
                ...metadata
              }
            }
          : layer
      )
    }));
  },
  
  // Appliquer un filtre à une couche
  updateLayerFilter: (layerId, filter) => {
    set(state => {
      const updatedLayers = state.layers.map(layer => {
        if (layer.id !== layerId) return layer;
        
        const updatedLayer = {
          ...layer,
          filter
        };
        
        // Regenerer la couche deck.gl avec le nouveau filtre
        updatedLayer.deckGlLayer = generateDeckGlLayer(updatedLayer);
        
        return updatedLayer;
      });
      
      return { layers: updatedLayers };
    });
  },
  
  // Verrouiller/déverrouiller une couche
  lockLayer: (layerId, isLocked) => {
    set(state => ({
      lockedLayers: isLocked
        ? [...state.lockedLayers, layerId]
        : state.lockedLayers.filter(id => id !== layerId)
    }));
  },
  
  // Créer un groupe de couches
  createLayerGroup: (name, layerIds) => {
    const groupId = nanoid();
    
    set(state => ({
      layerGroups: [
        ...state.layerGroups,
        {
          id: groupId,
          name,
          layers: layerIds
        }
      ]
    }));
    
    return groupId;
  },
  
  // Mettre à jour un groupe de couches
  updateLayerGroup: (groupId, updates) => {
    set(state => ({
      layerGroups: state.layerGroups.map(group => 
        group.id === groupId
          ? { ...group, ...updates }
          : group
      )
    }));
  },
  
  // Supprimer un groupe de couches
  removeLayerGroup: (groupId) => {
    set(state => ({
      layerGroups: state.layerGroups.filter(group => group.id !== groupId)
    }));
  },
  
  // Réordonner les couches
  reorderLayers: (layerOrder) => {
    set({ layerOrder });
  },
  
  // Monter une couche dans l'ordre d'affichage (la rendre plus visible)
  moveLayerUp: (layerId) => {
    set(state => {
      const currentOrder = [...state.layerOrder];
      const index = currentOrder.indexOf(layerId);
      
      if (index <= 0) return state; // Déjà tout en haut
      
      // Échanger avec la couche au-dessus
      [currentOrder[index], currentOrder[index - 1]] = [currentOrder[index - 1], currentOrder[index]];
      
      return { layerOrder: currentOrder };
    });
  },
  
  // Descendre une couche dans l'ordre d'affichage (la rendre moins visible)
  moveLayerDown: (layerId) => {
    set(state => {
      const currentOrder = [...state.layerOrder];
      const index = currentOrder.indexOf(layerId);
      
      if (index === -1 || index >= currentOrder.length - 1) return state; // Déjà tout en bas
      
      // Échanger avec la couche en-dessous
      [currentOrder[index], currentOrder[index + 1]] = [currentOrder[index + 1], currentOrder[index]];
      
      return { layerOrder: currentOrder };
    });
  },
  
  // Dupliquer une couche
  duplicateLayer: (layerId) => {
    const layers = get().layers;
    const layerToDuplicate = layers.find(layer => layer.id === layerId);
    
    if (!layerToDuplicate) return null;
    
    const duplicatedLayer = {
      ...layerToDuplicate,
      id: nanoid(),
      title: `${layerToDuplicate.title || layerId} (copie)`,
      metadata: {
        ...layerToDuplicate.metadata,
        createdAt: Date.now(),
        isDuplicate: true,
        originalLayer: layerId
      }
    };
    
    // Générer la nouvelle couche deck.gl
    duplicatedLayer.deckGlLayer = generateDeckGlLayer(duplicatedLayer);
    
    set(state => {
      // Insérer la copie juste après l'original dans l'ordre des couches
      const currentOrder = [...state.layerOrder];
      const insertIndex = currentOrder.indexOf(layerId);
      
      if (insertIndex !== -1) {
        currentOrder.splice(insertIndex + 1, 0, duplicatedLayer.id);
      } else {
        currentOrder.unshift(duplicatedLayer.id);
      }
      
      return {
        layers: [...state.layers, duplicatedLayer],
        visibleLayers: [...state.visibleLayers, duplicatedLayer.id],
        layerOrder: currentOrder
      };
    });
    
    return duplicatedLayer.id;
  },
  
  // Activer/désactiver le mode temporel pour une couche
  toggleTimeEnabled: (layerId, enabled) => {
    set(state => ({
      layers: state.layers.map(layer => 
        layer.id === layerId
          ? {
              ...layer,
              timeEnabled: enabled,
              deckGlLayer: generateDeckGlLayer({
                ...layer,
                timeEnabled: enabled
              })
            }
          : layer
      )
    }));
  },
  
  // Exporter une définition de couche (pour sauvegarde ou partage)
  exportLayerDefinition: (layerId) => {
    const layer = get().layers.find(l => l.id === layerId);
    if (!layer) return null;
    
    // Créer une version serialisable de la couche (sans les fonctions ou objets complexes)
    const exportableDef = {
      id: layer.id,
      title: layer.title,
      type: layer.type,
      style: layer.style,
      metadata: layer.metadata,
      filter: layer.filter,
      timeEnabled: layer.timeEnabled
    };
    
    return exportableDef;
  },
  
  // Importer une définition de couche
  importLayerDefinition: (definition, data) => {
    // Créer une couche à partir de la définition
    const layerConfig = {
      ...definition,
      id: definition.id || nanoid(), // Utiliser un nouvel ID si nécessaire
      data
    };
    
    return get().addLayer(layerConfig);
  }
}));

// Fonctions utilitaires

// Générer un style par défaut selon le type de couche
function getDefaultStyle(layerType) {
  // Couleurs par défaut par type
  const defaultColors = {
    choropleth: [158, 202, 225, 180],  // Bleu clair
    point: [33, 113, 181, 255],        // Bleu
    heatmap: schemeViridis,            // Dégradé viridis
    cluster: schemeBlues,              // Dégradé bleu
    line: [106, 137, 204, 255],        // Bleu moyen
    polygon: [43, 140, 190, 180],      // Bleu-vert
    '3d': [65, 182, 196, 200],         // Turquoise
    hexagon: schemeGreens,             // Dégradé vert
    grid: schemeReds,                  // Dégradé rouge
    contour: schemeViridis,            // Dégradé viridis
    trips: [255, 140, 0, 220],         // Orange
    h3: schemePurples,                 // Dégradé violet
    text: [0, 0, 0, 255],              // Noir
    icon: [67, 67, 67, 255],           // Gris foncé
    screenGrid: schemeReds,            // Dégradé rouge
    terrain: [96, 125, 139, 255]       // Bleu-gris
  };
  
  // Style de base
  const baseStyle = {
    opacity: 0.8,
    color: defaultColors[layerType] || [100, 100, 100, 255],
    colorField: null,
    colorScale: 'sequential',
    colorRange: Array.isArray(defaultColors[layerType]) ? defaultColors[layerType] : schemeBlues,
    reverseColorScale: false,
    radius: 100,
    lineWidth: 1,
    elevationScale: 1,
    extruded: layerType === '3d' || layerType === 'hexagon' || layerType === 'grid',
    classificationMethod: 'quantile',
    cellSize: 1000
  };
  
  // Styles spécifiques selon le type
  switch (layerType) {
    case 'point':
      return {
        ...baseStyle,
        radius: 5,
        radiusUnits: 'pixels',
        radiusMinPixels: 2,
        radiusMaxPixels: 20
      };
      
    case 'choropleth':
      return {
        ...baseStyle,
        strokeColor: [255, 255, 255, 100],
        strokeWidth: 1,
        filled: true,
        stroked: true
      };
      
    case 'heatmap':
      return {
        ...baseStyle,
        radius: 30,
        intensity: 1,
        threshold: 0.05
      };
      
    case 'cluster':
    case 'grid':
      return {
        ...baseStyle,
        cellSize: 1000,
        coverage: 0.8,
        elevationScale: 1,
        extruded: true
      };
      
    case 'hexagon':
      return {
        ...baseStyle,
        cellSize: 1000,
        coverage: 0.9,
        elevationScale: 1,
        extruded: true
      };
      
    case '3d':
      return {
        ...baseStyle,
        extruded: true,
        elevationScale: 1,
        material: {
          ambient: 0.4,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [30, 30, 30]
        }
      };
      
    case 'line':
      return {
        ...baseStyle,
        lineWidth: 2,
        widthUnits: 'pixels',
        widthScale: 1,
        widthMinPixels: 1,
        widthMaxPixels: 10
      };
      
    case 'trips':
      return {
        ...baseStyle,
        trailLength: 10,
        currentTime: 0,
        widthMinPixels: 2,
        rounded: true
      };
      
    default:
      return baseStyle;
  }
}

// Générer une couche deck.gl à partir d'une configuration de couche
function generateDeckGlLayer(layer) {
  if (!layer || !layer.data) {
    return null;
  }
  
  const { id, type, data, style = {} } = layer;
  
  // Propriétés communes
  const commonProps = {
    id: `layer-${id}`,
    pickable: true,
    opacity: style.opacity || 0.8,
    visible: true,
    autoHighlight: style.autoHighlight || false,
    highlightColor: [255, 255, 255, 100]
  };
  
  // Fonction pour obtenir la couleur
  const getColor = (d) => {
    if (!style.colorField) {
      // Couleur fixe
      return style.color || [100, 100, 100, 255];
    }
    
    // Obtenir la valeur du champ
    const value = d.properties ? d.properties[style.colorField] : d[style.colorField];
    
    if (value === undefined || value === null) {
      return style.color || [100, 100, 100, 255];
    }
    
    // Couleur basée sur la valeur (implémentation simplifiée)
    // Dans une implémentation réelle, on utiliserait une échelle de couleur
    const min = 0; // À déterminer dynamiquement
    const max = 100; // À déterminer dynamiquement
    const normalizedValue = (value - min) / (max - min);
    
    // Couleur entre bleu et rouge
    return [
      Math.round(normalizedValue * 255), // R
      50, // G
      Math.round((1 - normalizedValue) * 255), // B
      255  // Alpha
    ];
  };
  
  // Génération de la couche selon le type
  switch (type) {
    case 'point':
      return new ScatterplotLayer({
        ...commonProps,
        data,
        getPosition: d => d.geometry?.coordinates || [0, 0],
        getRadius: style.radius || 5,
        getFillColor: getColor,
        stroked: style.stroked !== false,
        lineWidthMinPixels: 1,
        getLineColor: style.strokeColor || [0, 0, 0, 255],
        getLineWidth: style.lineWidth || 1
      });
    
    case 'choropleth':
    case 'polygon':
      return new GeoJsonLayer({
        ...commonProps,
        data,
        getFillColor: getColor,
        getLineColor: style.strokeColor || [0, 0, 0, 255],
        getLineWidth: style.lineWidth || 1,
        filled: style.filled !== false,
        stroked: style.stroked !== false,
        extruded: style.extruded || false,
        wireframe: style.wireframe || false,
        getElevation: style.heightField ? 
          d => (d.properties ? d.properties[style.heightField] : d[style.heightField]) || 0 : 0,
        elevationScale: style.elevationScale || 1,
        lineWidthUnits: 'pixels'
      });
    
    case 'line':
      return new LineLayer({
        ...commonProps,
        data: Array.isArray(data) ? data : (data.features || []),
        getSourcePosition: d => d.geometry ? d.geometry.coordinates[0] : d.source || [0, 0],
        getTargetPosition: d => d.geometry ? d.geometry.coordinates[1] : d.target || [0, 0],
        getColor: getColor,
        getWidth: style.lineWidth || 1,
        widthUnits: 'pixels'
      });
    
    case 'heatmap':
      return new HeatmapLayer({
        ...commonProps,
        data: Array.isArray(data) ? data : (data.features || []),
        getPosition: d => d.geometry ? d.geometry.coordinates : [d.longitude || 0, d.latitude || 0],
        getWeight: d => 1,
        aggregation: 'SUM',
        radiusPixels: style.radius || 30,
        intensity: style.intensity || 1,
        threshold: style.threshold || 0.05
      });
    
    case 'hexagon':
      return new HexagonLayer({
        ...commonProps,
        data: Array.isArray(data) ? data : (data.features || []),
        getPosition: d => d.geometry ? d.geometry.coordinates : [d.longitude || 0, d.latitude || 0],
        radius: style.cellSize || 1000,
        extruded: style.extruded !== false,
        elevationScale: style.elevationScale || 1,
        coverage: style.coverage || 0.8,
        material: style.material || {
          ambient: 0.4,
          diffuse: 0.6,
          shininess: 32,
          specularColor: [30, 30, 30]
        }
      });
    
    case 'grid':
      return new GridLayer({
        ...commonProps,
        data: Array.isArray(data) ? data : (data.features || []),
        getPosition: d => d.geometry ? d.geometry.coordinates : [d.longitude || 0, d.latitude || 0],
        cellSize: style.cellSize || 1000,
        extruded: style.extruded !== false,
        elevationScale: style.elevationScale || 1,
        coverage: style.coverage || 0.9
      });
    
    case 'text':
      return new TextLayer({
        ...commonProps,
        data: Array.isArray(data) ? data : (data.features || []),
        getPosition: d => d.geometry ? d.geometry.coordinates : [d.longitude || 0, d.latitude || 0],
        getText: d => d.properties ? (d.properties[style.textField] || '') : (d[style.textField] || ''),
        getSize: style.textSize || 12,
        getColor: style.textColor ? style.textColor : getColor,
        getAngle: style.textAngle || 0,
        getTextAnchor: style.textAnchor || 'middle',
        getAlignmentBaseline: style.textBaseline || 'center',
        fontFamily: style.fontFamily || 'Arial',
        fontWeight: style.fontWeight || 'normal'
      });
    
    case 'icon':
      return new IconLayer({
        ...commonProps,
        data: Array.isArray(data) ? data : (data.features || []),
        getPosition: d => d.geometry ? d.geometry.coordinates : [d.longitude || 0, d.latitude || 0],
        getIcon: d => style.getIcon ? style.getIcon(d) : 'marker',
        getSize: style.iconSize || 10,
        getColor: getColor,
        sizeScale: style.sizeScale || 1,
        sizeUnits: 'pixels',
        // Supposer que iconAtlas et iconMapping sont définis ailleurs
        iconAtlas: style.iconAtlas || '',
        iconMapping: style.iconMapping || {}
      });
      
    // Ajoutez d'autres types de couches au besoin
    
    default:
      return new ScatterplotLayer({
        ...commonProps,
        data: Array.isArray(data) ? data : (data.features || []),
        getPosition: d => d.geometry ? d.geometry.coordinates : [d.longitude || 0, d.latitude || 0],
        getRadius: style.radius || 5,
        getFillColor: getColor
      });
  }
}

export default useLayerManager;