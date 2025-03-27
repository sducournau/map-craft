import { create } from 'zustand';
import { nanoid } from 'nanoid';
import * as turf from '@turf/turf';
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
  
  // Reste du code inchangé...
  
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
    heatmap: schemeViridis[9],         // Dégradé viridis
    cluster: schemeBlues[9],           // Dégradé bleu
    line: [106, 137, 204, 255],        // Bleu moyen
    polygon: [43, 140, 190, 180],      // Bleu-vert
    '3d': [65, 182, 196, 200],         // Turquoise
    hexagon: schemeGreens[9],          // Dégradé vert
    grid: schemeReds[9],               // Dégradé rouge
    contour: schemeViridis[9],         // Dégradé viridis
    trips: [255, 140, 0, 220],         // Orange
    h3: schemePurples[9],              // Dégradé violet
    text: [0, 0, 0, 255],              // Noir
    icon: [67, 67, 67, 255],           // Gris foncé
    screenGrid: schemeReds[9],         // Dégradé rouge
    terrain: [96, 125, 139, 255]       // Bleu-gris
  };
  
  // Style de base
  const baseStyle = {
    opacity: 0.8,
    color: defaultColors[layerType] || [100, 100, 100, 255],
    colorField: null,
    colorScale: 'sequential',
    colorRange: schemeBlues[9],
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
        colorRange: schemeViridis[9],
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
        extruded: true,
        colorRange: schemeGreens[9]
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
  // Cette fonction devrait utiliser les informations de la couche
  // pour générer l'objet deck.gl correspondant
  
  // Note: Ceci est un squelette, l'implémentation réelle dépendrait 
  // du code de visualisation de l'application
  return {
    id: layer.id,
    type: layer.type,
    data: layer.data,
    style: layer.style,
    // Dans une implémentation réelle, cet objet contiendrait
    // les propriétés complètes d'une couche deck.gl
  };
}

export default useLayerManager;