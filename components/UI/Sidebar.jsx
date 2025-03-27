import React, { useState, useEffect } from 'react';
import useLayerManager from '@/hooks/useLayerManager';
import { useThemeStore } from '@/hooks/useThemeState';
import { useHistoryStore } from '@/hooks/useHistoryStore';

const Sidebar = ({ onImportData, onShowAnalysis }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { undo, redo } = useHistoryStore();
  const { 
    layers, 
    visibleLayers, 
    activeLayer, 
    lockedLayers,
    toggleLayerVisibility, 
    setActiveLayer, 
    removeLayer,
    lockLayer,
    moveLayerUp,
    moveLayerDown,
    duplicateLayer
  } = useLayerManager();
  
  const [activeTab, setActiveTab] = useState('layers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Initialize Materialize tabs and collapsibles
    if (typeof window !== 'undefined') {
      const M = require('materialize-css');
      M.Tabs.init(document.querySelectorAll('.tabs'), {});
      M.Collapsible.init(document.querySelectorAll('.collapsible'), {});
      M.Tooltip.init(document.querySelectorAll('.tooltipped'), {});
      M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {});
    }
  }, []);

  // Filter layers by search query
  const filteredLayers = searchQuery 
    ? layers.filter(layer => 
        (layer.title || layer.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : layers;

  return (
    <div className="sidebar-content">
      {/* Tabs navigation */}
      <div className="row mb-0">
        <div className="col s12">
          <ul className="tabs">
            <li className="tab col s3">
              <a 
                href="#layers-tab" 
                className={activeTab === 'layers' ? 'active' : ''}
                onClick={() => setActiveTab('layers')}
              >
                <i className="material-icons">layers</i>
                <span className="hide-on-small-only">Couches</span>
              </a>
            </li>
            <li className="tab col s3">
              <a 
                href="#basemaps-tab" 
                className={activeTab === 'basemaps' ? 'active' : ''}
                onClick={() => setActiveTab('basemaps')}
              >
                <i className="material-icons">map</i>
                <span className="hide-on-small-only">Fond</span>
              </a>
            </li>
            <li className="tab col s3">
              <a 
                href="#data-tab" 
                className={activeTab === 'data' ? 'active' : ''}
                onClick={() => setActiveTab('data')}
              >
                <i className="material-icons">storage</i>
                <span className="hide-on-small-only">Données</span>
              </a>
            </li>
            <li className="tab col s3">
              <a 
                href="#settings-tab" 
                className={activeTab === 'settings' ? 'active' : ''}
                onClick={() => setActiveTab('settings')}
              >
                <i className="material-icons">settings</i>
                <span className="hide-on-small-only">Options</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Layers tab */}
      <div id="layers-tab" className="tab-content">
        <div className="input-field">
          <i className="material-icons prefix">search</i>
          <input 
            id="search_layers" 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <label htmlFor="search_layers">Rechercher une couche</label>
        </div>

        {filteredLayers.length === 0 ? (
          <div className="center-align p-20">
            <i className="material-icons large grey-text text-lighten-1">layers_clear</i>
            <p className="grey-text">Aucune couche disponible</p>
            <button 
              className="btn waves-effect waves-light" 
              onClick={onImportData}
            >
              <i className="material-icons left">add</i>
              Ajouter une couche
            </button>
          </div>
        ) : (
          <ul className="collection layer-list">
            {filteredLayers.map(layer => (
              <li 
                key={layer.id}
                className={`collection-item layer-item ${activeLayer === layer.id ? 'active' : ''}`}
              >
                <div className="layer-content">
                  <div className="layer-info" onClick={() => setActiveLayer(layer.id)}>
                    <span className="layer-title truncate">{layer.title || layer.id}</span>
                    <span className="layer-type grey-text">{getLayerTypeName(layer.type)}</span>
                  </div>
                  
                  <div className="layer-actions">
                    <a 
                      href="#!" 
                      className="tooltipped"
                      data-position="bottom"
                      data-tooltip={visibleLayers.includes(layer.id) ? "Masquer" : "Afficher"}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleLayerVisibility(layer.id);
                      }}
                    >
                      <i className="material-icons">
                        {visibleLayers.includes(layer.id) ? 'visibility' : 'visibility_off'}
                      </i>
                    </a>
                    
                    <a 
                      href="#!" 
                      className="dropdown-trigger tooltipped"
                      data-target={`layer-dropdown-${layer.id}`}
                      data-position="bottom"
                      data-tooltip="Options"
                    >
                      <i className="material-icons">more_vert</i>
                    </a>
                    
                    {/* Dropdown for each layer */}
                    <ul id={`layer-dropdown-${layer.id}`} className="dropdown-content">
                      <li>
                        <a href="#!" onClick={() => moveLayerUp(layer.id)}>
                          <i className="material-icons">arrow_upward</i>
                          Monter
                        </a>
                      </li>
                      <li>
                        <a href="#!" onClick={() => moveLayerDown(layer.id)}>
                          <i className="material-icons">arrow_downward</i>
                          Descendre
                        </a>
                      </li>
                      <li>
                        <a href="#!" onClick={() => duplicateLayer(layer.id)}>
                          <i className="material-icons">content_copy</i>
                          Dupliquer
                        </a>
                      </li>
                      <li>
                        <a href="#!" onClick={() => lockLayer(layer.id, !lockedLayers.includes(layer.id))}>
                          <i className="material-icons">
                            {lockedLayers.includes(layer.id) ? 'lock_open' : 'lock'}
                          </i>
                          {lockedLayers.includes(layer.id) ? 'Déverrouiller' : 'Verrouiller'}
                        </a>
                      </li>
                      <li className="divider"></li>
                      <li>
                        <a href="#!" className="red-text" onClick={() => removeLayer(layer.id)}>
                          <i className="material-icons red-text">delete</i>
                          Supprimer
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Floating action button for adding layers */}
        <div className="fixed-action-btn" style={{ bottom: '20px', right: '20px' }}>
          <a className="btn-floating btn-large blue">
            <i className="large material-icons">add</i>
          </a>
          <ul>
            <li>
              <a className="btn-floating green tooltipped" data-position="left" data-tooltip="Créer une couche vide" href="#!">
                <i className="material-icons">create</i>
              </a>
            </li>
            <li>
              <a className="btn-floating blue tooltipped" data-position="left" data-tooltip="Importer un fichier" onClick={onImportData}>
                <i className="material-icons">file_upload</i>
              </a>
            </li>
            <li>
              <a className="btn-floating orange tooltipped" data-position="left" data-tooltip="Générer des données" href="#!">
                <i className="material-icons">auto_awesome</i>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Basemaps tab */}
      <div id="basemaps-tab" className="tab-content">
        <div className="row">
          <div className="col s12">
            <h5>Fond de carte</h5>
            <div className="basemap-grid">
              {/* Example basemap options */}
              <div className="basemap-option active">
                <img src="https://via.placeholder.com/100x100?text=Dark" alt="Dark" />
                <span>Sombre</span>
              </div>
              <div className="basemap-option">
                <img src="https://via.placeholder.com/100x100?text=Light" alt="Light" />
                <span>Clair</span>
              </div>
              <div className="basemap-option">
                <img src="https://via.placeholder.com/100x100?text=Satellite" alt="Satellite" />
                <span>Satellite</span>
              </div>
              <div className="basemap-option">
                <img src="https://via.placeholder.com/100x100?text=Topo" alt="Topographic" />
                <span>Topographique</span>
              </div>
              <div className="basemap-option">
                <img src="https://via.placeholder.com/100x100?text=Street" alt="Street" />
                <span>Rues</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data tab */}
      <div id="data-tab" className="tab-content">
        <div className="row">
          <div className="col s12">
            <h5>Gestion des données</h5>
            
            <div className="collection">
              <a href="#!" className="collection-item" onClick={onImportData}>
                <i className="material-icons left">file_upload</i>
                Importer des données
              </a>
              <a href="#!" className="collection-item" onClick={() => setShowExport(true)}>
                <i className="material-icons left">file_download</i>
                Exporter les données
              </a>
              <a href="#!" className="collection-item" onClick={onShowAnalysis}>
                <i className="material-icons left">equalizer</i>
                Analyse spatiale
              </a>
            </div>
            
            <h6>Historique des données</h6>
            <blockquote className="grey-text">
              Aucune donnée récente
            </blockquote>
          </div>
        </div>
      </div>

      {/* Settings tab */}
      <div id="settings-tab" className="tab-content">
        <div className="row">
          <div className="col s12">
            <h5>Paramètres</h5>
            
            <ul className="collection">
              <li className="collection-item">
                <div>Thème
                  <a href="#!" className="secondary-content switch">
                    <label>
                      Clair
                      <input 
                        type="checkbox" 
                        checked={theme === 'dark'} 
                        onChange={toggleTheme}
                      />
                      <span className="lever"></span>
                      Sombre
                    </label>
                  </a>
                </div>
              </li>
              <li className="collection-item">
                <div>Langue
                  <a href="#!" className="secondary-content">
                    <select defaultValue="fr" className="browser-default">
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </a>
                </div>
              </li>
            </ul>
            
            <h6>Gestion du projet</h6>
            <div className="row">
              <div className="col s6">
                <button 
                  className="btn waves-effect waves-light grey" 
                  onClick={undo}
                >
                  <i className="material-icons left">undo</i>
                  Annuler
                </button>
              </div>
              <div className="col s6">
                <button 
                  className="btn waves-effect waves-light grey"
                  onClick={redo}
                >
                  <i className="material-icons left">redo</i>
                  Rétablir
                </button>
              </div>
            </div>
            
            <div className="row">
              <div className="col s12">
                <button className="btn waves-effect waves-light blue">
                  <i className="material-icons left">save</i>
                  Sauvegarder le projet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .sidebar-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .tab-content {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
          display: none;
        }
        
        #layers-tab.tab-content, 
        #basemaps-tab.tab-content, 
        #data-tab.tab-content, 
        #settings-tab.tab-content {
          display: block;
        }
        
        .layer-list {
          margin-top: 0;
          overflow-y: auto;
        }
        
        .layer-item {
          padding: 10px 15px;
        }
        
        .layer-item.active {
          background-color: #eee;
        }
        
        .layer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .layer-info {
          flex-grow: 1;
          cursor: pointer;
          overflow: hidden;
        }
        
        .layer-title {
          display: block;
          max-width: 180px;
        }
        
        .layer-type {
          font-size: 12px;
          display: block;
        }
        
        .layer-actions {
          display: flex;
          gap: 5px;
        }
        
        .basemap-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 20px;
        }
        
        .basemap-option {
          text-align: center;
          cursor: pointer;
          border: 2px solid transparent;
          border-radius: 5px;
          padding: 5px;
        }
        
        .basemap-option.active {
          border-color: #26a69a;
        }
        
        .basemap-option img {
          width: 100%;
          height: auto;
          border-radius: 3px;
          margin-bottom: 5px;
        }
        
        .basemap-option span {
          display: block;
          font-size: 12px;
        }
        
        .p-20 {
          padding: 20px;
        }
      `}</style>
    </div>
  );
};

// Helper function to get readable layer type names
function getLayerTypeName(type) {
  const typeMap = {
    'choropleth': 'Choroplèthe',
    'point': 'Points',
    'heatmap': 'Carte de chaleur',
    'cluster': 'Clusters',
    '3d': 'Extrusion 3D',
    'line': 'Lignes',
    'polygon': 'Polygones',
    'grid': 'Grille',
    'hexagon': 'Hexagones'
  };
  
  return typeMap[type] || type;
}

export default Sidebar;