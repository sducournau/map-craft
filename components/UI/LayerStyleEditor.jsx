import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  Tabs,
  Tab,
  TextField,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormControlLabel,
  Switch,
  Chip,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import OpacityIcon from '@mui/icons-material/Opacity';
import PaletteIcon from '@mui/icons-material/Palette';
import CategoryIcon from '@mui/icons-material/Category';
import LensIcon from '@mui/icons-material/Lens';
import GridOnIcon from '@mui/icons-material/GridOn';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import LayersIcon from '@mui/icons-material/Layers';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { schemeBlues, schemeReds, schemeGreens, schemePurples, schemeViridis } from 'd3-scale-chromatic';
import { useLayerManager } from '../../hooks/useLayerManager';
import ColorPicker from './Controls/ColorPicker';

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const StyleOptionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[3],
  },
}));

const ColorSwatch = styled(Box)(({ theme }) => ({
  width: 20,
  height: 20,
  borderRadius: '50%',
  marginRight: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const LayerStyleEditor = ({ onClose, layerId }) => {
  const theme = useTheme();
  const { layers, updateLayerStyle, updateLayerMetadata } = useLayerManager();
  const [visualizationConfig, setVisualizationConfig] = useState({});
  const [availableFields, setAvailableFields] = useState([]);
  const [numericFields, setNumericFields] = useState([]);
  const [categoricalFields, setCategoricalFields] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [layerName, setLayerName] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Get the selected layer
  const layer = layers.find(l => l.id === layerId);
  
  // Load layer configuration on mount
  useEffect(() => {
    if (!layer) return;
    
    // Set layer name
    setLayerName(layer.title || layer.id);
    
    // Load current style configuration
    setVisualizationConfig(layer.style || {});
    
    // Analyze available fields in the data
    if (layer.data) {
      const fields = [];
      const numFields = [];
      const catFields = [];
      
      if (Array.isArray(layer.data)) {
        // Tabular data
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
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Update visualization configuration
  const handleConfigChange = (key, value) => {
    setVisualizationConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Apply changes to the layer
  const applyChanges = () => {
    if (!layer) return;
    
    setIsProcessing(true);
    setMessage({ type: 'info', text: 'Application des changements...' });
    
    try {
      // Update layer style
      updateLayerStyle(layer.id, visualizationConfig);
      
      // Update layer name if changed
      if (layerName !== layer.title) {
        updateLayerMetadata(layer.id, {
          title: layerName
        });
      }
      
      setMessage({ type: 'success', text: 'Modifications appliquées avec succès' });
      
      // Close after a short delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: `Erreur: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Get available visualization types based on layer geometry
  const getAvailableVisualizations = () => {
    if (!layer) return [];
    
    // Base visualizations available for all
    const baseVisualizations = [
      { id: layer.type, label: 'Actuel', icon: <TuneIcon /> },
    ];
    
    // Different visualizations by layer type
    switch (layer.type) {
      case 'point':
        return [
          ...baseVisualizations,
          { id: 'scatterplot', label: 'Points', icon: <LensIcon /> },
          { id: 'heatmap', label: 'Chaleur', icon: <OpacityIcon /> },
          { id: 'cluster', label: 'Cluster', icon: <BubbleChartIcon /> },
          { id: 'hexagon', label: 'Hexbin', icon: <GridOnIcon /> },
          { id: 'icon', label: 'Icônes', icon: <CategoryIcon /> },
          { id: 'text', label: 'Texte', icon: <TextFieldsIcon /> }
        ];
        
      case 'choropleth':
        return [
          ...baseVisualizations,
          { id: 'choropleth', label: 'Choroplèthe', icon: <LayersIcon /> },
          { id: '3d', label: 'Extrusion 3D', icon: <ViewInArIcon /> }
        ];
        
      case 'line':
        return [
          ...baseVisualizations,
          { id: 'line', label: 'Lignes', icon: <TimelineIcon /> },
          { id: 'trips', label: 'Trajectoires', icon: <TimelineIcon /> }
        ];
        
      default:
        return baseVisualizations;
    }
  };
  
  // Get color scale options
  const getColorScaleOptions = () => {
    return [
      { value: 'sequential', label: 'Séquentielle', description: 'Progression du clair au foncé' },
      { value: 'diverging', label: 'Divergente', description: 'Valeurs extrêmes opposées' },
      { value: 'categorical', label: 'Catégorielle', description: 'Couleurs distinctes par catégorie' }
    ];
  };
  
  // Get classification methods
  const getClassificationMethods = () => {
    return [
      { value: 'quantile', label: 'Quantiles', description: 'Nombre égal d\'éléments par classe' },
      { value: 'equal', label: 'Intervalles égaux', description: 'Plages de valeurs de même taille' },
      { value: 'jenks', label: 'Natural Breaks', description: 'Minimise les variations dans chaque classe' }
    ];
  };
  
  // Get predefined color palettes
  const getColorPalettes = () => {
    return {
      sequential: [
        { name: 'Blues', colors: schemeBlues[9] },
        { name: 'Reds', colors: schemeReds[9] },
        { name: 'Greens', colors: schemeGreens[9] },
        { name: 'Purples', colors: schemePurples[9] },
        { name: 'Viridis', colors: schemeViridis[9] }
      ],
      diverging: [
        { name: 'Red-Blue', colors: [
          [103, 0, 31], [178, 24, 43], [214, 96, 77], [244, 165, 130], [253, 219, 199],
          [209, 229, 240], [146, 197, 222], [67, 147, 195], [33, 102, 172], [5, 48, 97]
        ]},
        { name: 'Green-Purple', colors: [
          [64, 0, 75], [118, 42, 131], [153, 112, 171], [194, 165, 207], [231, 212, 232],
          [217, 240, 211], [166, 219, 160], [90, 174, 97], [27, 120, 55], [0, 68, 27]
        ]}
      ],
      categorical: [
        { name: 'Category10', colors: [
          [31, 119, 180], [255, 127, 14], [44, 160, 44], [214, 39, 40], [148, 103, 189],
          [140, 86, 75], [227, 119, 194], [127, 127, 127], [188, 189, 34], [23, 190, 207]
        ]},
        { name: 'Pastel', colors: [
          [141, 211, 199], [255, 255, 179], [190, 186, 218], [251, 128, 114], 
          [128, 177, 211], [253, 180, 98], [179, 222, 105], [252, 205, 229], 
          [217, 217, 217], [188, 128, 189]
        ]}
      ]
    };
  };
  
  if (!layer) {
    return (
      <Dialog open={true} onClose={onClose}>
        <DialogContent>
          <Typography>
            Aucune couche sélectionnée
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }
  
  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: 700,
        },
      }}
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormatPaintIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Éditeur de style</Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Base" />
        <Tab label="Couleur" />
        <Tab label="Forme & Taille" />
        <Tab label="Étiquettes" />
      </Tabs>
      
      <DialogContent>
        {activeTab === 0 && (
          // Base tab
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Nom de la couche"
                fullWidth
                variant="outlined"
                value={layerName}
                onChange={(e) => setLayerName(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Type de visualisation
              </Typography>
              
              <Grid container spacing={2}>
                {getAvailableVisualizations().map(vizType => (
                  <Grid item xs={6} sm={4} md={3} key={vizType.id}>
                    <StyleOptionPaper
                      elevation={visualizationConfig.visualizationType === vizType.id ? 3 : 1}
                      onClick={() => handleConfigChange('visualizationType', vizType.id)}
                      sx={{
                        border: visualizationConfig.visualizationType === vizType.id ? 2 : 0,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Box 
                          sx={{ 
                            color: visualizationConfig.visualizationType === vizType.id ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          {vizType.icon}
                        </Box>
                      </Box>
                      <Typography 
                        variant="subtitle2" 
                        align="center"
                        color={visualizationConfig.visualizationType === vizType.id ? 'primary' : 'textPrimary'}
                      >
                        {vizType.label}
                      </Typography>
                    </StyleOptionPaper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Paramètres généraux
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Opacité: {(visualizationConfig.opacity || 0.8).toFixed(2)}
                    </Typography>
                    <Slider
                      value={visualizationConfig.opacity || 0.8}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(_, value) => handleConfigChange('opacity', value)}
                      aria-labelledby="opacity-slider"
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" color="textSecondary">Transparent</Typography>
                      <Typography variant="caption" color="textSecondary">Opaque</Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={visualizationConfig.visible !== false}
                        onChange={(e) => handleConfigChange('visible', e.target.checked)}
                      />
                    }
                    label="Couche visible"
                  />
                  
                  {['choropleth', 'polygon'].includes(layer.type) && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={visualizationConfig.stroked !== false}
                          onChange={(e) => handleConfigChange('stroked', e.target.checked)}
                        />
                      }
                      label="Afficher les contours"
                    />
                  )}
                  
                  {['3d', 'hexagon', 'grid'].includes(layer.type) && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={visualizationConfig.extruded !== false}
                          onChange={(e) => handleConfigChange('extruded', e.target.checked)}
                        />
                      }
                      label="Activer l'extrusion 3D"
                    />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
        
        {activeTab === 1 && (
          // Color tab
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Source de couleur
              </Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="color-field-label">Variable de couleur</InputLabel>
                <Select
                  labelId="color-field-label"
                  value={visualizationConfig.colorField || ''}
                  onChange={(e) => handleConfigChange('colorField', e.target.value)}
                  label="Variable de couleur"
                >
                  <MenuItem value="">
                    <em>Couleur unique</em>
                  </MenuItem>
                  {availableFields.length > 0 ? (
                    <>
                      <MenuItem disabled>
                        <em>Variables numériques</em>
                      </MenuItem>
                      {numericFields.map(field => (
                        <MenuItem key={field} value={field}>{field}</MenuItem>
                      ))}
                      
                      <MenuItem disabled>
                        <em>Variables catégorielles</em>
                      </MenuItem>
                      {categoricalFields.map(field => (
                        <MenuItem key={field} value={field}>{field}</MenuItem>
                      ))}
                    </>
                  ) : (
                    <MenuItem disabled>
                      <em>Aucun champ disponible</em>
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              
              {visualizationConfig.colorField && (
                <>
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="color-scale-label">Type d'échelle</InputLabel>
                    <Select
                      labelId="color-scale-label"
                      value={visualizationConfig.colorScale || 'sequential'}
                      onChange={(e) => handleConfigChange('colorScale', e.target.value)}
                      label="Type d'échelle"
                    >
                      {getColorScaleOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          <Box>
                            {option.label}
                            <Typography variant="caption" display="block" color="textSecondary">
                              {option.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {numericFields.includes(visualizationConfig.colorField) && (
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                      <InputLabel id="classification-method-label">Méthode de classification</InputLabel>
                      <Select
                        labelId="classification-method-label"
                        value={visualizationConfig.classificationMethod || 'quantile'}
                        onChange={(e) => handleConfigChange('classificationMethod', e.target.value)}
                        label="Méthode de classification"
                      >
                        {getClassificationMethods().map(method => (
                          <MenuItem key={method.value} value={method.value}>
                            <Box>
                              {method.label}
                              <Typography variant="caption" display="block" color="textSecondary">
                                {method.description}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={visualizationConfig.reverseColorScale || false}
                        onChange={(e) => handleConfigChange('reverseColorScale', e.target.checked)}
                      />
                    }
                    label="Inverser l'échelle de couleurs"
                  />
                </>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                {visualizationConfig.colorField ? 'Palette de couleurs' : 'Couleur'}
              </Typography>
              
              {visualizationConfig.colorField ? (
                // Color palette selection
                <Box>
                  {['sequential', 'diverging', 'categorical'].map(scaleType => (
                    <Box 
                      key={scaleType} 
                      sx={{ 
                        mb: 2, 
                        display: visualizationConfig.colorScale === scaleType ? 'block' : 'none' 
                      }}
                    >
                      {getColorPalettes()[scaleType].map(palette => (
                        <Box 
                          key={palette.name}
                          onClick={() => handleConfigChange('colorRange', palette.colors)}
                          sx={{ 
                            mb: 1, 
                            cursor: 'pointer',
                            border: JSON.stringify(visualizationConfig.colorRange) === JSON.stringify(palette.colors) ? 2 : 1,
                            borderColor: JSON.stringify(visualizationConfig.colorRange) === JSON.stringify(palette.colors) ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}
                        >
                          <Box sx={{ 
                            display: 'flex', 
                            height: 24,
                            ...(visualizationConfig.reverseColorScale && { flexDirection: 'row-reverse' })
                          }}>
                            {palette.colors.map((color, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  flex: 1, 
                                  bgcolor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` 
                                }} 
                              />
                            ))}
                          </Box>
                          <Box sx={{ p: 1 }}>
                            <Typography variant="caption">{palette.name}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              ) : (
                // Single color picker
                <ColorPicker
                  initialValue={visualizationConfig.color}
                  onChange={(color) => handleConfigChange('color', color)}
                />
              )}
              
              {/* Color preview */}
              {visualizationConfig.colorField && visualizationConfig.colorRange && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Aperçu
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      height: 30,
                      borderRadius: 1,
                      overflow: 'hidden',
                      ...(visualizationConfig.reverseColorScale && { flexDirection: 'row-reverse' })
                    }}>
                      {visualizationConfig.colorRange.map((color, index) => (
                        <Box 
                          key={index} 
                          sx={{ 
                            flex: 1, 
                            bgcolor: `rgb(${color[0]}, ${color[1]}, ${color[2]})` 
                          }} 
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption">Min</Typography>
                      <Typography variant="caption">
                        {visualizationConfig.colorField || 'Valeur'}
                      </Typography>
                      <Typography variant="caption">Max</Typography>
                    </Box>
                  </Paper>
                </Box>
              )}
            </Grid>
          </Grid>
        )}
        
        {activeTab === 2 && (
          // Shape & Size tab
          <Grid container spacing={3}>
            {/* Size options for point layers */}
            {['point', 'scatterplot', 'icon', 'text'].includes(layer.type) && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Source de taille
                  </Typography>
                  
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="size-field-label">Variable de taille</InputLabel>
                    <Select
                      labelId="size-field-label"
                      value={visualizationConfig.sizeField || ''}
                      onChange={(e) => handleConfigChange('sizeField', e.target.value)}
                      label="Variable de taille"
                    >
                      <MenuItem value="">
                        <em>Taille fixe</em>
                      </MenuItem>
                      {numericFields.map(field => (
                        <MenuItem key={field} value={field}>{field}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {visualizationConfig.sizeField ? 'Taille maximale' : 'Taille'}: {visualizationConfig.radius || 5}
                    </Typography>
                    <Slider
                      value={visualizationConfig.radius || 5}
                      min={1}
                      max={50}
                      step={1}
                      onChange={(_, value) => handleConfigChange('radius', value)}
                      aria-labelledby="radius-slider"
                    />
                  </Box>
                  
                  {visualizationConfig.sizeField && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Facteur d'échelle: {visualizationConfig.sizeScale || 1}
                      </Typography>
                      <Slider
                        value={visualizationConfig.sizeScale || 1}
                        min={0.1}
                        max={10}
                        step={0.1}
                        onChange={(_, value) => handleConfigChange('sizeScale', value)}
                        aria-labelledby="size-scale-slider"
                      />
                    </Box>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Apparence des points
                  </Typography>
                  
                  {layer.type === 'point' && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Forme des points
                      </Typography>
                      <ToggleButtonGroup
                        value={visualizationConfig.pointType || 'circle'}
                        exclusive
                        onChange={(_, value) => {
                          if (value) handleConfigChange('pointType', value);
                        }}
                        aria-label="point type"
                        size="small"
                      >
                        <ToggleButton value="circle">
                          <Tooltip title="Cercles">
                            <LensIcon fontSize="small" />
                          </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="square">
                          <Tooltip title="Carrés">
                            <GridOnIcon fontSize="small" />
                          </Tooltip>
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  )}
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={visualizationConfig.stroked !== false}
                        onChange={(e) => handleConfigChange('stroked', e.target.checked)}
                      />
                    }
                    label="Afficher les contours"
                  />
                  
                  {visualizationConfig.stroked !== false && (
                    <Box sx={{ mb: 2, pl: 4 }}>
                      <Typography variant="body2" gutterBottom>
                        Largeur du contour: {visualizationConfig.lineWidth || 1}
                      </Typography>
                      <Slider
                        value={visualizationConfig.lineWidth || 1}
                        min={1}
                        max={5}
                        step={1}
                        onChange={(_, value) => handleConfigChange('lineWidth', value)}
                        aria-labelledby="line-width-slider"
                      />
                    </Box>
                  )}
                </Grid>
              </>
            )}
            
            {/* 3D options */}
            {['3d', 'hexagon', 'grid'].includes(layer.type) && (
              <>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Élévation 3D
                  </Typography>
                  
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="height-field-label">Variable d'élévation</InputLabel>
                    <Select
                      labelId="height-field-label"
                      value={visualizationConfig.heightField || ''}
                      onChange={(e) => handleConfigChange('heightField', e.target.value)}
                      label="Variable d'élévation"
                    >
                      <MenuItem value="">
                        <em>Élévation fixe</em>
                      </MenuItem>
                      {numericFields.map(field => (
                        <MenuItem key={field} value={field}>{field}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Échelle d'élévation: {visualizationConfig.elevationScale || 1}
                    </Typography>
                    <Slider
                      value={visualizationConfig.elevationScale || 1}
                      min={0.1}
                      max={10}
                      step={0.1}
                      onChange={(_, value) => handleConfigChange('elevationScale', value)}
                      aria-labelledby="elevation-scale-slider"
                    />
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={visualizationConfig.wireframe || false}
                        onChange={(e) => handleConfigChange('wireframe', e.target.checked)}
                      />
                    }
                    label="Afficher en fil de fer"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Options d'agrégation
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Taille des cellules (m): {visualizationConfig.cellSize || 1000}
                    </Typography>
                    <Slider
                      value={visualizationConfig.cellSize || 1000}
                      min={100}
                      max={10000}
                      step={100}
                      onChange={(_, value) => handleConfigChange('cellSize', value)}
                      aria-labelledby="cell-size-slider"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Couverture: {visualizationConfig.coverage || 0.8}
                    </Typography>
                    <Slider
                      value={visualizationConfig.coverage || 0.8}
                      min={0.1}
                      max={1}
                      step={0.05}
                      onChange={(_, value) => handleConfigChange('coverage', value)}
                      aria-labelledby="coverage-slider"
                    />
                  </Box>
                </Grid>
              </>
            )}
            
            {/* Line options */}
            {layer.type === 'line' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Options de ligne
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Largeur (pixels): {visualizationConfig.lineWidth || 1}
                  </Typography>
                  <Slider
                    value={visualizationConfig.lineWidth || 1}
                    min={1}
                    max={20}
                    step={1}
                    onChange={(_, value) => handleConfigChange('lineWidth', value)}
                    aria-labelledby="line-width-slider"
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={visualizationConfig.rounded || false}
                      onChange={(e) => handleConfigChange('rounded', e.target.checked)}
                    />
                  }
                  label="Arrondir les bords"
                />
              </Grid>
            )}
            
            {/* Choropleth options */}
            {['choropleth', 'polygon'].includes(layer.type) && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Options de polygone
                </Typography>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={visualizationConfig.filled !== false}
                      onChange={(e) => handleConfigChange('filled', e.target.checked)}
                    />
                  }
                  label="Polygones remplis"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={visualizationConfig.stroked !== false}
                      onChange={(e) => handleConfigChange('stroked', e.target.checked)}
                    />
                  }
                  label="Afficher les contours"
                />
                
                {visualizationConfig.stroked !== false && (
                  <Box sx={{ mb: 2, pl: 4 }}>
                    <Typography variant="body2" gutterBottom>
                      Largeur du contour: {visualizationConfig.lineWidth || 1}
                    </Typography>
                    <Slider
                      value={visualizationConfig.lineWidth || 1}
                      min={1}
                      max={5}
                      step={1}
                      onChange={(_, value) => handleConfigChange('lineWidth', value)}
                      aria-labelledby="line-width-slider"
                    />
                  </Box>
                )}
              </Grid>
            )}
            
            {/* Heatmap options */}
            {layer.type === 'heatmap' && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Options de carte de chaleur
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Rayon (pixels): {visualizationConfig.radius || 30}
                  </Typography>
                  <Slider
                    value={visualizationConfig.radius || 30}
                    min={1}
                    max={100}
                    step={1}
                    onChange={(_, value) => handleConfigChange('radius', value)}
                    aria-labelledby="radius-slider"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Intensité: {visualizationConfig.intensity || 1}
                  </Typography>
                  <Slider
                    value={visualizationConfig.intensity || 1}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onChange={(_, value) => handleConfigChange('intensity', value)}
                    aria-labelledby="intensity-slider"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Seuil: {visualizationConfig.threshold || 0.05}
                  </Typography>
                  <Slider
                    value={visualizationConfig.threshold || 0.05}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    onChange={(_, value) => handleConfigChange('threshold', value)}
                    aria-labelledby="threshold-slider"
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        )}
        
        {activeTab === 3 && (
          // Labels tab
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Étiquettes et infobulles
              </Typography>
              
              <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                <InputLabel id="text-field-label">Champ d'étiquette</InputLabel>
                <Select
                  labelId="text-field-label"
                  value={visualizationConfig.textField || ''}
                  onChange={(e) => handleConfigChange('textField', e.target.value)}
                  label="Champ d'étiquette"
                >
                  <MenuItem value="">
                    <em>Aucune étiquette</em>
                  </MenuItem>
                  {availableFields.map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {visualizationConfig.textField && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Taille du texte: {visualizationConfig.textSize || 12}
                    </Typography>
                    <Slider
                      value={visualizationConfig.textSize || 12}
                      min={8}
                      max={24}
                      step={1}
                      onChange={(_, value) => handleConfigChange('textSize', value)}
                      aria-labelledby="text-size-slider"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth variant="outlined" size="small">
                      <InputLabel id="text-color-label">Couleur du texte</InputLabel>
                      <Select
                        labelId="text-color-label"
                        value={visualizationConfig.textColor || 'auto'}
                        onChange={(e) => handleConfigChange('textColor', e.target.value)}
                        label="Couleur du texte"
                      >
                        <MenuItem value="auto">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ColorSwatch sx={{ background: 'linear-gradient(45deg, #000 0%, #000 50%, #fff 50%, #fff 100%)' }} />
                            <span>Automatique (contraste)</span>
                          </Box>
                        </MenuItem>
                        <MenuItem value="light">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ColorSwatch sx={{ bgcolor: '#ffffff' }} />
                            <span>Blanc</span>
                          </Box>
                        </MenuItem>
                        <MenuItem value="dark">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ColorSwatch sx={{ bgcolor: '#000000' }} />
                            <span>Noir</span>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={visualizationConfig.textHalo || false}
                        onChange={(e) => handleConfigChange('textHalo', e.target.checked)}
                      />
                    }
                    label="Ajouter un halo autour du texte"
                  />
                </>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Infobulle
              </Typography>
              
              <Typography variant="body2" paragraph>
                Sélectionnez les champs à afficher dans l'infobulle
              </Typography>
              
              <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                {availableFields.map(field => (
                  <FormControlLabel
                    key={field}
                    control={
                      <Checkbox
                        checked={(visualizationConfig.tooltipFields || []).includes(field)}
                        onChange={(e) => {
                          const tooltipFields = visualizationConfig.tooltipFields || [];
                          if (e.target.checked) {
                            handleConfigChange('tooltipFields', [...tooltipFields, field]);
                          } else {
                            handleConfigChange('tooltipFields', tooltipFields.filter(f => f !== field));
                          }
                        }}
                        size="small"
                      />
                    }
                    label={field}
                  />
                ))}
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={visualizationConfig.showTooltip !== false}
                    onChange={(e) => handleConfigChange('showTooltip', e.target.checked)}
                  />
                }
                label="Activer les infobulles"
              />
            </Grid>
          </Grid>
        )}
        
        {message && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={message.type}
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={applyChanges}
          disabled={isProcessing}
          startIcon={isProcessing ? <CircularProgress size={20} /> : <FormatPaintIcon />}
        >
          {isProcessing ? 'Application...' : 'Appliquer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LayerStyleEditor;