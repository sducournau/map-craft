import React, { useState } from 'react';
import { FiMap, FiCheck } from 'react-icons/fi';
import { create } from 'zustand';

// Store pour la gestion des fonds de carte
export const useBasemapStore = create((set) => ({
  // Fond de carte actif
  activeBasemap: 'dark',
  
  // Définir le fond de carte actif
  setActiveBasemap: (id) => set({ activeBasemap: id })
}));

// Catalogue des fonds de carte disponibles
const BASEMAPS = [
  {
    id: 'dark',
    name: 'Carte sombre',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    thumbnail: '/thumbnails/dark-basemap.png',
    description: 'Fond de carte sombre avec détails minimaux'
  },
  {
    id: 'light',
    name: 'Carte claire',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    thumbnail: '/thumbnails/light-basemap.png',
    description: 'Fond de carte clair avec détails minimaux'
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_key',
    thumbnail: '/thumbnails/satellite-basemap.png',
    description: 'Imagerie satellite avec étiquettes'
  },
  {
    id: 'streets',
    name: 'Rues',
    url: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_key',
    thumbnail: '/thumbnails/streets-basemap.png',
    description: 'Carte détaillée des rues et points d\'intérêt'
  },
  {
    id: 'topo',
    name: 'Topographique',
    url: 'https://api.maptiler.com/maps/topo/style.json?key=get_your_own_key',
    thumbnail: '/thumbnails/topo-basemap.png',
    description: 'Carte topographique avec relief'
  },
  {
    id: 'watercolor',
    name: 'Aquarelle',
    url: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_key',
    thumbnail: '/thumbnails/watercolor-basemap.png',
    description: 'Style artistique inspiré de l\'aquarelle'
  }
];

const BasemapSelector = () => {
  const { activeBasemap, setActiveBasemap } = useBasemapStore();
  const [expandedBasemap, setExpandedBasemap] = useState(null);
  
  // Fonction pour obtenir l'URL du fond de carte actif
  const getActiveBasemapUrl = () => {
    const basemap = BASEMAPS.find(b => b.id === activeBasemap);
    return basemap ? basemap.url : BASEMAPS[0].url;
  };
  
  return (
    <div className="basemap-selector">
      <h3 className="font-medium mb-3 flex items-center">
        <FiMap className="mr-2" />
        Fonds de carte
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {BASEMAPS.map(basemap => (
          <div 
            key={basemap.id}
            className={`
              border rounded-md overflow-hidden cursor-pointer transition-all
              ${activeBasemap === basemap.id 
                ? 'border-blue-500 dark:border-blue-400 shadow-md' 
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
              }
            `}
            onClick={() => setActiveBasemap(basemap.id)}
          >
            <div className="relative">
              {/* Vignette (placeholder) */}
              <div 
                className="h-20 bg-slate-200 dark:bg-slate-700"
                style={{
                  backgroundImage: basemap.thumbnail ? `url(${basemap.thumbnail})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Indicateur de sélection */}
              {activeBasemap === basemap.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <FiCheck size={12} />
                </div>
              )}
            </div>
            
            <div className="p-2">
              <h4 className="text-sm font-medium truncate">{basemap.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {basemap.description}
              </p>
            </div>
            
            {/* Bouton d'information */}
            <div 
              className="text-xs text-center pb-1 text-blue-500 dark:text-blue-400 hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedBasemap(expandedBasemap === basemap.id ? null : basemap.id);
              }}
            >
              {expandedBasemap === basemap.id ? 'Moins d\'info' : 'Plus d\'info'}
            </div>
            
            {/* Détails supplémentaires */}
            {expandedBasemap === basemap.id && (
              <div className="p-2 pt-0 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                <p>Source: CartoDB / Maptiler</p>
                <p className="mt-1">Licence: Libre pour usage non commercial</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Options d'affichage</h4>
        <div className="space-y-2">
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="showLabels" 
              className="mr-2"
            />
            <label htmlFor="showLabels" className="text-sm">
              Afficher les étiquettes
            </label>
          </div>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="show3DBuildings" 
              className="mr-2"
            />
            <label htmlFor="show3DBuildings" className="text-sm">
              Bâtiments 3D (si disponibles)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasemapSelector;