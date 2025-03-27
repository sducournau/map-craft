import React, { useState } from 'react';
import { 
  FiLayers, 
  FiPlus, 
  FiEye, 
  FiEyeOff, 
  FiTrash2, 
  FiEdit2, 
  FiCopy,
  FiLock,
  FiUnlock,
  FiMoreVertical,
  FiChevronUp,
  FiChevronDown,
  FiFolder,
  FiFolderPlus,
  FiFileText,
  FiArrowUpRight,
  FiArrowDownRight
} from 'react-icons/fi';
import { useLayerManager } from '@/hooks/useLayerManager';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const LayerSidebar = ({ onImportData, onShowAnalysis }) => {
  const { 
    layers,
    visibleLayers,
    activeLayer,
    lockedLayers,
    layerGroups,
    layerOrder,
    toggleLayerVisibility,
    setActiveLayer,
    removeLayer,
    lockLayer,
    duplicateLayer,
    reorderLayers,
    moveLayerUp,
    moveLayerDown,
    createLayerGroup,
    updateLayerGroup,
    removeLayerGroup
  } = useLayerManager();
  
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  // Gérer le glisser-déposer
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;
    
    // Réorganiser la liste
    const items = Array.from(layerOrder);
    const [removed] = items.splice(sourceIndex, 1);
    items.splice(destIndex, 0, removed);
    
    reorderLayers(items);
  };
  
  // Basculer l'expansion d'un groupe
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };
  
  // Filtrer les couches selon la recherche
  const getFilteredLayers = () => {
    if (!searchQuery) {
      return layers;
    }
    
    const query = searchQuery.toLowerCase();
    return layers.filter(layer => 
      (layer.title || layer.id).toLowerCase().includes(query) ||
      layer.type.toLowerCase().includes(query)
    );
  };
  
  // Créer un nouveau groupe
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    // Créer un groupe avec les couches sélectionnées
    const selectedLayers = layers
      .filter(layer => activeLayer === layer.id)
      .map(layer => layer.id);
    
    createLayerGroup(newGroupName, selectedLayers);
    setNewGroupName('');
    setIsCreatingGroup(false);
  };
  
  // Obtenir l'icône pour le type de couche
  const getLayerIcon = (type) => {
    switch (type) {
      case 'point':
        return <span className="text-blue-500">●</span>;
      case 'choropleth':
        return <span className="text-green-500">▢</span>;
      case 'line':
        return <span className="text-purple-500">―</span>;
      case 'heatmap':
        return <span className="text-orange-500">◉</span>;
      case 'cluster':
        return <span className="text-yellow-500">⬢</span>;
      case '3d':
        return <span className="text-red-500">△</span>;
      default:
        return <FiLayers className="text-slate-500" />;
    }
  };
  
  // Trier les couches selon l'ordre défini
  const getSortedLayers = () => {
    const filteredLayers = getFilteredLayers();
    
    return filteredLayers.sort((a, b) => {
      const indexA = layerOrder.indexOf(a.id);
      const indexB = layerOrder.indexOf(b.id);
      
      // Si les deux couches sont dans layerOrder, utiliser cet ordre
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Sinon, mettre les couches sans ordre à la fin
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      // Fallback sur le titre/id
      return (a.title || a.id).localeCompare(b.title || b.id);
    });
  };
  
  // Ouvrir le menu contextuel
  const handleContextMenu = (e, layerId) => {
    e.preventDefault();
    setShowContextMenu({
      layerId,
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Fermer le menu contextuel
  const closeContextMenu = () => {
    setShowContextMenu(null);
  };
  
  // Actions du menu contextuel
  const handleContextAction = (action) => {
    if (!showContextMenu) return;
    
    const layerId = showContextMenu.layerId;
    closeContextMenu();
    
    switch (action) {
      case 'edit':
        setActiveLayer(layerId);
        break;
      case 'duplicate':
        duplicateLayer(layerId);
        break;
      case 'delete':
        removeLayer(layerId);
        break;
      case 'moveUp':
        moveLayerUp(layerId);
        break;
      case 'moveDown':
        moveLayerDown(layerId);
        break;
      case 'toggle':
        toggleLayerVisibility(layerId);
        break;
      case 'lock':
        lockLayer(layerId, !lockedLayers.includes(layerId));
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center">
            <FiLayers className="mr-2" />
            Couches
          </h3>
          <div className="flex">
            <button
              onClick={() => setIsCreatingGroup(!isCreatingGroup)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Créer un groupe"
              title="Créer un groupe"
            >
              <FiFolderPlus />
            </button>
            <button
              onClick={onImportData}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Ajouter une couche"
              title="Ajouter une couche"
            >
              <FiPlus />
            </button>
          </div>
        </div>
        
        {/* Créer un groupe */}
        {isCreatingGroup && (
          <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-600">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nom du groupe"
              className="w-full p-1.5 mb-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsCreatingGroup(false)}
                className="px-2 py-1 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-2 py-1 text-sm bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded hover:bg-slate-800 dark:hover:bg-slate-100"
                disabled={!newGroupName.trim()}
              >
                Créer
              </button>
            </div>
          </div>
        )}
        
        {/* Recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une couche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-8 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800"
          />
          <svg
            className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>
      
      {/* Liste des couches */}
      <div className="flex-grow overflow-y-auto p-2">
        {layers.length === 0 ? (
          <div className="py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
            <p>Aucune couche n&apos;a été ajoutée.</p>
            <p>Importez des données pour commencer.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="layer-list">
              {(provided) => (
                <ul
                  className="space-y-1"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {/* Groupes */}
                  {layerGroups.map((group) => (
                    <li key={group.id} className="mb-2">
                      <div 
                        className="flex items-center justify-between p-1.5 bg-slate-100 dark:bg-slate-700 rounded cursor-pointer"
                        onClick={() => toggleGroupExpansion(group.id)}
                      >
                        <div className="flex items-center">
                          <FiFolder className="mr-1.5 text-slate-500" />
                          <span>{group.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                            ({group.layers.length})
                          </span>
                        </div>
                        <button className="p-1">
                          {expandedGroups.includes(group.id) ? (
                            <FiChevronUp size={14} />
                          ) : (
                            <FiChevronDown size={14} />
                          )}
                        </button>
                      </div>
                      
                      {expandedGroups.includes(group.id) && (
                        <ul className="pl-3 mt-1 space-y-1">
                          {group.layers.map((layerId) => {
                            const layer = layers.find(l => l.id === layerId);
                            if (!layer) return null;
                            
                            return (
                              <Draggable key={layer.id} draggableId={layer.id} index={layerOrder.indexOf(layer.id)}>
                                {(provided, snapshot) => (
                                  <li
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 overflow-hidden ${
                                      snapshot.isDragging ? 'shadow-lg' : ''
                                    } ${lockedLayers.includes(layer.id) ? 'opacity-75' : ''}`}
                                    onContextMenu={(e) => handleContextMenu(e, layer.id)}
                                  >
                                    <div className="flex items-center p-1.5 group">
                                      <div className="flex items-center space-x-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleLayerVisibility(layer.id);
                                          }}
                                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                          aria-label={visibleLayers.includes(layer.id) ? 'Masquer' : 'Afficher'}
                                        >
                                          {visibleLayers.includes(layer.id) ? (
                                            <FiEye className="text-slate-600 dark:text-slate-300" />
                                          ) : (
                                            <FiEyeOff className="text-slate-400 dark:text-slate-500" />
                                          )}
                                        </button>
                                        
                                        <div className="w-5 flex justify-center">
                                          {getLayerIcon(layer.type)}
                                        </div>
                                      </div>
                                      
                                      <button
                                        onClick={() => setActiveLayer(layer.id)}
                                        className={`flex-grow text-left px-2 py-1 truncate hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded transition-colors ${
                                          activeLayer === layer.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                                        }`}
                                      >
                                        <span className="block truncate font-medium">
                                          {layer.title || layer.id}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                                          {layer.type === 'choropleth' ? 'Choroplèthe' : 
                                           layer.type === 'point' ? 'Points' :
                                           layer.type === 'heatmap' ? 'Carte de chaleur' :
                                           layer.type === 'cluster' ? 'Clusters' :
                                           layer.type === '3d' ? 'Extrusion 3D' :
                                           layer.type === 'line' ? 'Lignes' :
                                           layer.type}
                                          {layer.objectCount ? ` (${layer.objectCount} objets)` : ''}
                                        </span>
                                      </button>
                                      
                                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                        {lockedLayers.includes(layer.id) ? (
                                          <button
                                            onClick={() => lockLayer(layer.id, false)}
                                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            aria-label="Déverrouiller"
                                          >
                                            <FiLock className="text-slate-500" size={14} />
                                          </button>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() => setActiveLayer(layer.id)}
                                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                              aria-label="Éditer"
                                            >
                                              <FiEdit2 className="text-slate-600 dark:text-slate-400" size={14} />
                                            </button>
                                            <button
                                              onClick={() => removeLayer(layer.id)}
                                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                              aria-label="Supprimer"
                                            >
                                              <FiTrash2 className="text-slate-600 dark:text-slate-400" size={14} />
                                            </button>
                                            <button
                                              onClick={(e) => handleContextMenu(e, layer.id)}
                                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                              aria-label="Plus d'options"
                                            >
                                              <FiMoreVertical className="text-slate-600 dark:text-slate-400" size={14} />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                )}
                              </Draggable>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                  
                  {/* Couches individuelles */}
                  {getSortedLayers().map((layer, index) => (
                    <Draggable key={layer.id} draggableId={layer.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 overflow-hidden ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          } ${lockedLayers.includes(layer.id) ? 'opacity-75' : ''}`}
                          onContextMenu={(e) => handleContextMenu(e, layer.id)}
                        >
                          <div className="flex items-center p-1.5 group">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLayerVisibility(layer.id);
                                }}
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                aria-label={visibleLayers.includes(layer.id) ? 'Masquer' : 'Afficher'}
                              >
                                {visibleLayers.includes(layer.id) ? (
                                  <FiEye className="text-slate-600 dark:text-slate-300" />
                                ) : (
                                  <FiEyeOff className="text-slate-400 dark:text-slate-500" />
                                )}
                              </button>
                              
                              <div className="w-5 flex justify-center">
                                {getLayerIcon(layer.type)}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => setActiveLayer(layer.id)}
                              className={`flex-grow text-left px-2 py-1 truncate hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded transition-colors ${
                                activeLayer === layer.id ? 'bg-slate-100 dark:bg-slate-700' : ''
                              }`}
                            >
                              <span className="block truncate font-medium">
                                {layer.title || layer.id}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                                {layer.type === 'choropleth' ? 'Choroplèthe' : 
                                 layer.type === 'point' ? 'Points' :
                                 layer.type === 'heatmap' ? 'Carte de chaleur' :
                                 layer.type === 'cluster' ? 'Clusters' :
                                 layer.type === '3d' ? 'Extrusion 3D' :
                                 layer.type === 'line' ? 'Lignes' :
                                 layer.type}
                                {layer.objectCount ? ` (${layer.objectCount} objets)` : ''}
                              </span>
                            </button>
                            
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                              {lockedLayers.includes(layer.id) ? (
                                <button
                                  onClick={() => lockLayer(layer.id, false)}
                                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                  aria-label="Déverrouiller"
                                >
                                  <FiLock className="text-slate-500" size={14} />
                                </button>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setActiveLayer(layer.id)}
                                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Éditer"
                                  >
                                    <FiEdit2 className="text-slate-600 dark:text-slate-400" size={14} />
                                  </button>
                                  <button
                                    onClick={() => removeLayer(layer.id)}
                                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Supprimer"
                                  >
                                    <FiTrash2 className="text-slate-600 dark:text-slate-400" size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => handleContextMenu(e, layer.id)}
                                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Plus d'options"
                                  >
                                    <FiMoreVertical className="text-slate-600 dark:text-slate-400" size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      
      {/* Actions rapides en bas */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onShowAnalysis}
          className="w-full py-2 px-3 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
        >
          <FiFileText className="text-slate-500 dark:text-slate-400" />
          <span>Analyse spatiale</span>
        </button>
      </div>
      
      {/* Menu contextuel */}
      {showContextMenu && (
        <div 
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1 w-48"
          style={{
            left: `${showContextMenu.x}px`,
            top: `${showContextMenu.y}px`,
          }}
        >
          <ul>
            <li>
              <button
                onClick={() => handleContextAction('edit')}
                className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <FiEdit2 className="text-slate-500" size={14} />
                <span>Éditer</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleContextAction('toggle')}
                className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                {visibleLayers.includes(showContextMenu.layerId) ? (
                  <>
                    <FiEyeOff className="text-slate-500" size={14} />
                    <span>Masquer</span>
                  </>
                ) : (
                  <>
                    <FiEye className="text-slate-500" size={14} />
                    <span>Afficher</span>
                  </>
                )}
              </button>
            </li>
            <li>
              <button
                onClick={() => handleContextAction('duplicate')}
                className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <FiCopy className="text-slate-500" size={14} />
                <span>Dupliquer</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleContextAction('moveUp')}
                className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <FiArrowUpRight className="text-slate-500" size={14} />
                <span>Monter</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleContextAction('moveDown')}
                className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <FiArrowDownRight className="text-slate-500" size={14} />
                <span>Descendre</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleContextAction('lock')}
                className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                {lockedLayers.includes(showContextMenu.layerId) ? (
                  <>
                    <FiUnlock className="text-slate-500" size={14} />
                    <span>Déverrouiller</span>
                  </>
                ) : (
                  <>
                    <FiLock className="text-slate-500" size={14} />
                    <span>Verrouiller</span>
                  </>
                )}
              </button>
            </li>
            <li className="border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleContextAction('delete')}
                className="w-full text-left px-4 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 text-red-500"
              >
                <FiTrash2 size={14} />
                <span>Supprimer</span>
              </button>
            </li>
          </ul>
        </div>
      )}
      
      {/* Overlay pour fermer le menu contextuel en cliquant ailleurs */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
};

export default LayerSidebar;