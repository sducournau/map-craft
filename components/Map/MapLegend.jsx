import React, { useState, useEffect } from 'react';
import useLayerManager from '@/hooks/useLayerManager';

const MapLegend = () => {
  const { 
    layers, 
    visibleLayers, 
    toggleLayerVisibility,
    moveLayerUp,
    moveLayerDown
  } = useLayerManager();
  
  const [collapsed, setCollapsed] = useState(false);
  const [legendItems, setLegendItems] = useState([]);
  
  useEffect(() => {
    // Initialize Materialize components
    if (typeof window !== 'undefined') {
      const M = require('materialize-css');
      M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
    }
    
    // Create legend items from visible layers
    const visibleLayerObjects = layers.filter(layer => visibleLayers.includes(layer.id));
    setLegendItems(visibleLayerObjects);
  }, [layers, visibleLayers]);
  
  // If no visible layers, don't show the legend
  if (legendItems.length === 0) {
    return null;
  }
  
  return (
    <div className={`map-legend ${collapsed ? 'collapsed' : ''}`}>
      <div className="legend-header" onClick={() => setCollapsed(!collapsed)}>
        <h6 className="legend-title">Légende</h6>
        <button className="btn-flat legend-toggle">
          <i className="material-icons">
            {collapsed ? 'expand_more' : 'expand_less'}
          </i>
        </button>
      </div>
      
      {!collapsed && (
        <div className="legend-content">
          {legendItems.map(item => (
            <div key={item.id} className="legend-item">
              <div className="legend-item-header">
                <div className="legend-symbol">
                  {renderLayerSymbol(item.type, item.style)}
                </div>
                <span className="legend-label truncate">{item.title || item.id}</span>
                
                <div className="legend-actions">
                  <button 
                    className="btn-flat btn-small transparent tooltipped"
                    data-position="left"
                    data-tooltip={visibleLayers.includes(item.id) ? "Masquer" : "Afficher"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(item.id);
                    }}
                  >
                    <i className="material-icons tiny">
                      {visibleLayers.includes(item.id) ? 'visibility' : 'visibility_off'}
                    </i>
                  </button>
                </div>
              </div>
              
              {renderLegendDetails(item)}
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .map-legend {
          position: absolute;
          bottom: 20px;
          left: 20px;
          width: 250px;
          max-height: 50vh;
          background-color: white;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          z-index: 10;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .map-legend.collapsed {
          max-height: 40px;
        }
        
        .legend-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background-color: #f5f5f5;
          cursor: pointer;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .legend-title {
          margin: 0;
          font-size: 14px;
        }
        
        .legend-toggle {
          padding: 0;
          margin: 0;
        }
        
        .legend-content {
          max-height: calc(50vh - 40px);
          overflow-y: auto;
          padding: 8px;
        }
        
        .legend-item {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .legend-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .legend-item-header {
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        
        .legend-symbol {
          width: 20px;
          height: 20px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .legend-label {
          flex-grow: 1;
          font-size: 13px;
          font-weight: 500;
          max-width: 170px;
        }
        
        .legend-actions {
          display: flex;
        }
        
        .legend-color-scale {
          height: 8px;
          border-radius: 4px;
          margin: 5px 0;
          overflow: hidden;
        }
        
        .legend-scale-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #757575;
        }
      `}</style>
    </div>
  );
};

// Helper function to render an appropriate symbol for the layer type
function renderLayerSymbol(type, style) {
  switch (type) {
    case 'point':
      return (
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: rgbToHex(style?.color || [33, 113, 181]),
          }}
        ></div>
      );
      
    case 'choropleth':
      return (
        <div
          style={{
            width: '12px',
            height: '12px',
            backgroundColor: rgbToHex(style?.color || [158, 202, 225]),
            border: style?.stroked ? '1px solid #000' : 'none',
          }}
        ></div>
      );
      
    case 'heatmap':
      return (
        <div
          style={{
            width: '16px',
            height: '8px',
            background: 'linear-gradient(to right, blue, purple, red)',
            borderRadius: '2px',
          }}
        ></div>
      );
      
    case 'line':
      return (
        <div
          style={{
            width: '16px',
            height: '2px',
            backgroundColor: rgbToHex(style?.color || [106, 137, 204]),
            marginTop: '8px',
          }}
        ></div>
      );
      
    case '3d':
      return (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: rgbToHex(style?.color || [65, 182, 196]),
              position: 'absolute',
              top: '2px',
              left: '2px',
            }}
          ></div>
          <div
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: rgbToHex(style?.color || [65, 182, 196], 0.7),
              position: 'absolute',
              top: '0',
              left: '0',
            }}
          ></div>
        </div>
      );
      
    default:
      return (
        <i className="material-icons tiny">layers</i>
      );
  }
}

// Helper function to render details specific to the layer type
function renderLegendDetails(layer) {
  const { type, style } = layer;
  
  // Show color scale for layers with a color field
  if (style && style.colorField) {
    const startColor = style.colorRange ? 
      rgbToHex(style.colorRange[0]) : 
      '#f5f5f5';
      
    const endColor = style.colorRange ? 
      rgbToHex(style.colorRange[style.colorRange.length - 1]) : 
      '#0d47a1';
    
    return (
      <div className="legend-details">
        <div 
          className="legend-color-scale"
          style={{
            background: `linear-gradient(to right, ${startColor}, ${endColor})`,
          }}
        ></div>
        <div className="legend-scale-labels">
          <span>Min</span>
          <span>{style.colorField}</span>
          <span>Max</span>
        </div>
      </div>
    );
  }
  
  // For heatmaps
  if (type === 'heatmap') {
    return (
      <div className="legend-details">
        <div 
          className="legend-color-scale"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,255,0.5), rgba(128,0,128,0.8), rgba(255,0,0,1))',
          }}
        ></div>
        <div className="legend-scale-labels">
          <span>Faible</span>
          <span>Densité</span>
          <span>Élevée</span>
        </div>
      </div>
    );
  }
  
  // For size-based visualizations
  if (style && style.sizeField) {
    return (
      <div className="legend-details">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', margin: '5px 0' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: rgbToHex(style.color || [33, 113, 181]),
            }}
          ></div>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: rgbToHex(style.color || [33, 113, 181]),
            }}
          ></div>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: rgbToHex(style.color || [33, 113, 181]),
            }}
          ></div>
        </div>
        <div className="legend-scale-labels">
          <span>Petit</span>
          <span>{style.sizeField}</span>
          <span>Grand</span>
        </div>
      </div>
    );
  }
  
  return null;
}

// Helper function to convert RGB array to hex color
function rgbToHex(rgb, opacity = 1) {
  if (!rgb || !Array.isArray(rgb)) return '#000000';
  
  const r = rgb[0] || 0;
  const g = rgb[1] || 0;
  const b = rgb[2] || 0;
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default MapLegend;