import React, { useState, useEffect } from 'react';
import { 
  FiMinimize2, 
  FiMaximize2, 
  FiXCircle, 
  FiEye, 
  FiEyeOff, 
  FiLayers,
  FiSettings,
  FiMove
} from 'react-icons/fi';
import { useLayerManager } from '@/hooks/useLayerManager';

const MapLegend = () => {
  const { 
    layers, 
    visibleLayers, 
    layerOrder,
    toggleLayerVisibility,
    setActiveLayer,
    moveLayerUp,
    moveLayerDown
  } = useLayerManager();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [legendItems, setLegendItems] = useState([]);
  const [draggedLayer, setDraggedLayer] = useState(null);
  
  // Créer la liste des couches selon l'ordre défini
  useEffect(() => {
    // Trier les couches selon layerOrder
    const orderedLayers = [];
    
    // D'abord, ajouter les couches dans l'ordre défini
    layerOrder.forEach(layerId => {
      const layer = layers.find(l => l.id === layerId);
      if (layer) {
        orderedLayers.push(layer);
      }
    });
    
    // Ajouter les couches qui ne sont pas dans layerOrder
    layers.forEach(layer => {
      if (!layerOrder.includes(layer.id)) {
        orderedLayers.push(layer);
      }
    });
    
    // Générer les items de légende
    const items = orderedLayers.map(layer => ({
      id: layer.id,
      title: layer.title || layer.id,
      type: layer.type,
      style: layer.style,
      visible: visibleLayers.includes(layer.id)
    }));
    
    setLegendItems(items);
  }, [layers, visibleLayers, layerOrder]);
  
  // Gestion du glisser-déposer
  const handleDragStart = (event, layerId) => {
    setDraggedLayer(layerId);
    event.dataTransfer.setData('text/plain', layerId);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (event, targetId) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (event, targetId) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    
    if (sourceId === targetId) return;
    
    // Réordonner les couches
    const newOrder = [...layerOrder];
    const sourceIndex = newOrder.indexOf(sourceId);
    const targetIndex = newOrder.indexOf(targetId);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, sourceId);
      
      // Dans une application réelle, mettre à jour l'ordre des couches
      console.log('Nouvel ordre:', newOrder);
    }
    
    setDraggedLayer(null);
  };
  
  const handleDragEnd = () => {
    setDraggedLayer(null);
  };
  
  // Convertir un tableau RGB en chaine CSS
  const rgbToString = (rgb, opacity = 1) => {
    if (!rgb || !Array.isArray(rgb)) return 'rgba(0, 0, 0, 1)';
    
    const r = rgb[0] || 0;
    const g = rgb[1] || 0;
    const b = rgb[2] || 0;
    const a = rgb[3] !== undefined ? rgb[3] / 255 : opacity;
    
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };
  
  // Générer un symbole pour le type de couche
  const getLayerIcon = (type, style) => {
    switch (type) {
      case 'point':
        return (
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: style?.color ? rgbToString(style.color) : '#2196F3' }}
          ></div>
        );
      case 'choropleth':
        return (
          <div 
            className="w-4 h-3"
            style={{ backgroundColor: style?.color ? rgbToString(style.color) : '#4CAF50' }}
          ></div>
        );
      case 'heatmap':
        return (
          <div className="w-4 h-3 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500"></div>
        );
      case 'line':
        return (
          <div className="w-4 h-0.5" style={{ 
            backgroundColor: style?.color ? rgbToString(style.color) : '#FF9800',
            height: `${style?.lineWidth || 2}px`
          }}></div>
        );
      case '3d':
        return (
          <div className="relative">
            <div 
              className="w-3 h-3 absolute top-1 left-0.5"
              style={{ backgroundColor: style?.color ? rgbToString(style.color, 0.6) : 'rgba(33, 150, 243, 0.6)' }}
            ></div>
            <div 
              className="w-3 h-3 absolute top-0 left-0"
              style={{ backgroundColor: style?.color ? rgbToString(style.color) : '#2196F3' }}
            ></div>
          </div>
        );
      case 'cluster':
      case 'hexagon':
      case 'grid':
        return (
          <div className="w-4 h-3 flex">
            <div className="w-1 h-3" style={{ backgroundColor: style?.colorRange ? rgbToString(style.colorRange[0]) : '#C5CAE9' }}></div>
            <div className="w-1 h-3" style={{ backgroundColor: style?.colorRange ? rgbToString(style.colorRange[2]) : '#7986CB' }}></div>
            <div className="w-1 h-3" style={{ backgroundColor: style?.colorRange ? rgbToString(style.colorRange[4]) : '#3F51B5' }}></div>
            <div className="w-1 h-3" style={{ backgroundColor: style?.colorRange ? rgbToString(style.colorRange[6]) : '#303F9F' }}></div>
          </div>
        );
      default:
        return <FiLayers className="text-slate-500" />;
    }
  };
  
  // Générer un gradient coloré pour les couches avec échelle de couleurs
  const getColorScale = (layer) => {
    if (!layer.style?.colorField || !layer.style?.colorRange) return null;
    
    return (
      <div className="mt-1.5 mb-0.5">
        <div 
          className="h-1.5 rounded-sm"
          style={{
            background: `linear-gradient(to right, ${
              layer.style.colorRange.map(color => rgbToString(color)).join(', ')
            })`
          }}
        ></div>
        <div className="flex justify-between text-[8px] text-slate-500 dark:text-slate-400 mt-0.5">
          <span>Min</span>
          <span>{layer.style.colorField}</span>
          <span>Max</span>
        </div>
      </div>
    );
  };
  
  // Générer une légende pour les couches avec symboles proportionnels
  const getSizeScale = (layer) => {
    if (!layer.style?.sizeField) return null;
    
    return (
      <div className="mt-1.5 mb-0.5 flex items-end space-x-1">
        <div 
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: rgbToString(layer.style?.color || [0, 0, 0]) }}
        ></div>
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: rgbToString(layer.style?.color || [0, 0, 0]) }}
        ></div>
        <div 
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: rgbToString(layer.style?.color || [0, 0, 0]) }}
        ></div>
        <div className="text-[8px] text-slate-500 dark:text-slate-400 ml-1">
          {layer.style.sizeField}
        </div>
      </div>
    );
  };
  
  if (legendItems.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={`absolute right-4 bottom-20 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-10 h-10 overflow-hidden' : 'max-w-xs w-64'
      }`}
    >
      <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-slate-700">
        {!isCollapsed && <h3 className="text-sm font-medium">Légende</h3>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ml-auto"
          aria-label={isCollapsed ? 'Développer' : 'Réduire'}
        >
          {isCollapsed ? <FiMaximize2 /> : <FiMinimize2 />}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="p-2 max-h-72 overflow-y-auto">
          {legendItems.length === 0 ? (
            <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">
              Aucune couche visible
            </div>
          ) : (
            <div className="space-y-1">
              {legendItems.map((item) => (
                <div 
                  key={item.id}
                  className={`p-1.5 rounded border ${
                    draggedLayer === item.id
                      ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-grow min-w-0">
                      <div className="flex-shrink-0">
                        {getLayerIcon(item.type, item.style)}
                      </div>
                      <div className="truncate text-sm font-medium">
                        {item.title}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        onClick={() => toggleLayerVisibility(item.id)}
                        aria-label={item.visible ? 'Masquer la couche' : 'Afficher la couche'}
                      >
                        {item.visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                      </button>
                      
                      <button
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        onClick={() => setActiveLayer(item.id)}
                        aria-label="Éditer la couche"
                      >
                        <FiSettings size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Montrer les détails de style seulement pour les couches visibles */}
                  {item.visible && (
                    <div className="mt-1 ml-5 text-xs">
                      {getColorScale(item)}
                      {getSizeScale(item)}
                      
                      {/* Actions de réorganisation */}
                      <div className="flex justify-end mt-1 space-x-1">
                        <button
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          onClick={() => moveLayerUp(item.id)}
                          aria-label="Monter la couche"
                        >
                          <span className="transform rotate-90 inline-block">↑</span>
                        </button>
                        
                        <button
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          onClick={() => moveLayerDown(item.id)}
                          aria-label="Descendre la couche"
                        >
                          <span className="transform rotate-90 inline-block">↓</span>
                        </button>
                        
                        <button
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          aria-label="Glisser pour réorganiser"
                        >
                          <FiMove size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapLegend;