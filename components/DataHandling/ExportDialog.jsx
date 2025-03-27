import React, { useState } from 'react';
import { FiX, FiDownload, FiClipboard, FiSave } from 'react-icons/fi';
import useLayerManager from '../../hooks/useLayerManager';

const ExportDialog = ({ onClose }) => {
  const { layers, visibleLayers } = useLayerManager();
  const [exportFormat, setExportFormat] = useState('geojson');
  const [layersToExport, setLayersToExport] = useState([]);
  const [exportName, setExportName] = useState('mapcraft_export');
  const [message, setMessage] = useState(null);

  const toggleLayerExport = (layerId) => {
    setLayersToExport(prev => 
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const selectAllLayers = () => {
    setLayersToExport(layers.map(layer => layer.id));
  };

  const deselectAllLayers = () => {
    setLayersToExport([]);
  };

  const selectVisibleLayers = () => {
    setLayersToExport(visibleLayers);
  };

  const handleExport = () => {
    if (layersToExport.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins une couche à exporter.' });
      return;
    }

    try {
      // Récupérer les données des couches sélectionnées
      const selectedLayers = layers.filter(layer => layersToExport.includes(layer.id));
      
      let exportData;
      if (exportFormat === 'geojson') {
        exportData = {
          type: 'FeatureCollection',
          features: selectedLayers.flatMap(layer => 
            layer.data.features.map(feature => ({
              ...feature,
              properties: {
                ...feature.properties,
                _layer: layer.title || layer.id
              }
            }))
          )
        };
      } else if (exportFormat === 'csv') {
        // Simple CSV export - more sophisticated conversion would be needed in a real app
        const headers = ['geometry_type', 'layer', 'name', 'value', 'longitude', 'latitude'];
        const rows = selectedLayers.flatMap(layer => 
          layer.data.features.map(feature => {
            const coords = feature.geometry.type === 'Point' 
              ? feature.geometry.coordinates 
              : turf.centroid(feature).geometry.coordinates;
            
            return [
              feature.geometry.type,
              layer.title || layer.id,
              feature.properties.name || '',
              feature.properties.value || '',
              coords[0],
              coords[1]
            ].join(',');
          })
        );
        
        exportData = [headers.join(','), ...rows].join('\n');
      }

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob(
        [typeof exportData === 'string' ? exportData : JSON.stringify(exportData)], 
        { type: exportFormat === 'geojson' ? 'application/json' : 'text/csv' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportName}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Exportation réussie !' });
    } catch (error) {
      setMessage({ type: 'error', text: `Erreur lors de l'exportation: ${error.message}` });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium flex items-center">
            <FiDownload className="mr-2" />
            Exporter des données
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FiX />
          </button>
        </div>
        
        <div className="p-4">
          {/* Format d'exportation */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Format d'exportation</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="geojson"
                  checked={exportFormat === 'geojson'}
                  onChange={() => setExportFormat('geojson')}
                  className="mr-2"
                />
                <span>GeoJSON</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="mr-2"
                />
                <span>CSV</span>
              </label>
            </div>
          </div>
          
          {/* Nom du fichier d'exportation */}
          <div className="mb-4">
            <label htmlFor="exportName" className="block text-sm font-medium mb-1">
              Nom du fichier
            </label>
            <input
              type="text"
              id="exportName"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-black dark:text-white"
            />
          </div>
          
          {/* Sélection des couches */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Couches à exporter</label>
              <div className="flex space-x-2">
                <button
                  onClick={selectAllLayers}
                  className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Tout
                </button>
                <button
                  onClick={selectVisibleLayers}
                  className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Visible
                </button>
                <button
                  onClick={deselectAllLayers}
                  className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Aucun
                </button>
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded">
              {layers.length === 0 ? (
                <div className="p-3 text-center text-slate-500 dark:text-slate-400">
                  Aucune couche disponible
                </div>
              ) : (
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {layers.map(layer => (
                    <li key={layer.id} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={layersToExport.includes(layer.id)}
                          onChange={() => toggleLayerExport(layer.id)}
                          className="mr-2"
                        />
                        <span className="mr-1 font-medium">{layer.title || layer.id}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          ({layer.data?.features?.length || 0} objets)
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Message de résultat */}
          {message && (
            <div className={`p-2 mb-4 rounded text-sm ${
              message.type === 'error' 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            }`}>
              {message.text}
            </div>
          )}
          
          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
              disabled={layersToExport.length === 0}
            >
              <FiDownload className="mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;