import React, { useState } from 'react';
import { FiX, FiCpu, FiBarChart2, FiSearch, FiPlus, FiMap } from 'react-icons/fi';
import useLayerManager from '../../hooks/useLayerManager.js';
import * as turf from '@turf/turf';

const SpatialAnalysis = ({ onClose }) => {
  const { layers, addLayer } = useLayerManager();
  const [selectedAnalysis, setSelectedAnalysis] = useState('buffer');
  const [sourceLayer, setSourceLayer] = useState('');
  const [targetLayer, setTargetLayer] = useState('');
  const [bufferDistance, setBufferDistance] = useState(1);
  const [bufferUnit, setBufferUnit] = useState('kilometers');
  const [resultName, setResultName] = useState('Résultat d\'analyse');
  const [status, setStatus] = useState(null);

  // Options d'analyse spatiale
  const analyses = [
    { id: 'buffer', name: 'Zone tampon', icon: <FiPlus /> },
    { id: 'centroid', name: 'Centroïdes', icon: <FiMap /> },
    { id: 'intersection', name: 'Intersection', icon: <FiSearch /> },
    { id: 'union', name: 'Union', icon: <FiPlus /> },
    { id: 'difference', name: 'Différence', icon: <FiSearch /> },
    { id: 'voronoi', name: 'Diagramme de Voronoï', icon: <FiMap /> }
  ];

  // Exécuter l'analyse spatiale
  const runAnalysis = () => {
    try {
      setStatus({ type: 'loading', message: 'Analyse en cours...' });
      
      // Vérifier les paramètres
      if (!sourceLayer) {
        throw new Error('Veuillez sélectionner une couche source');
      }
      
      // Trouver la couche source
      const source = layers.find(l => l.id === sourceLayer);
      if (!source || !source.data) {
        throw new Error('Couche source non trouvée ou invalide');
      }
      
      let result;
      
      // Effectuer l'analyse selon le type sélectionné
      switch (selectedAnalysis) {
        case 'buffer':
          result = {
            type: 'FeatureCollection',
            features: source.data.features.map(feature => 
              turf.buffer(feature, bufferDistance, { units: bufferUnit })
            )
          };
          break;
          
        case 'centroid':
          result = {
            type: 'FeatureCollection',
            features: source.data.features.map(feature => {
              const centroid = turf.centroid(feature);
              centroid.properties = { ...feature.properties };
              return centroid;
            })
          };
          break;
          
        case 'intersection':
          if (!targetLayer) {
            throw new Error('Veuillez sélectionner une couche cible');
          }
          
          const target = layers.find(l => l.id === targetLayer);
          if (!target || !target.data) {
            throw new Error('Couche cible non trouvée ou invalide');
          }
          
          // Calculer l'intersection entre les deux couches
          const sourceFeatures = source.data.features;
          const targetFeatures = target.data.features;
          
          const intersectionFeatures = [];
          
          for (const sourceFeature of sourceFeatures) {
            for (const targetFeature of targetFeatures) {
              try {
                const intersection = turf.intersect(sourceFeature, targetFeature);
                if (intersection) {
                  intersection.properties = {
                    ...sourceFeature.properties,
                    source_name: source.title || source.id,
                    target_name: target.title || target.id
                  };
                  intersectionFeatures.push(intersection);
                }
              } catch (err) {
                console.warn('Erreur lors du calcul d\'intersection:', err);
              }
            }
          }
          
          result = {
            type: 'FeatureCollection',
            features: intersectionFeatures
          };
          break;
          
        case 'union':
          if (!targetLayer) {
            throw new Error('Veuillez sélectionner une couche cible');
          }
          
          const targetForUnion = layers.find(l => l.id === targetLayer);
          if (!targetForUnion || !targetForUnion.data) {
            throw new Error('Couche cible non trouvée ou invalide');
          }
          
          // Union des deux couches
          const combined = {
            type: 'FeatureCollection',
            features: [
              ...source.data.features,
              ...targetForUnion.data.features
            ]
          };
          
          result = turf.union(...combined.features);
          
          // Convertir en FeatureCollection si nécessaire
          if (result.type !== 'FeatureCollection') {
            result = {
              type: 'FeatureCollection',
              features: [result]
            };
          }
          break;
          
        case 'difference':
          if (!targetLayer) {
            throw new Error('Veuillez sélectionner une couche cible');
          }
          
          const targetForDiff = layers.find(l => l.id === targetLayer);
          if (!targetForDiff || !targetForDiff.data) {
            throw new Error('Couche cible non trouvée ou invalide');
          }
          
          // Calculer la différence entre source et cible
          const diffFeatures = [];
          
          for (const sourceFeature of source.data.features) {
            let currentFeature = sourceFeature;
            
            for (const targetFeature of targetForDiff.data.features) {
              try {
                const diff = turf.difference(currentFeature, targetFeature);
                if (diff) {
                  currentFeature = diff;
                }
              } catch (err) {
                console.warn('Erreur lors du calcul de différence:', err);
              }
            }
            
            if (currentFeature) {
              diffFeatures.push(currentFeature);
            }
          }
          
          result = {
            type: 'FeatureCollection',
            features: diffFeatures
          };
          break;
          
        case 'voronoi':
          // Extraire les points (ou centroïdes pour les polygones)
          const points = source.data.features.map(feature => {
            if (feature.geometry.type === 'Point') {
              return feature;
            } else {
              return turf.centroid(feature);
            }
          });
          
          const pointsCollection = {
            type: 'FeatureCollection',
            features: points
          };
          
          // Calculer les limites (bbox)
          const bbox = turf.bbox(pointsCollection);
          
          // Créer le diagramme de Voronoï
          const voronoiPolygons = turf.voronoi(pointsCollection, { bbox });
          
          result = voronoiPolygons;
          break;
          
        default:
          throw new Error(`Type d'analyse non pris en charge: ${selectedAnalysis}`);
      }
      
      // Ajouter la couche de résultat
      if (result && result.features && result.features.length > 0) {
        const layerType = result.features[0].geometry.type.includes('Polygon')
          ? 'choropleth'
          : result.features[0].geometry.type === 'Point'
            ? 'point'
            : 'line';
            
        const newLayerId = addLayer({
          title: resultName,
          type: layerType,
          data: result
        });
        
        setStatus({ 
          type: 'success', 
          message: `Analyse terminée avec succès. ${result.features.length} entités créées.`,
          layerId: newLayerId
        });
      } else {
        setStatus({ 
          type: 'warning', 
          message: 'L\'analyse n\'a produit aucun résultat.' 
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: `Erreur lors de l'analyse: ${error.message}`
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium flex items-center">
            <FiCpu className="mr-2" />
            Analyse spatiale
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <FiX />
          </button>
        </div>
        
        <div className="p-4">
          {/* Type d'analyse */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Type d'analyse</label>
            <div className="grid grid-cols-3 gap-2">
              {analyses.map(analysis => (
                <button
                  key={analysis.id}
                  className={`p-2 border rounded text-sm ${
                    selectedAnalysis === analysis.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600'
                      : 'border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedAnalysis(analysis.id)}
                >
                  <div className="flex flex-col items-center">
                    <span className="mb-1">{analysis.icon}</span>
                    <span>{analysis.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Couche source */}
          <div className="mb-4">
            <label htmlFor="sourceLayer" className="block text-sm font-medium mb-1">
              Couche source
            </label>
            <select
              id="sourceLayer"
              value={sourceLayer}
              onChange={(e) => setSourceLayer(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-black dark:text-white"
            >
              <option value="">Sélectionner une couche</option>
              {layers.map(layer => (
                <option key={layer.id} value={layer.id}>
                  {layer.title || layer.id}
                </option>
              ))}
            </select>
          </div>
          
          {/* Couche cible (pour certaines analyses) */}
          {['intersection', 'union', 'difference'].includes(selectedAnalysis) && (
            <div className="mb-4">
              <label htmlFor="targetLayer" className="block text-sm font-medium mb-1">
                Couche cible
              </label>
              <select
                id="targetLayer"
                value={targetLayer}
                onChange={(e) => setTargetLayer(e.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-black dark:text-white"
              >
                <option value="">Sélectionner une couche</option>
                {layers.filter(l => l.id !== sourceLayer).map(layer => (
                  <option key={layer.id} value={layer.id}>
                    {layer.title || layer.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Paramètres spécifiques à l'analyse */}
          {selectedAnalysis === 'buffer' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Distance de la zone tampon</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={bufferDistance}
                  onChange={(e) => setBufferDistance(Number(e.target.value))}
                  min="0.1"
                  step="0.1"
                  className="flex-1 p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-black dark:text-white"
                />
                <select
                  value={bufferUnit}
                  onChange={(e) => setBufferUnit(e.target.value)}
                  className="p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-black dark:text-white"
                >
                  <option value="kilometers">kilomètres</option>
                  <option value="meters">mètres</option>
                  <option value="miles">miles</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Nom du résultat */}
          <div className="mb-4">
            <label htmlFor="resultName" className="block text-sm font-medium mb-1">
              Nom de la couche résultante
            </label>
            <input
              type="text"
              id="resultName"
              value={resultName}
              onChange={(e) => setResultName(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-black dark:text-white"
            />
          </div>
          
          {/* Statut de l'analyse */}
          {status && (
            <div className={`p-3 mb-4 rounded text-sm ${
              status.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 
              status.type === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
              status.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
              'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
              {status.message}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={runAnalysis}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
              disabled={!sourceLayer || (['intersection', 'union', 'difference'].includes(selectedAnalysis) && !targetLayer)}
            >
              <FiBarChart2 className="mr-2" />
              Exécuter l'analyse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpatialAnalysis;