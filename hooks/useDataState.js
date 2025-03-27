import { create } from 'zustand';
import { nanoid } from 'nanoid/non-secure';
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
import { saveDataset, loadDataset } from '../utils/storage';

const useDataState = create((set, get) => ({
  // Loaded data
  datasets: [],
  selectedDataset: null,
  lastError: null,
  isLoading: false,

  // Visualization state
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

  // Filter state
  filters: [],

  // Set loading state
  setLoading: (isLoading) => {
    set({ isLoading });
  },

  // Set error state
  setError: (error) => {
    console.error("Data state error:", error);
    set({ lastError: error instanceof Error ? error.message : String(error) });
  },

  // Clear error state
  clearError: () => {
    set({ lastError: null });
  },

  // Load data
  loadData: async (dataId) => {
    try {
      set({ isLoading: true });
      
      const data = await loadDataset(dataId);
      
      set(state => ({
        datasets: [...state.datasets, data],
        selectedDataset: data.id,
        lastError: null
      }));
      
      set({ isLoading: false });
      return data.id;
    } catch (error) {
      console.error('Error loading data:', error);
      set({ 
        isLoading: false, 
        lastError: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },

  // Add data
  addData: async (data, name, type = 'geojson') => {
    try {
      set({ isLoading: true });
      
      // Basic validation
      if (!data) {
        throw new Error('No data provided');
      }
      
      // Basic GeoJSON validation
      if (type === 'geojson' && data.type === 'FeatureCollection') {
        if (!Array.isArray(data.features)) {
          throw new Error('Invalid GeoJSON: features must be an array');
        }
      }
      
      const id = nanoid();
      const datasetInfo = {
        id,
        name,
        type,
        data,
        dateAdded: new Date().toISOString()
      };
      
      // Try to save to storage, but don't fail if storage fails
      try {
        await saveDataset(datasetInfo);
      } catch (storageError) {
        console.warn('Storage error, continuing with in-memory only:', storageError);
      }
      
      // Update state regardless of storage success
      set(state => ({
        datasets: [...state.datasets, datasetInfo],
        selectedDataset: id,
        lastError: null,
        isLoading: false
      }));
      
      return id;
    } catch (error) {
      console.error('Error adding data:', error);
      set({ 
        isLoading: false, 
        lastError: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  },

  // Get visualization layers for deck.gl
  getVisualizationLayers: () => {
    try {
      const { selectedDataset, visualizationType, visualizationConfig } = get();
      
      if (!selectedDataset) return [];
      
      const dataset = get().datasets.find(d => d.id === selectedDataset);
      if (!dataset || !dataset.data) return [];
      
      const data = dataset.data;
      
      // Common properties for layers
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
      
      // Generate layers based on visualization type
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
              getFillColor: getColorFromField(data, visualizationConfig),
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
              getFillColor: getColorFromField(data, visualizationConfig),
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
              intensity: visualizationConfig.elevationScale || 1,
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
              getPolygon: d => d.geometry?.coordinates || [],
              getFillColor: getColorFromField(data, visualizationConfig),
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
              getSourcePosition: d => d.geometry?.coordinates?.[0] || [0, 0],
              getTargetPosition: d => d.geometry?.coordinates?.[1] || [0, 0],
              getColor: getColorFromField(data, visualizationConfig),
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
              getColor: getColorFromField(data, visualizationConfig),
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
              getColor: getColorFromField(data, visualizationConfig),
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
          
        case 'trip':
          return [
            new TripsLayer({
              id: 'trip-layer',
              data: visualizationConfig.timeAnimation ? convertToTimeTrips(data) : convertToPointFeatures(data),
              ...commonProps,
              getPath: d => d.path || [],
              getTimestamps: d => d.timestamps || [],
              getColor: getColorFromField(data, visualizationConfig),
              widthMinPixels: 2,
              rounded: true,
              trailLength: visualizationConfig.trail,
              currentTime: visualizationConfig.currentTime
            })
          ];
          
        default:
          // Default fallback to scatterplot
          return [
            new ScatterplotLayer({
              id: 'default-scatterplot-layer',
              data: convertToPointFeatures(data),
              ...commonProps,
              getPosition: getPosition,
              getRadius: visualizationConfig.radius || 100,
              getFillColor: [67, 121, 237, 255]
            })
          ];
      }
    } catch (error) {
      console.error('Error generating visualization layers:', error);
      return []; // Return empty array on error
    }
  },
  
  // Set visualization type
  setVisualizationType: (type) => {
    if (!type) {
      console.warn("Invalid visualization type provided");
      return;
    }
    set({ visualizationType: type });
  },
  
  // Update visualization configuration
  updateVisualizationConfig: (config) => {
    if (!config || typeof config !== 'object') {
      console.warn("Invalid visualization config update");
      return;
    }
    set(state => ({
      visualizationConfig: {
        ...state.visualizationConfig,
        ...config
      }
    }));
  },
  
  // Add a filter
  addFilter: (field, operator, value) => {
    if (!field || !operator) {
      console.warn("Invalid filter: missing field or operator");
      return;
    }
    set(state => ({
      filters: [...state.filters, { field, operator, value }]
    }));
  },
  
  // Remove a filter
  removeFilter: (index) => {
    set(state => ({
      filters: state.filters.filter((_, i) => i !== index)
    }));
  },
  
  // Clear all filters
  clearFilters: () => {
    set({ filters: [] });
  },
  
  // Select a dataset
  selectDataset: (datasetId) => {
    set({ selectedDataset: datasetId });
  },
  
  // Remove a dataset
  removeDataset: (datasetId) => {
    set(state => ({
      datasets: state.datasets.filter(d => d.id !== datasetId),
      selectedDataset: state.selectedDataset === datasetId ? null : state.selectedDataset
    }));
  }
}));

// Helper function to get color based on field and scale
function getColorFromField(data, config) {
  return (d) => {
    if (!config.colorField) {
      // Fixed color
      return config.color || [100, 100, 100, 255];
    }
    
    // Get value from the feature
    let value = 0;
    
    if (d.properties && d.properties[config.colorField] !== undefined) {
      value = d.properties[config.colorField];
    } else if (d[config.colorField] !== undefined) {
      value = d[config.colorField];
    }
    
    if (value === undefined || value === null || isNaN(value)) {
      return config.color || [100, 100, 100, 255];
    }
    
    // Get min/max values from the data
    const { min, max } = getFieldMinMax(config.colorField, data);
    
    // Normalize value to 0-1 range
    const normalizedValue = (value - min) / (max - min) || 0;
    
    // Apply reverse if needed
    const scaledValue = config.reverseColorScale ? 1 - normalizedValue : normalizedValue;
    
    // Get color from the color range
    const colors = config.colorRange || [
      [239, 243, 255],
      [198, 219, 239],
      [158, 202, 225],
      [107, 174, 214],
      [66, 146, 198],
      [33, 113, 181],
      [8, 81, 156],
      [8, 48, 107]
    ];
    
    const colorIndex = Math.min(
      Math.floor(scaledValue * colors.length),
      colors.length - 1
    );
    
    return [...colors[colorIndex], 255];
  };
}

// Utility function to convert various formats to points
function convertToPointFeatures(data) {
  if (!data) return [];
  
  try {
    // If it's already a GeoJSON FeatureCollection
    if (data.type === 'FeatureCollection') {
      // Filter points and convert other geometries to points
      return data.features.map(feature => {
        if (!feature.geometry) {
          // Skip invalid features
          return null;
        }
        
        if (feature.geometry.type === 'Point') {
          return feature;
        } else {
          // Convert other geometries to points (centroid)
          try {
            const centroid = turf.centroid(feature);
            return {
              ...centroid,
              properties: feature.properties
            };
          } catch (error) {
            console.warn("Error converting to centroid:", error);
            return null;
          }
        }
      }).filter(Boolean); // Remove null entries
    }
    
    // If it's an array of objects with lat/lng
    if (Array.isArray(data)) {
      return data.map(item => {
        const coords = [];
        
        // Determine coordinates based on available properties
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
        
        // Skip if no valid coordinates found
        if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
          return null;
        }
        
        // Create a GeoJSON feature
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords
          },
          properties: { ...item }
        };
      }).filter(Boolean); // Remove null entries
    }
  } catch (error) {
    console.error("Error converting to point features:", error);
  }
  
  return [];
}

// Check if data contains polygons
function isPolygon(data) {
  if (!data) return false;
  
  if (data.type === 'FeatureCollection') {
    return data.features.some(feature => 
      feature.geometry &&
      (feature.geometry.type === 'Polygon' || 
       feature.geometry.type === 'MultiPolygon')
    );
  }
  
  return false;
}

// Convert data to polygons
function convertToPolygons(data) {
  if (!data) return [];
  
  try {
    // If it's already a GeoJSON FeatureCollection
    if (data.type === 'FeatureCollection') {
      // Filter to keep only polygons
      return data.features.filter(feature => 
        feature.geometry && 
        (feature.geometry.type === 'Polygon' || 
         feature.geometry.type === 'MultiPolygon')
      );
    }
  } catch (error) {
    console.error("Error converting to polygons:", error);
  }
  
  return [];
}

// Convert data to lines
function convertToLines(data) {
  if (!data) return [];
  
  try {
    // If it's already a GeoJSON FeatureCollection
    if (data.type === 'FeatureCollection') {
      // Filter to keep only lines
      const lineFeatures = data.features.filter(feature => 
        feature.geometry && 
        (feature.geometry.type === 'LineString' || 
         feature.geometry.type === 'MultiLineString')
      );
      
      // For other types, create lines
      const pointFeatures = data.features.filter(feature => 
        feature.geometry && feature.geometry.type === 'Point'
      );
      
      if (pointFeatures.length >= 2) {
        // Create lines between consecutive points
        const lines = [];
        for (let i = 0; i < pointFeatures.length - 1; i++) {
          const start = pointFeatures[i].geometry.coordinates;
          const end = pointFeatures[i + 1].geometry.coordinates;
          
          // Skip if invalid coordinates
          if (!start || !end || start.length < 2 || end.length < 2) {
            continue;
          }
          
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
    
    // For tabular data, try to create lines
    if (Array.isArray(data) && data.length >= 2) {
      // Sort points by time or order field if it exists
      const sortedData = [...data].sort((a, b) => {
        if (a.time && b.time) return a.time - b.time;
        if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
        if (a.order && b.order) return a.order - b.order;
        return 0;
      });
      
      // Create lines between consecutive points
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
        
        // Skip if invalid coordinates
        if (startCoords.some(isNaN) || endCoords.some(isNaN)) {
          continue;
        }
        
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
  } catch (error) {
    console.error("Error converting to lines:", error);
  }
  
  return [];
}

// Convert data for time trips visualization
function convertToTimeTrips(data) {
  if (!data) return [];
  
  try {
    // If it's a GeoJSON, convert lines or points to trips
    if (data.type === 'FeatureCollection') {
      const points = data.features.filter(f => f.geometry && f.geometry.type === 'Point');
      
      if (points.length < 2) return [];
      
      // Sort points by time field
      const sortedPoints = [...points].sort((a, b) => {
        if (a.properties?.time && b.properties?.time) return a.properties.time - b.properties.time;
        if (a.properties?.timestamp && b.properties?.timestamp) return a.properties.timestamp - b.properties.timestamp;
        if (a.properties?.order && b.properties?.order) return a.properties.order - b.properties.order;
        return 0;
      });
      
      // Create a trip
      const path = sortedPoints.map(point => point.geometry.coordinates);
      const timestamps = sortedPoints.map((point, index) => {
        if (point.properties?.time) return point.properties.time;
        if (point.properties?.timestamp) return point.properties.timestamp;
        // Create an arbitrary time sequence if no time data is available
        return index * 10;
      });
      
      return [{
        path,
        timestamps,
        properties: sortedPoints[0].properties || {}
      }];
    }
    
    // For tabular data
    if (Array.isArray(data) && data.length >= 2) {
      // Group by trajectory if a trajectory ID is present
      const trajectoryGroups = {};
      
      data.forEach(point => {
        const trajectoryId = point.trajectoryId || point.trip_id || point.id || 'default';
        
        if (!trajectoryGroups[trajectoryId]) {
          trajectoryGroups[trajectoryId] = [];
        }
        
        trajectoryGroups[trajectoryId].push(point);
      });
      
      // Convert each group to a trajectory
      return Object.values(trajectoryGroups).map(points => {
        // Sort by time
        const sortedPoints = [...points].sort((a, b) => {
          if (a.time && b.time) return a.time - b.time;
          if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
          if (a.order && b.order) return a.order - b.order;
          return 0;
        });
        
        // Skip if not enough points
        if (sortedPoints.length < 2) return null;
        
        // Extract path and timestamps
        const path = sortedPoints.map(point => {
          const lon = point.longitude || point.lng || point.lon || point.x;
          const lat = point.latitude || point.lat || point.y;
          return [lon, lat].filter(coord => !isNaN(coord));
        }).filter(coords => coords.length === 2);
        
        // Skip if not enough valid coordinates
        if (path.length < 2) return null;
        
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
      }).filter(Boolean); // Remove null entries
    }
  } catch (error) {
    console.error("Error converting to time trips:", error);
  }
  
  return [];
}

// Get min/max values for a field
function getFieldMinMax(field, data) {
  let min = Infinity;
  let max = -Infinity;
  
  if (!data || !field) return { min: 0, max: 1 };
  
  try {
    // For GeoJSON feature collections
    if (data.type === 'FeatureCollection' && Array.isArray(data.features)) {
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
    // For arrays of objects
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
  } catch (error) {
    console.error("Error calculating field min/max:", error);
  }
  
  // Default values if no valid data
  if (min === Infinity || max === -Infinity || min === max) {
    return { min: 0, max: 1 };
  }
  
  return { min, max };
}

// Helper functions for deck.gl layers
function getPosition(d) {
  // For GeoJSON features
  if (d.geometry && d.geometry.type === 'Point') {
    return d.geometry.coordinates;
  }
  
  // For tabular data
  return [
    d.longitude || d.lng || d.lon || d.x || 0,
    d.latitude || d.lat || d.y || 0,
    d.elevation || d.altitude || d.alt || d.z || 0
  ];
}

function getRadius(d) {
  try {
    const config = useDataState.getState().visualizationConfig;
    
    if (config.sizeField) {
      let value = 0;
      
      if (d.properties && d.properties[config.sizeField] !== undefined) {
        value = d.properties[config.sizeField];
      } else if (d[config.sizeField] !== undefined) {
        value = d[config.sizeField];
      }
      
      if (isNaN(value)) return config.radius || 5;
      
      // Normalize based on field min/max
      const dataset = useDataState.getState().datasets.find(
        dataset => dataset.id === useDataState.getState().selectedDataset
      );
      
      if (!dataset) return config.radius || 5;
      
      const { min, max } = getFieldMinMax(config.sizeField, dataset.data);
      if (min === max) return config.radius || 5;
      
      const normalizedValue = (value - min) / (max - min);
      return (config.radius || 5) * (0.1 + normalizedValue * 0.9);
    }
  } catch (error) {
    console.error("Error calculating radius:", error);
  }
  
  // Default value
  return useDataState.getState().visualizationConfig.radius || 5;
}

function getElevation(d) {
  try {
    const config = useDataState.getState().visualizationConfig;
    
    if (config.heightField) {
      let value = 0;
      
      if (d.properties && d.properties[config.heightField] !== undefined) {
        value = d.properties[config.heightField];
      } else if (d[config.heightField] !== undefined) {
        value = d[config.heightField];
      }
      
      if (isNaN(value)) return 0;
      return value * (config.elevationScale || 1);
    }
  } catch (error) {
    console.error("Error calculating elevation:", error);
  }
  
  return 0;
}

function getWeight(d) {
  try {
    const config = useDataState.getState().visualizationConfig;
    
    if (config.weightField) {
      if (d.properties && d.properties[config.weightField] !== undefined) {
        const value = Number(d.properties[config.weightField]);
        return isNaN(value) ? 1 : value;
      } else if (d[config.weightField] !== undefined) {
        const value = Number(d[config.weightField]);
        return isNaN(value) ? 1 : value;
      }
    }
  } catch (error) {
    console.error("Error calculating weight:", error);
  }
  
  return 1;
}

function getColorScale() {
  try {
    const config = useDataState.getState().visualizationConfig;
    
    // Different scales based on classification method
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
  } catch (error) {
    console.error("Error getting color scale:", error);
    return 'quantize';
  }
}

export default useDataState;