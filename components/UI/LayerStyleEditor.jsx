import React, { useState, useEffect } from 'react';
import { 
  FiSliders, 
  FiX, 
  FiPieChart, 
  FiCircle, 
  FiSquare, 
  FiGrid, 
  FiHexagon,
  FiMapPin,
  FiBarChart2,
  FiLayers,
  FiType,
  FiList,
  FiFile,
  FiFileText,
  FiCpu,
  FiSettings,
  FiEye
} from 'react-icons/fi';
import { useLayerManager } from '@/hooks/useLayerManager';
import ColorPicker from './Controls/ColorPicker';

const LayerStyleEditor = ({ onClose }) => {
  const { layers, activeLayer, updateLayerStyle, updateLayerMetadata } = useLayerManager();
  const [visualizationConfig, setVisualizationConfig] = useState({});
  const [availableFields, setAvailableFields] = useState([]);
  const [numericFields, setNumericFields] = useState([]);
  const [categoricalFields, setCategoricalFields] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [layerName, setLayerName] = useState('');
  
  // Obtenir la couche active
  const layer = layers.find(l => l.id === activeLayer);
  
  // Charger la configuration de la couche active
  useEffect(() => {
    if (!layer) return;
    
    // Définir le nom de la couche
    setLayerName(layer.title || layer.id);
    
    // Charger la configuration actuelle de style
    setVisualizationConfig(layer.style || {});
    
    // Analyser les champs disponibles dans les données
    if (layer.data) {
      const fields = [];
      const numFields = [];
      const catFields = [];
      
      if (Array.isArray(layer.data)) {
        // Données tabulaires
        if (layer.data.length > 0) {
          const sample = layer.data[0];
          Object.entries(sample).forEach(([key, value]) => {
            fields.push(key);
            
            if (typeof value === 'number' || !isNaN(parseFloat(value))) {
              numFields.push(key);
            } else {
              catFields.push(key);
            }
          });
        }
      } else if (layer.data.type === 'FeatureCollection' && layer.data.features && layer.data.features.length > 0) {
        // GeoJSON
        const sample = layer.data.features[0].properties || {};
        
        Object.entries(sample).forEach(([key, value]) => {
          fields.push(key);
          
          if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            numFields.push(key);
          } else {
            catFields.push(key);
          }
        });
      }
      
      setAvailableFields(fields);
      setNumericFields(numFields);
      setCategoricalFields(catFields);
    }
  }, [layer]);
  
  // Mettre à jour la configuration
  const handleConfigChange = (key, value) => {
    setVisualizationConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Appliquer les changements
  const applyChanges = () => {
    if (!layer) return;
    
    // Mettre à jour le style
    updateLayerStyle(layer.id, visualizationConfig);
    
    // Mettre à jour le nom de la couche
    if (layerName !== layer.title) {
      updateLayerMetadata(layer.id, {
        title: layerName
      });
    }
    
    if (onClose) onClose();
  };
  
  // Types de visualisations disponibles selon le type de données
  const getAvailableVisualizations = () => {
    if (!layer) return [];
    
    // Types de base disponibles pour tous
    const baseVisualizations = [
      { id: layer.type, label: 'Actuel', icon: <FiSliders /> },
    ];
    
    // Différentes visualisations selon le type de couche
    switch (layer.type) {
      case 'point':
        return [
          ...baseVisualizations,
          { id: 'scatterplot', label: 'Points', icon: <FiCircle /> },
          { id: 'heatmap', label: 'Chaleur', icon: <FiSquare /> },
          { id: 'cluster', label: 'Cluster', icon: <FiGrid /> },
          { id: 'hexagon', label: 'Hexbin', icon: <FiHexagon /> },
          { id: 'icon', label: 'Icônes', icon: <FiMapPin /> },
          { id: 'text', label: 'Texte', icon: <FiType /> }
        ];
        
      case 'choropleth':
        return [
          ...baseVisualizations,
          { id: 'choropleth', label: 'Choroplèthe', icon: <FiLayers /> },
          { id: '3d', label: 'Extrusion 3D', icon: <FiBarChart2 /> }
        ];
        
      case 'line':
        return [
          ...baseVisualizations,
          { id: 'line', label: 'Lignes', icon: <FiList /> },
          { id: 'trips', label: 'Trajectoires', icon: <FiFile /> }
        ];
        
      default:
        return baseVisualizations;
    }
  };
  
  if (!layer) {
    return (
      <div className="p-4 text-center text-slate-500 dark:text-slate-400">
        Aucune couche sélectionnée
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-medium flex items-center">
          <FiSettings className="mr-2" />
          Style de couche
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <FiX />
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto p-3">
        {/* Nom de la couche */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nom de la couche</label>
          <input
            type="text"
            value={layerName}
            onChange={(e) => setLayerName(e.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
          />
        </div>
        
        {/* Type de visualisation */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Type de visualisation</h4>
          <div className="grid grid-cols-3 gap-2">
            {getAvailableVisualizations().map(vizType => (
              <button
                key={vizType.id}
                className={`p-2 flex flex-col items-center justify-center rounded ${
                  visualizationConfig.visualizationType === vizType.id
                    ? 'bg-slate-200 dark:bg-slate-600 font-medium'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => handleConfigChange('visualizationType', vizType.id)}
              >
                {vizType.icon}
                <span className="text-xs mt-1">{vizType.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Opacité */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Opacité: {(visualizationConfig.opacity || 0.8).toFixed(2)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={visualizationConfig.opacity || 0.8}
            onChange={(e) => handleConfigChange('opacity', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Transparent</span>
            <span>Opaque</span>
          </div>
        </div>
        
        {/* Couleur */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Couleur</h4>
          
          {/* Champ de couleur */}
          <div className="mb-2">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Variable de couleur
            </label>
            <select
              value={visualizationConfig.colorField || ''}
              onChange={(e) => handleConfigChange('colorField', e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
            >
              <option value="">Couleur unique</option>
              <optgroup label="Variables numériques">
                {numericFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </optgroup>
              <optgroup label="Variables catégorielles">
                {categoricalFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </optgroup>
            </select>
          </div>
          
          {/* Échelle de couleur */}
          {visualizationConfig.colorField && (
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Échelle de couleur
              </label>
              <select
                value={visualizationConfig.colorScale || 'sequential'}
                onChange={(e) => handleConfigChange('colorScale', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
              >
                <option value="sequential">Séquentielle</option>
                <option value="diverging">Divergente</option>
                <option value="categorical">Catégorielle</option>
              </select>
            </div>
          )}
          
          {/* Méthode de classification */}
          {visualizationConfig.colorField && numericFields.includes(visualizationConfig.colorField) && (
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Classification
              </label>
              <select
                value={visualizationConfig.classificationMethod || 'quantile'}
                onChange={(e) => handleConfigChange('classificationMethod', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
              >
                <option value="quantile">Quantiles</option>
                <option value="equal">Intervalles égaux</option>
                <option value="jenks">Natural Breaks (Jenks)</option>
              </select>
            </div>
          )}
          
          <div className="mb-2">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              {visualizationConfig.colorField ? 'Palette de couleurs' : 'Couleur'}
            </label>
            <ColorPicker
              initialValue={visualizationConfig.color}
              onChange={(color) => handleConfigChange('color', color)}
            />
          </div>
          
          {/* Inverser l'échelle */}
          {visualizationConfig.colorField && (
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="reverseColorScale"
                checked={visualizationConfig.reverseColorScale || false}
                onChange={(e) => handleConfigChange('reverseColorScale', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="reverseColorScale" className="text-xs text-slate-500 dark:text-slate-400">
                Inverser l'échelle de couleurs
              </label>
            </div>
          )}
        </div>
        
        {/* Taille */}
        {['point', 'scatterplot', 'icon', 'text'].includes(layer.type) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Taille</h4>
            
            {/* Champ de taille */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Variable de taille
              </label>
              <select
                value={visualizationConfig.sizeField || ''}
                onChange={(e) => handleConfigChange('sizeField', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
              >
                <option value="">Taille fixe</option>
                {numericFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
            
            {/* Taille des symboles */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                {visualizationConfig.sizeField ? 'Taille maximale' : 'Taille'}: {visualizationConfig.radius || 5}
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={visualizationConfig.radius || 5}
                onChange={(e) => handleConfigChange('radius', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            {visualizationConfig.sizeField && (
              <div className="mb-2">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Facteur d'échelle: {visualizationConfig.sizeScale || 1}
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={visualizationConfig.sizeScale || 1}
                  onChange={(e) => handleConfigChange('sizeScale', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Extrusion 3D */}
        {['3d', 'hexagon', 'grid'].includes(layer.type) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Élévation 3D</h4>
            
            {/* Champ d'élévation */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Variable d'élévation
              </label>
              <select
                value={visualizationConfig.heightField || ''}
                onChange={(e) => handleConfigChange('heightField', e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
              >
                <option value="">Élévation fixe</option>
                {numericFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
            
            {/* Échelle d'élévation */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Échelle d'élévation: {visualizationConfig.elevationScale || 1}
              </label>
              <input
                type="range"
                min={0.1}
                max={10}
                step={0.1}
                value={visualizationConfig.elevationScale || 1}
                onChange={(e) => handleConfigChange('elevationScale', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            {/* Extrusion */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="extruded"
                checked={visualizationConfig.extruded !== false}
                onChange={(e) => handleConfigChange('extruded', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="extruded" className="text-xs text-slate-500 dark:text-slate-400">
                Activer l'extrusion 3D
              </label>
            </div>
          </div>
        )}
        
        {/* Agrégation */}
        {['cluster', 'hexagon', 'grid'].includes(layer.type) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Agrégation</h4>
            
            {/* Taille des cellules */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Taille des cellules (m): {visualizationConfig.cellSize || 1000}
              </label>
              <input
                type="range"
                min={100}
                max={10000}
                step={100}
                value={visualizationConfig.cellSize || 1000}
                onChange={(e) => handleConfigChange('cellSize', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            {/* Couverture */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Couverture: {visualizationConfig.coverage || 0.8}
              </label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={visualizationConfig.coverage || 0.8}
                onChange={(e) => handleConfigChange('coverage', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
        
        {/* Options de heatmap */}
        {layer.type === 'heatmap' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Options de carte de chaleur</h4>
            
            {/* Rayon */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Rayon (pixels): {visualizationConfig.radius || 30}
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={visualizationConfig.radius || 30}
                onChange={(e) => handleConfigChange('radius', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
            
            {/* Intensité */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Intensité: {visualizationConfig.intensity || 1}
              </label>
              <input
                type="range"
                min={0.1}
                max={5}
                step={0.1}
                value={visualizationConfig.intensity || 1}
                onChange={(e) => handleConfigChange('intensity', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
        
        {/* Options de ligne */}
        {layer.type === 'line' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Options de ligne</h4>
            
            {/* Largeur de ligne */}
            <div className="mb-2">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Largeur (pixels): {visualizationConfig.lineWidth || 1}
              </label>
              <input
                type="range"
                min={1}
                max={20}
                value={visualizationConfig.lineWidth || 1}
                onChange={(e) => handleConfigChange('lineWidth', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
        
        {/* Contour et bordure */}
        {['choropleth', 'polygon'].includes(layer.type) && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Contour</h4>
            
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="stroked"
                checked={visualizationConfig.stroked !== false}
                onChange={(e) => handleConfigChange('stroked', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="stroked" className="text-xs text-slate-500 dark:text-slate-400">
                Afficher les contours
              </label>
            </div>
            
            {visualizationConfig.stroked !== false && (
              <div className="mb-2">
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Largeur du contour: {visualizationConfig.lineWidth || 1}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={visualizationConfig.lineWidth || 1}
                  onChange={(e) => handleConfigChange('lineWidth', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Animation temporelle */}
        {/* Infobulle et étiquettes */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Infobulle</h4>
          
          {/* Champs à afficher dans l'infobulle */}
          <div className="mb-2">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
              Champs à afficher
            </label>
            <select
              multiple
              value={visualizationConfig.tooltipFields || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                handleConfigChange('tooltipFields', selected);
              }}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 h-24"
            >
              {availableFields.map(field => (
                <option key={field} value={field}>{field}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maintenez Ctrl/Cmd pour sélectionner plusieurs champs
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions en bas */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex justify-between">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="py-2 px-3 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center"
          >
            <FiEye className="mr-1.5" />
            {previewMode ? 'Éditer' : 'Aperçu'}
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            
            <button
              onClick={applyChanges}
              className="py-2 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayerStyleEditor;