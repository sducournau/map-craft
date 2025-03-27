import React, { useState, useEffect } from 'react';
import { FiMenu, FiX, FiLayers, FiMap, FiDatabase, FiSettings, FiEye, FiEyeOff, FiEdit2, FiTrash2, FiMoreVertical, FiArrowUp, FiArrowDown, FiSave, FiUpload, FiDownload, FiSearch, FiHelpCircle, FiPlus, FiMinus, FiRefreshCw, FiChevronRight, FiCompass, FiCpu, FiZoomIn, FiZoomOut } from 'react-icons/fi';

// Mock data for demonstration
const mockLayers = [
  { id: 'layer1', title: 'Points d\'intérêt', type: 'point', visible: true },
  { id: 'layer2', title: 'Zones urbaines', type: 'choropleth', visible: true },
  { id: 'layer3', title: 'Routes principales', type: 'line', visible: false },
  { id: 'layer4', title: 'Densité de population', type: 'heatmap', visible: true },
];

const basemaps = [
  { id: 'light', name: 'Light', active: true, color: '#ffffff' },
  { id: 'dark', name: 'Dark', active: false, color: '#222222' },
  { id: 'satellite', name: 'Satellite', active: false, color: '#1a3c5e' },
  { id: 'streets', name: 'Streets', active: false, color: '#f8f8f8' },
  { id: 'terrain', name: 'Terrain', active: false, color: '#e2efd7' },
  { id: 'minimal', name: 'Minimal', active: false, color: '#fafafa' }
];

const MapApp = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('layers');
  const [layers, setLayers] = useState(mockLayers);
  const [activeLayer, setActiveLayer] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [currentLayerId, setCurrentLayerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleLayerClick = (layerId) => {
    setActiveLayer(layerId);
  };
  
  const toggleLayerVisibility = (layerId) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };
  
  const handleMenuOpen = (e, layerId) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ top: e.clientY, left: e.clientX });
    setCurrentLayerId(layerId);
  };
  
  const handleMenuClose = () => {
    setMenuPosition(null);
    setCurrentLayerId(null);
  };
  
  const handleLayerAction = (action) => {
    handleMenuClose();
    
    switch(action) {
      case 'delete':
        setLayers(layers.filter(layer => layer.id !== currentLayerId));
        if (activeLayer === currentLayerId) {
          setActiveLayer(null);
        }
        break;
      case 'moveUp':
        const moveUpIndex = layers.findIndex(layer => layer.id === currentLayerId);
        if (moveUpIndex > 0) {
          const newLayers = [...layers];
          [newLayers[moveUpIndex - 1], newLayers[moveUpIndex]] = 
            [newLayers[moveUpIndex], newLayers[moveUpIndex - 1]];
          setLayers(newLayers);
        }
        break;
      case 'moveDown':
        const moveDownIndex = layers.findIndex(layer => layer.id === currentLayerId);
        if (moveDownIndex < layers.length - 1) {
          const newLayers = [...layers];
          [newLayers[moveDownIndex], newLayers[moveDownIndex + 1]] = 
            [newLayers[moveDownIndex + 1], newLayers[moveDownIndex]];
          setLayers(newLayers);
        }
        break;
      default:
        break;
    }
  };
  
  const filteredLayers = searchQuery 
    ? layers.filter(layer => 
        layer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : layers;
  
  const getLayerTypeIcon = (type) => {
    switch(type) {
      case 'point':
        return '●';
      case 'choropleth':
        return '▢';
      case 'line':
        return '―';
      case 'heatmap':
        return '◉';
      default:
        return '■';
    }
  };
  
  useEffect(() => {
    // Handle click outside of menu to close it
    const handleClickOutside = (event) => {
      if (menuPosition && !event.target.closest('.layer-menu')) {
        handleMenuClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuPosition]);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Overlay when drawer is open on mobile */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-30 z-20" onClick={toggleDrawer}></div>
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed md:relative inset-y-0 left-0 z-30 w-72 bg-white transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'
        } shadow-sm`}
      >
        {/* Drawer Header */}
        <div className={`flex items-center ${drawerOpen ? 'justify-between' : 'justify-center'} p-4 bg-white`}>
          {drawerOpen && <h1 className="text-xl font-semibold text-black">MapCraft</h1>}
          <button onClick={toggleDrawer} className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${!drawerOpen && 'rotate-180'}`}>
            {drawerOpen ? <FiX className="w-5 h-5 text-gray-700" /> : <FiMenu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
        
        {/* Tabs */}
        <div className={`flex ${drawerOpen ? 'flex-row' : 'flex-col'} mt-2`}>
          <button 
            className={`${drawerOpen ? 'flex-1 py-3' : 'p-3'} flex flex-col items-center ${activeTab === 'layers' ? 'text-black' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('layers')}
          >
            <FiLayers className="w-5 h-5" />
            {drawerOpen && <span className="mt-1 text-xs">Couches</span>}
          </button>
          <button 
            className={`${drawerOpen ? 'flex-1 py-3' : 'p-3'} flex flex-col items-center ${activeTab === 'basemaps' ? 'text-black' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('basemaps')}
          >
            <FiMap className="w-5 h-5" />
            {drawerOpen && <span className="mt-1 text-xs">Fonds</span>}
          </button>
          <button 
            className={`${drawerOpen ? 'flex-1 py-3' : 'p-3'} flex flex-col items-center ${activeTab === 'data' ? 'text-black' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('data')}
          >
            <FiDatabase className="w-5 h-5" />
            {drawerOpen && <span className="mt-1 text-xs">Données</span>}
          </button>
          <button 
            className={`${drawerOpen ? 'flex-1 py-3' : 'p-3'} flex flex-col items-center ${activeTab === 'settings' ? 'text-black' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings className="w-5 h-5" />
            {drawerOpen && <span className="mt-1 text-xs">Options</span>}
          </button>
        </div>
        
        {/* Tab Content - only shown when drawer is open */}
        {drawerOpen && (
          <div className="overflow-y-auto mt-2" style={{ height: 'calc(100vh - 136px)' }}>
            {/* Layers Tab */}
            {activeTab === 'layers' && (
              <div className="px-4 py-2">
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher une couche..."
                      className="w-full p-2 pl-9 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  </div>
                </div>
                
                {/* Layers List */}
                {filteredLayers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune couche trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-2 mb-4">
                    {filteredLayers.map((layer) => (
                      <div 
                        key={layer.id}
                        className={`flex items-center justify-between p-3 ${
                          activeLayer === layer.id ? 'bg-gray-50' : 'bg-white'
                        } rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group`}
                        onClick={() => handleLayerClick(layer.id)}
                      >
                        <div className="flex items-center">
                          <span className="text-xl mr-3 opacity-80" style={{ color: '#000' }}>
                            {getLayerTypeIcon(layer.type)}
                          </span>
                          <div>
                            <div className="font-medium text-black text-sm">{layer.title}</div>
                            <div className="text-xs text-gray-500 capitalize">{layer.type}</div>
                          </div>
                        </div>
                        <div className="flex opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerVisibility(layer.id);
                            }}
                          >
                            {layer.visible ? 
                              <FiEye className="w-4 h-4 text-black" /> : 
                              <FiEyeOff className="w-4 h-4 text-gray-400" />
                            }
                          </button>
                          <button 
                            className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
                            onClick={(e) => handleMenuOpen(e, layer.id)}
                          >
                            <FiMoreVertical className="w-4 h-4 text-black" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Layer Button */}
                <button 
                  className="w-full py-2.5 text-white bg-black rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                  onClick={() => {}}
                >
                  <FiPlus className="w-4 h-4 mr-2" />
                  <span className="text-sm">Ajouter une couche</span>
                </button>
              </div>
            )}
            
            {/* Basemaps Tab */}
            {activeTab === 'basemaps' && (
              <div className="px-4 py-2">
                <h3 className="mb-4 text-sm font-medium text-black">Fonds de carte</h3>
                <div className="grid grid-cols-2 gap-3">
                  {basemaps.map((basemap) => (
                    <div 
                      key={basemap.id}
                      className={`rounded-lg overflow-hidden cursor-pointer ${
                        basemap.active ? 'ring-2 ring-black' : 'hover:ring-1 hover:ring-gray-300'
                      } shadow-sm transition-all`}
                    >
                      <div 
                        className="h-20 flex items-center justify-center"
                        style={{ backgroundColor: basemap.color }}
                      >
                        <FiMap className={`w-6 h-6 ${basemap.id === 'dark' ? 'text-white' : 'text-black'}`} />
                      </div>
                      <div className="py-2 text-center text-xs">
                        {basemap.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="px-4 py-2">
                <h3 className="mb-4 text-sm font-medium text-black">Gestion des données</h3>
                <div className="space-y-2.5">
                  <button 
                    className="w-full py-2.5 px-4 text-left bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors"
                    onClick={() => setShowImportDialog(true)}
                  >
                    <FiUpload className="w-4 h-4 mr-3 text-gray-700" />
                    <span className="text-sm">Importer des données</span>
                  </button>
                  <button 
                    className="w-full py-2.5 px-4 text-left bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors"
                  >
                    <FiDownload className="w-4 h-4 mr-3 text-gray-700" />
                    <span className="text-sm">Exporter les données</span>
                  </button>
                  <button 
                    className="w-full py-2.5 px-4 text-left bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors"
                  >
                    <FiCpu className="w-4 h-4 mr-3 text-gray-700" />
                    <span className="text-sm">Analyse spatiale</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="px-4 py-2">
                <h3 className="mb-4 text-sm font-medium text-black">Paramètres</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-black">Thème</h4>
                    <p className="text-sm text-gray-500">Noir et blanc</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-black">Langue</h4>
                    <p className="text-sm text-gray-500">Français</p>
                  </div>
                  <button 
                    className="w-full py-2.5 mt-4 flex items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiSave className="w-4 h-4 mr-2" />
                    <span className="text-sm">Sauvegarder le projet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Top Bar */}
        <div className="h-16 bg-white flex items-center px-4 z-10 relative shadow-sm">
          <h1 className="text-xl font-semibold text-black mr-auto">MapCraft</h1>
          
          <div className="flex items-center space-x-3">
            <button className="px-3 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition-colors">
              <FiSave className="w-4 h-4 mr-2" />
              <span>Sauvegarder</span>
            </button>
            <button 
              className="px-3 py-2 rounded-lg text-sm flex items-center hover:bg-gray-100 transition-colors"
              onClick={() => setShowImportDialog(true)}
            >
              <FiUpload className="w-4 h-4 mr-2" />
              <span>Importer</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <FiHelpCircle className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>
        
        {/* Map Controls */}
        <div className="fixed top-20 right-4 bg-white rounded-lg shadow-md z-20 flex flex-col">
          <button className="p-3 hover:bg-gray-100 transition-colors rounded-t-lg">
            <FiZoomIn className="w-5 h-5 text-black" />
          </button>
          <div className="w-full h-px bg-gray-100"></div>
          <button className="p-3 hover:bg-gray-100 transition-colors">
            <FiZoomOut className="w-5 h-5 text-black" />
          </button>
          <div className="w-full h-px bg-gray-100"></div>
          <button className="p-3 hover:bg-gray-100 transition-colors rounded-b-lg">
            <FiCompass className="w-5 h-5 text-black" />
          </button>
        </div>
        
        {/* Map Area */}
        <div className="absolute inset-0 mt-16 bg-gray-50 flex items-center justify-center">
          <span className="text-gray-400 text-lg">Carte</span>
        </div>
      </div>
      
      {/* Layer Context Menu */}
      {menuPosition && (
        <div 
          className="layer-menu fixed z-50 w-48 bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button 
            className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-gray-50 transition-colors flex items-center"
            onClick={() => handleLayerAction('edit')}
          >
            <FiEdit2 className="w-4 h-4 mr-2.5" />
            <span>Éditer</span>
          </button>
          <button 
            className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-gray-50 transition-colors flex items-center"
            onClick={() => handleLayerAction('moveUp')}
          >
            <FiArrowUp className="w-4 h-4 mr-2.5" />
            <span>Monter</span>
          </button>
          <button 
            className="w-full px-4 py-2.5 text-left text-sm text-black hover:bg-gray-50 transition-colors flex items-center"
            onClick={() => handleLayerAction('moveDown')}
          >
            <FiArrowDown className="w-4 h-4 mr-2.5" />
            <span>Descendre</span>
          </button>
          <div className="w-full h-px bg-gray-100 my-1"></div>
          <button 
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors flex items-center"
            onClick={() => handleLayerAction('delete')}
          >
            <FiTrash2 className="w-4 h-4 mr-2.5" />
            <span>Supprimer</span>
          </button>
        </div>
      )}
      
      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 bg-white">
              <h3 className="text-lg font-medium text-black">Importer des données</h3>
              <button 
                onClick={() => setShowImportDialog(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-5">
              <div 
                className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
              >
                <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1.5">Glissez-déposez un fichier ou</p>
                <button className="px-4 py-2 mt-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                  Parcourir
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Formats supportés: GeoJSON, CSV, GeoPackage, Shapefile (ZIP)
                </p>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium text-black mb-3">Données d'exemple</h4>
                <div className="flex space-x-3">
                  <button className="flex-1 py-2.5 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    Points aléatoires
                  </button>
                  <button className="flex-1 py-2.5 bg-gray-50 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    Polygones aléatoires
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-5 bg-gray-50">
              <button 
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 mr-3 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button className="px-4 py-2 text-sm text-white bg-black rounded-lg hover:bg-gray-800 transition-colors">
                Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapApp;