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

// Store for advanced layer management
const useLayerManager = create((set, get) => ({
  // Layer state
  layers: [],
  visibleLayers: [],
  activeLayer: null,
  lockedLayers: [],
  layerGroups: [],
  layerOrder: [], // For controlling display order
  
  // Global display options
  globalOpacity: 1.0,
  
  // Get active layers for deck.gl
  get activeLayers() {
    try {
      const layers = get().layers;
      const visibleLayers = get().visibleLayers;
      const layerOrder = get().layerOrder;
      
      // Filter visible layers and sort by defined order
      const activeLayerObjects = layers
        .filter(layer => visibleLayers.includes(layer.id))
        .sort((a, b) => {
          const indexA = layerOrder.indexOf(a.id);
          const indexB = layerOrder.indexOf(b.id);
          return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
        });
      
      // Filter out invalid layers and generate deck.gl layers
      return activeLayerObjects
        .map(layer => layer.deckGlLayer)
        .filter(layer => layer !== null);
    } catch (error) {
      console.error("Error getting active layers:", error);
      return []; // Return empty array on error
    }
  },
  
  // Add a new layer
  addLayer: (layerConfig) => {
    try {
      const id = layerConfig.id || nanoid();
      const defaultStyle = getDefaultStyle(layerConfig.type || guessLayerType(layerConfig.data));
      
      const newLayer = {
        ...layerConfig,
        id,
        style: layerConfig.style || defaultStyle,
        metadata: {
          ...layerConfig.metadata,
          createdAt: Date.now()
        }
      };
      
      // Generate the initial deck.gl layer
      newLayer.deckGlLayer = generateDeckGlLayer(newLayer);
      
      set(state => {
        // Add the layer at the top (beginning) of the display order
        const newLayerOrder = [id, ...state.layerOrder];
        
        return {
          layers: [...state.layers, newLayer],
          visibleLayers: [...state.visibleLayers, id],
          activeLayer: id,
          layerOrder: newLayerOrder
        };
      });
      
      return id;
    } catch (error) {
      console.error("Error adding layer:", error);
      return null;
    }
  },
  
  // Remove a layer
  removeLayer: (layerId) => {
    set(state => ({
      layers: state.layers.filter(layer => layer.id !== layerId),
      visibleLayers: state.visibleLayers.filter(id => id !== layerId),
      activeLayer: state.activeLayer === layerId ? null : state.activeLayer,
      layerOrder: state.layerOrder.filter(id => id !== layerId)
    }));
  },
  
  // Set layers (complete replacement)
  setLayers: (layers) => {
    try {
      const processedLayers = layers.map(layer => ({
        ...layer,
        deckGlLayer: layer.deckGlLayer || generateDeckGlLayer(layer)
      }));
      
      set(state => {
        // Rebuild layer order
        const layerIds = processedLayers.map(layer => layer.id);
        const newLayerOrder = state.layerOrder.filter(id => layerIds.includes(id));
        
        // Add any new layers that aren't in the current order
        const missingLayers = layerIds.filter(id => !newLayerOrder.includes(id));
        newLayerOrder.push(...missingLayers);
        
        return {
          layers: processedLayers,
          layerOrder: newLayerOrder,
          // Keep only visible layers that still exist
          visibleLayers: state.visibleLayers.filter(id => 
            processedLayers.some(layer => layer.id === id)
          )
        };
      });
    } catch (error) {
      console.error("Error setting layers:", error);
    }
  },
  
  // Set the active layer
  setActiveLayer: (layerId) => {
    set({ activeLayer: layerId });
  },
  
  // Set visible layers
  setVisibleLayers: (visibleLayers) => {
    set({ visibleLayers });
  },
  
  // Toggle layer visibility
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
  
  // Update layer style
  updateLayerStyle: (layerId, styleUpdates) => {
    try {
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
          
          // Regenerate the deck.gl layer with the new style
          updatedLayer.deckGlLayer = generateDeckGlLayer(updatedLayer);
          
          return updatedLayer;
        });
        
        return { layers: updatedLayers };
      });
    } catch (error) {
      console.error(`Error updating style for layer ${layerId}:`, error);
    }
  },
  
  // Update layer data
  updateLayerData: (layerId, data) => {
    try {
      set(state => {
        const updatedLayers = state.layers.map(layer => {
          if (layer.id !== layerId) return layer;
          
          const updatedLayer = {
            ...layer,
            data
          };
          
          // Regenerate the deck.gl layer with the new data
          updatedLayer.deckGlLayer = generateDeckGlLayer(updatedLayer);
          
          return updatedLayer;
        });
        
        return { layers: updatedLayers };
      });
    } catch (error) {
      console.error(`Error updating data for layer ${layerId}:`, error);
    }
  },
  
  // Update layer metadata
  updateLayerMetadata: (layerId, metadata) => {
    set(state => ({
      layers: state.layers.map(layer => 
        layer.id === layerId
          ? {
              ...layer,
              ...metadata, // Direct update of top-level properties
              metadata: {
                ...layer.metadata,
                ...metadata
              }
            }
          : layer
      )
    }));
  },
  
  // Apply a filter to a layer
  updateLayerFilter: (layerId, filter) => {
    try {
      set(state => {
        const updatedLayers = state.layers.map(layer => {
          if (layer.id !== layerId) return layer;
          
          const updatedLayer = {
            ...layer,
            filter
          };
          
          // Regenerate the deck.gl layer with the new filter
          updatedLayer.deckGlLayer = generateDeckGlLayer(updatedLayer);
          
          return updatedLayer;
        });
        
        return { layers: updatedLayers };
      });
    } catch (error) {
      console.error(`Error updating filter for layer ${layerId}:`, error);
    }
  },
  
  // Lock/unlock a layer
  lockLayer: (layerId, isLocked) => {
    set(state => ({
      lockedLayers: isLocked
        ? [...state.lockedLayers, layerId]
        : state.lockedLayers.filter(id => id !== layerId)
    }));
  },
  
  // Create a layer group
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
  
  // Update a layer group
  updateLayerGroup: (groupId, updates) => {
    set(state => ({
      layerGroups: state.layerGroups.map(group => 
        group.id === groupId
          ? { ...group, ...updates }
          : group
      )
    }));
  },
  
  // Remove a layer group
  removeLayerGroup: (groupId) => {
    set(state => ({
      layerGroups: state.layerGroups.filter(group => group.id !== groupId)
    }));
  },
  
  // Reorder layers
  reorderLayers: (layerOrder) => {
    set({ layerOrder });
  },
  
  // Move a layer up in the display order (make it more visible)
  moveLayerUp: (layerId) => {
    set(state => {
      const currentOrder = [...state.layerOrder];
      const index = currentOrder.indexOf(layerId);
      
      if (index <= 0) return state; // Already at the top
      
      // Swap with the layer above
      [currentOrder[index], currentOrder[index - 1]] = [currentOrder[index - 1], currentOrder[index]];
      
      return { layerOrder: currentOrder };
    });
  },
  
  // Move a layer down in the display order (make it less visible)
  moveLayerDown: (layerId) => {
    set(state => {
      const currentOrder = [...state.layerOrder];
      const index = currentOrder.indexOf(layerId);
      
      if (index === -1 || index >= currentOrder.length - 1) return state; // Already at the bottom
      
      // Swap with the layer below
      [currentOrder[index], currentOrder[index + 1]] = [currentOrder[index + 1], currentOrder[index]];
      
      return { layerOrder: currentOrder };
    });
  },
  
  // Duplicate a layer
  duplicateLayer: (layerId) => {
    try {
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
      
      // Generate the new deck.gl layer
      duplicatedLayer.deckGlLayer = generateDeckGlLayer(duplicatedLayer);
      
      set(state => {
        // Insert the copy just after the original in the layer order
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
    } catch (error) {
      console.error("Error duplicating layer:", error);
      return null;
    }
  },
  
  // Enable/disable time mode for a layer
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
  
  // Export a layer definition (for saving or sharing)
  exportLayerDefinition: (layerId) => {
    const layer = get().layers.find(l => l.id === layerId);
    if (!layer) return null;
    
    // Create a serializable version of the layer (without functions or complex objects)
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
  
  // Import a layer definition
  importLayerDefinition: (definition, data) => {
    // Create a layer from the definition
    const layerConfig = {
      ...definition,
      id: definition.id || nanoid(), // Use a new ID if needed
      data
    };
    
    return get().addLayer(layerConfig);
  }
}));

// Helper functions

// Generate a default style based on layer type
function getDefaultStyle(layerType) {
  // Default colors by type
  const defaultColors = {
    choropleth: [158, 202, 225, 180],  // Light blue
    point: [33, 113, 181, 255],        // Blue
    heatmap: [
      [255, 255, 204],
      [199, 233, 180],
      [127, 205, 187],
      [65, 182, 196],
      [44, 127, 184],
      [37, 52, 148]
    ],           // Viridis gradient
    cluster: [
      [239, 243, 255],
      [198, 219, 239],
      [158, 202, 225],
      [107, 174, 214],
      [66, 146, 198],
      [33, 113, 181],
      [8, 81, 156],
      [8, 48, 107]
    ],           // Blues gradient
    line: [106, 137, 204, 255],        // Medium blue
    polygon: [43, 140, 190, 180],      // Blue-green
    '3d': [65, 182, 196, 200],         // Turquoise
    hexagon: [
      [237, 248, 251],
      [204, 236, 230],
      [153, 216, 201],
      [102, 194, 164],
      [65, 174, 118],
      [35, 139, 69],
      [0, 88, 36]
    ],         // Greens gradient
    grid: [
      [255, 245, 240],
      [254, 224, 210],
      [252, 187, 161],
      [252, 146, 114],
      [251, 106, 74],
      [239, 59, 44],
      [203, 24, 29],
      [165, 15, 21],
      [103, 0, 13]
    ],            // Reds gradient
    text: [0, 0, 0, 255],              // Black
    icon: [67, 67, 67, 255],           // Dark gray
    terrain: [96, 125, 139, 255]       // Blue-gray
  };
  
  // Base style
  const baseStyle = {
    opacity: 0.8,
    color: Array.isArray(defaultColors[layerType]) && defaultColors[layerType].length <= 4 
      ? defaultColors[layerType] 
      : [100, 100, 100, 255],
    colorField: null,
    colorScale: 'sequential',
    colorRange: Array.isArray(defaultColors[layerType]) && defaultColors[layerType].length > 4 
      ? defaultColors[layerType] 
      : [
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
    radius: 100,
    lineWidth: 1,
    elevationScale: 1,
    extruded: layerType === '3d' || layerType === 'hexagon' || layerType === 'grid',
    classificationMethod: 'quantile',
    cellSize: 1000
  };
  
  // Specific styles by type
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
      
    default:
      return baseStyle;
  }
}

// Generate a deck.gl layer from a layer configuration
function generateDeckGlLayer(layer) {
  if (!layer || !layer.data) {
    console.warn('Invalid layer or missing data', layer?.id);
    return null;
  }
  
  try {
    const { id, type, data, style = {} } = layer;
    
    // Determine effective layer type if not provided
    const effectiveType = type || guessLayerType(data);
    
    // Common properties
    const commonProps = {
      id: `layer-${id}`,
      pickable: true,
      opacity: style.opacity || 0.8,
      visible: true,
      autoHighlight: style.autoHighlight || false,
      highlightColor: [255, 255, 255, 100]
    };
    
    // Function to get color
    const getColor = (d) => {
      if (!style.colorField) {
        // Fixed color
        return style.color || [100, 100, 100, 255];
      }
      
      // Get field value
      const value = d.properties ? d.properties[style.colorField] : d[style.colorField];
      
      if (value === undefined || value === null) {
        return style.color || [100, 100, 100, 255];
      }
      
      // Color based on value (simplified implementation)
      // In a real implementation, you would use a color scale
      const min = 0; // Should be determined dynamically
      const max = 100; // Should be determined dynamically
      const normalizedValue = (value - min) / (max - min);
      
      // Color between blue and red
      return [
        Math.round(normalizedValue * 255), // R
        50, // G
        Math.round((1 - normalizedValue) * 255), // B
        255  // Alpha
      ];
    };
    
    // Generate layer based on type
    switch (effectiveType) {
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
          // Assume that iconAtlas and iconMapping are defined elsewhere
          iconAtlas: style.iconAtlas || 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
          iconMapping: style.iconMapping || {
            marker: {x: 0, y: 0, width: 128, height: 128, mask: true}
          }
        });
      
      // Add other layer types as needed
      
      default:
        return new ScatterplotLayer({
          ...commonProps,
          data: Array.isArray(data) ? data : (data.features || []),
          getPosition: d => d.geometry ? d.geometry.coordinates : [d.longitude || 0, d.latitude || 0],
          getRadius: style.radius || 5,
          getFillColor: getColor
        });
    }
  } catch (error) {
    console.error(`Error generating layer:`, error, layer);
    // Return a fallback empty layer
    return new GeoJsonLayer({
      id: `error-layer-${layer?.id || Date.now()}`,
      data: { type: 'FeatureCollection', features: [] },
      visible: false
    });
  }
}

// Helper function to guess layer type from data
function guessLayerType(data) {
  if (!data) return 'point';
  
  if (data.type === 'FeatureCollection' && Array.isArray(data.features) && data.features.length > 0) {
    const geomType = data.features[0]?.geometry?.type;
    if (geomType) {
      if (geomType.includes('Point')) return 'point';
      if (geomType.includes('Polygon')) return 'choropleth';
      if (geomType.includes('Line')) return 'line';
    }
  }
  
  // For arrays of objects with lat/lng properties
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if ((firstItem.lat !== undefined && firstItem.lng !== undefined) ||
        (firstItem.latitude !== undefined && firstItem.longitude !== undefined)) {
      return 'point';
    }
  }
  
  return 'point'; // Default fallback
}

export default useLayerManager;