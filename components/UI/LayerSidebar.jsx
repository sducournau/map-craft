import React, { useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  InputAdornment, 
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CopyIcon from '@mui/icons-material/ContentCopy';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import useLayerManager from '../../hooks/useLayerManager';

// Styled components
const LayerItem = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const NoLayersBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  minHeight: 200,
}));

// Fixed TabPanel to handle overflow properly
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sidebar-tabpanel-${index}`}
      aria-labelledby={`sidebar-tab-${index}`}
      {...other}
      style={{ 
        height: '100%', 
        display: value === index ? 'flex' : 'none',
        flexDirection: 'column',
        overflow: 'hidden' // Important: Don't let this element scroll
      }}
    >
      {value === index && (
        <Box sx={{ 
          p: 2, 
          flexGrow: 1,
          overflow: 'auto', // This is where scrolling happens
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
};

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
  } = useLayerManager();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, layerId: null });
  const [layerContextMenu, setLayerContextMenu] = useState({ open: false, layerId: null, anchorEl: null });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Toggle group expansion
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };
  
  // Handle drag end for reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    
    if (sourceIndex === destIndex) return;
    
    // Reorder layers
    const items = Array.from(layerOrder);
    const [removed] = items.splice(sourceIndex, 1);
    items.splice(destIndex, 0, removed);
    
    reorderLayers(items);
  };
  
  // Filter layers by search query
  const getFilteredLayers = useCallback(() => {
    if (!searchQuery) {
      return layers;
    }
    
    const query = searchQuery.toLowerCase();
    return layers.filter(layer => 
      (layer.title || layer.id).toLowerCase().includes(query) ||
      layer.type.toLowerCase().includes(query)
    );
  }, [layers, searchQuery]);
  
  // Create a new group
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    
    // Create group with active layer or all selected layers
    const selectedLayers = activeLayer ? [activeLayer] : [];
    
    createLayerGroup(newGroupName, selectedLayers);
    setNewGroupName('');
    setIsCreatingGroup(false);
  };
  
  // Get icon for layer type
  const getLayerTypeIcon = (type) => {
    switch (type) {
      case 'point':
        return '●';
      case 'choropleth':
        return '▢';
      case 'line':
        return '―';
      case 'heatmap':
        return '◉';
      case 'cluster':
        return '⬢';
      case '3d':
        return '△';
      default:
        return <LayersIcon fontSize="small" />;
    }
  };
  
  // Sort layers by layer order
  const getSortedLayers = useCallback(() => {
    const filteredLayers = getFilteredLayers();
    
    return filteredLayers.sort((a, b) => {
      const indexA = layerOrder.indexOf(a.id);
      const indexB = layerOrder.indexOf(b.id);
      
      // If both are in layerOrder, use that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      // Put layers without order at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      
      // Fallback to title/id
      return (a.title || a.id).localeCompare(b.title || b.id);
    });
  }, [getFilteredLayers, layerOrder]);
  
  // Layer action menu
  const handleLayerMenuOpen = (event, layerId) => {
    event.stopPropagation();
    setLayerContextMenu({
      open: true,
      layerId,
      anchorEl: event.currentTarget
    });
  };
  
  const handleLayerMenuClose = () => {
    setLayerContextMenu({
      open: false,
      layerId: null,
      anchorEl: null
    });
  };
  
  // Handle layer actions
  const handleLayerAction = (action) => {
    if (!layerContextMenu.layerId) return;
    
    const layerId = layerContextMenu.layerId;
    handleLayerMenuClose();
    
    switch (action) {
      case 'edit':
        setActiveLayer(layerId);
        break;
      case 'duplicate':
        duplicateLayer(layerId);
        break;
      case 'delete':
        setDeleteDialog({ open: true, layerId });
        break;
      case 'moveUp':
        moveLayerUp(layerId);
        break;
      case 'moveDown':
        moveLayerDown(layerId);
        break;
      case 'toggleVisibility':
        toggleLayerVisibility(layerId);
        break;
      case 'toggleLock':
        lockLayer(layerId, !lockedLayers.includes(layerId));
        break;
      default:
        break;
    }
  };
  
  // Confirm layer deletion
  const confirmLayerDelete = () => {
    if (deleteDialog.layerId) {
      removeLayer(deleteDialog.layerId);
    }
    setDeleteDialog({ open: false, layerId: null });
  };
  
  // Get readable layer type name
  const getLayerTypeName = (type) => {
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
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      overflow: 'hidden' // This is important - prevent the outer Box from scrolling
    }}>
      {/* Tabs header - fixed position */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="sidebar tabs"
          variant="fullWidth"
        >
          <Tab icon={<LayersIcon />} label="Couches" id="sidebar-tab-0" aria-controls="sidebar-tabpanel-0" />
          <Tab icon={<MapIcon />} label="Fonds" id="sidebar-tab-1" aria-controls="sidebar-tabpanel-1" />
          <Tab icon={<StorageIcon />} label="Données" id="sidebar-tab-2" aria-controls="sidebar-tabpanel-2" />
          <Tab icon={<SettingsIcon />} label="Options" id="sidebar-tab-3" aria-controls="sidebar-tabpanel-3" />
        </Tabs>
      </Box>
      
      {/* Tab panels container - takes all available height and enables proper scrolling */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'hidden', 
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Layers Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <TextField
              placeholder="Rechercher..."
              size="small"
              variant="outlined"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ ml: 1, display: 'flex' }}>
              <Tooltip title="Créer un groupe">
                <IconButton onClick={() => setIsCreatingGroup(true)} size="small">
                  <CreateNewFolderIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Ajouter une couche">
                <IconButton onClick={onImportData} size="small">
                  <AddIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Create new group dialog */}
          {isCreatingGroup && (
            <Paper 
              elevation={2}
              sx={{ 
                p: 2, 
                mb: 2,
                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                flexShrink: 0
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Nouveau groupe de couches
              </Typography>
              <TextField
                autoFocus
                fullWidth
                size="small"
                label="Nom du groupe"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => setIsCreatingGroup(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim()}
                >
                  Créer
                </Button>
              </Box>
            </Paper>
          )}
          
          {/* Scrollable content area */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {/* Layer Groups */}
            {layerGroups.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {layerGroups.map((group) => (
                  <Paper 
                    key={group.id} 
                    elevation={1} 
                    sx={{ mb: 1, overflow: 'hidden' }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1,
                        bgcolor: 'background.lighter',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleGroupExpansion(group.id)}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <FolderIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={group.name} 
                        secondary={`${group.layers.length} couche${group.layers.length > 1 ? 's' : ''}`}
                        primaryTypographyProps={{ variant: 'subtitle2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupExpansion(group.id);
                        }}
                      >
                        {expandedGroups.includes(group.id) ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </Box>
                    
                    {expandedGroups.includes(group.id) && (
                      <Box sx={{ pl: 2 }}>
                        {group.layers.map((layerId) => {
                          const layer = layers.find(l => l.id === layerId);
                          if (!layer) return null;
                          
                          return (
                            <ListItem 
                              key={layer.id}
                              dense
                              button
                              selected={activeLayer === layer.id}
                              onClick={() => setActiveLayer(layer.id)}
                              sx={{ 
                                borderLeft: '1px solid',
                                borderColor: 'divider',
                                ml: 2,
                                pl: 2,
                                opacity: lockedLayers.includes(layer.id) ? 0.7 : 1 
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Typography
                                  component="span"
                                  sx={{
                                    fontWeight: 'bold',
                                    color: 'primary.main',
                                    opacity: 0.8,
                                  }}
                                >
                                  {getLayerTypeIcon(layer.type)}
                                </Typography>
                              </ListItemIcon>
                              
                              <ListItemText
                                primary={layer.title || layer.id}
                                secondary={getLayerTypeName(layer.type)}
                                primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                                secondaryTypographyProps={{ variant: 'caption', noWrap: true }}
                              />
                              
                              <ListItemSecondaryAction>
                                <Tooltip title={visibleLayers.includes(layer.id) ? "Masquer" : "Afficher"}>
                                  <IconButton 
                                    edge="end" 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleLayerVisibility(layer.id);
                                    }}
                                  >
                                    {visibleLayers.includes(layer.id) ? 
                                      <VisibilityIcon fontSize="small" /> : 
                                      <VisibilityOffIcon fontSize="small" />
                                    }
                                  </IconButton>
                                </Tooltip>
                              </ListItemSecondaryAction>
                            </ListItem>
                          );
                        })}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
            
            {/* Layers List */}
            {layers.length === 0 ? (
              <NoLayersBox>
                <LayersIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Aucune couche disponible
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Importez des données pour commencer.
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={onImportData}
                >
                  Ajouter une couche
                </Button>
              </NoLayersBox>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="layer-list">
                  {(provided) => (
                    <Box
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {getSortedLayers().map((layer, index) => (
                        <Draggable key={layer.id} draggableId={layer.id} index={index}>
                          {(provided, snapshot) => (
                            <LayerItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              elevation={snapshot.isDragging ? 4 : 1}
                              sx={{
                                ...(activeLayer === layer.id && {
                                  borderLeft: 4,
                                  borderColor: 'primary.main',
                                }),
                              }}
                            >
                              <ListItem
                                button
                                onClick={() => setActiveLayer(layer.id)}
                                dense
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: 'primary.main',
                                      opacity: 0.8,
                                    }}
                                  >
                                    {getLayerTypeIcon(layer.type)}
                                  </Typography>
                                </ListItemIcon>
                                
                                <ListItemText
                                  primary={layer.title || layer.id}
                                  secondary={
                                    <React.Fragment>
                                      {getLayerTypeName(layer.type)}
                                      {layer.data?.features?.length > 0 && 
                                        ` (${layer.data.features.length} objets)`}
                                    </React.Fragment>
                                  }
                                  primaryTypographyProps={{ noWrap: true }}
                                  secondaryTypographyProps={{ 
                                    variant: 'caption',
                                    noWrap: true,
                                    sx: { opacity: 0.7 }
                                  }}
                                />
                                
                                <ListItemSecondaryAction sx={{ display: 'flex' }}>
                                  <Tooltip title={visibleLayers.includes(layer.id) ? "Masquer" : "Afficher"}>
                                    <IconButton 
                                      edge="end" 
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLayerVisibility(layer.id);
                                      }}
                                    >
                                      {visibleLayers.includes(layer.id) ? 
                                        <VisibilityIcon fontSize="small" /> : 
                                        <VisibilityOffIcon fontSize="small" />
                                      }
                                    </IconButton>
                                  </Tooltip>
                                  
                                  {lockedLayers.includes(layer.id) ? (
                                    <Tooltip title="Déverrouiller">
                                      <IconButton 
                                        edge="end" 
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          lockLayer(layer.id, false);
                                        }}
                                      >
                                        <LockIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Plus d'options">
                                      <IconButton 
                                        edge="end" 
                                        size="small"
                                        onClick={(e) => handleLayerMenuOpen(e, layer.id)}
                                      >
                                        <MoreVertIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </ListItemSecondaryAction>
                              </ListItem>
                            </LayerItem>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </Box>
          
          {/* Quick Actions - fixed at the bottom */}
          <Box sx={{ mt: 2, flexShrink: 0 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AnalyticsIcon />}
              onClick={onShowAnalysis}
            >
              Analyse spatiale
            </Button>
          </Box>
        </TabPanel>
        
        {/* Other tabs would go here */}
        <TabPanel value={activeTab} index={1}>
          {/* Basemaps content */}
          <Typography variant="body2">
            Configuration des fonds de carte
          </Typography>
        </TabPanel>
        
        <TabPanel value={activeTab} index={2}>
          {/* Data tab content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onImportData}
            >
              Importer des données
            </Button>
            
            <Button
              variant="outlined"
            >
              Exporter des données
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<AnalyticsIcon />}
              onClick={onShowAnalysis}
            >
              Analyse spatiale
            </Button>
          </Box>
        </TabPanel>
        
        <TabPanel value={activeTab} index={3}>
          {/* Settings tab content */}
          <Typography variant="body2">
            Paramètres de l'application
          </Typography>
        </TabPanel>
      </Box>
      
      {/* Layer Context Menu */}
      <Menu
        id="layer-menu"
        anchorEl={layerContextMenu.anchorEl}
        open={layerContextMenu.open}
        onClose={handleLayerMenuClose}
        disableScrollLock
      >
        <MenuItem onClick={() => handleLayerAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Éditer" />
        </MenuItem>
        <MenuItem onClick={() => handleLayerAction('toggleVisibility')}>
          <ListItemIcon>
            {visibleLayers.includes(layerContextMenu.layerId) ? 
              <VisibilityOffIcon fontSize="small" /> : 
              <VisibilityIcon fontSize="small" />
            }
          </ListItemIcon>
          <ListItemText 
            primary={visibleLayers.includes(layerContextMenu.layerId) ? "Masquer" : "Afficher"} 
          />
        </MenuItem>
        <MenuItem onClick={() => handleLayerAction('duplicate')}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Dupliquer" />
        </MenuItem>
        <MenuItem onClick={() => handleLayerAction('moveUp')}>
          <ListItemIcon>
            <KeyboardArrowUpIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Monter" />
        </MenuItem>
        <MenuItem onClick={() => handleLayerAction('moveDown')}>
          <ListItemIcon>
            <KeyboardArrowDownIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Descendre" />
        </MenuItem>
        <MenuItem onClick={() => handleLayerAction('toggleLock')}>
          <ListItemIcon>
            {lockedLayers.includes(layerContextMenu.layerId) ? 
              <LockOpenIcon fontSize="small" /> : 
              <LockIcon fontSize="small" />
            }
          </ListItemIcon>
          <ListItemText 
            primary={lockedLayers.includes(layerContextMenu.layerId) ? "Déverrouiller" : "Verrouiller"} 
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleLayerAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Supprimer" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>Supprimer la couche</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette couche ? Cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>
            Annuler
          </Button>
          <Button onClick={confirmLayerDelete} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LayerSidebar;