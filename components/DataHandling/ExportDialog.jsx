import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Paper,
  Chip,
  Alert,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ImageIcon from '@mui/icons-material/Image';
import DataObjectIcon from '@mui/icons-material/DataObject';
import TableChartIcon from '@mui/icons-material/TableChart';
import PublicIcon from '@mui/icons-material/Public';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import useLayerManager from '../../hooks/useLayerManager.js';
import * as turf from '@turf/turf';

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const OptionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const ExportDialog = ({ onClose }) => {
  const { layers, visibleLayers } = useLayerManager();
  const [exportFormat, setExportFormat] = useState('geojson');
  const [layersToExport, setLayersToExport] = useState([]);
  const [exportName, setExportName] = useState('mapcraft_export');
  const [exportOptions, setExportOptions] = useState({
    includeStyles: true,
    simplify: false,
    simplificationTolerance: 0.0001,
    filterByExtent: false,
  });
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle layer selection for export
  const toggleLayerExport = (layerId) => {
    setLayersToExport(prev => 
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  // Select all layers
  const selectAllLayers = () => {
    setLayersToExport(layers.map(layer => layer.id));
  };

  // Deselect all layers
  const deselectAllLayers = () => {
    setLayersToExport([]);
  };

  // Select only visible layers
  const selectVisibleLayers = () => {
    setLayersToExport(visibleLayers);
  };

  // Handle export format change
  const handleFormatChange = (event) => {
    setExportFormat(event.target.value);
  };

  // Handle export options change
  const handleOptionChange = (option, value) => {
    setExportOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Export data
  const handleExport = async () => {
    if (layersToExport.length === 0) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner au moins une couche à exporter.' });
      return;
    }

    try {
      setIsProcessing(true);
      setMessage({ type: 'info', text: 'Préparation de l\'export...' });
      
      // Get data from selected layers
      const selectedLayers = layers.filter(layer => layersToExport.includes(layer.id));
      
      let exportData;
      let blob;
      let mimeType;
      let fileExtension;
      
      if (exportFormat === 'geojson') {
        // Export as GeoJSON
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
        
        // Apply simplification if enabled
        if (exportOptions.simplify && exportOptions.simplificationTolerance > 0) {
          exportData.features = exportData.features.map(feature => {
            if (feature.geometry.type.includes('Polygon') || feature.geometry.type.includes('LineString')) {
              return turf.simplify(feature, {
                tolerance: exportOptions.simplificationTolerance,
                highQuality: true
              });
            }
            return feature;
          });
        }
        
        blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
        mimeType = 'application/json';
        fileExtension = 'geojson';
      } else if (exportFormat === 'csv') {
        // Export as CSV
        const headers = ['geometry_type', 'layer', 'longitude', 'latitude'];
        
        // Find all unique property keys across all features
        const propertyKeys = new Set();
        selectedLayers.forEach(layer => {
          layer.data.features.forEach(feature => {
            if (feature.properties) {
              Object.keys(feature.properties).forEach(key => {
                propertyKeys.add(key);
              });
            }
          });
        });
        
        // Add property keys to headers
        [...propertyKeys].forEach(key => {
          if (!headers.includes(key)) {
            headers.push(key);
          }
        });
        
        // Create CSV rows
        const rows = selectedLayers.flatMap(layer => 
          layer.data.features.map(feature => {
            const coords = feature.geometry.type === 'Point' 
              ? feature.geometry.coordinates 
              : turf.centroid(feature).geometry.coordinates;
            
            const row = {
              geometry_type: feature.geometry.type,
              layer: layer.title || layer.id,
              longitude: coords[0],
              latitude: coords[1]
            };
            
            // Add properties
            if (feature.properties) {
              Object.entries(feature.properties).forEach(([key, value]) => {
                row[key] = value;
              });
            }
            
            // Create CSV row
            return headers.map(header => {
              const value = row[header];
              
              // Format value for CSV
              if (value === undefined || value === null) {
                return '';
              } else if (typeof value === 'string') {
                // Escape quotes and wrap in quotes if needed
                if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                  return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
              } else if (typeof value === 'object') {
                // Convert objects to JSON strings
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
              }
              
              return String(value);
            }).join(',');
          })
        );
        
        exportData = [headers.join(','), ...rows].join('\n');
        blob = new Blob([exportData], { type: 'text/csv' });
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else if (exportFormat === 'png') {
        // Show a message about the map export
        setMessage({ 
          type: 'info', 
          text: 'L\'export d\'image sera disponible dans une prochaine version. Essayez un autre format pour le moment.' 
        });
        setIsProcessing(false);
        return;
      } else {
        throw new Error(`Format d'export non supporté: ${exportFormat}`);
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportName}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Exportation réussie!' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: `Erreur lors de l'exportation: ${error.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '80vh',
          maxHeight: 600,
        },
      }}
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FileDownloadIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Exporter des données</Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Format selection */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Format d'exportation
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                value={exportFormat}
                onChange={handleFormatChange}
              >
                <Paper variant="outlined" sx={{ mb: 1, ...(exportFormat === 'geojson' && { borderColor: 'primary.main', borderWidth: 2 }) }}>
                  <FormControlLabel 
                    value="geojson" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DataObjectIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">GeoJSON</Typography>
                      </Box>
                    }
                    sx={{ m: 1, width: '100%' }}
                  />
                </Paper>
                <Paper variant="outlined" sx={{ mb: 1, ...(exportFormat === 'csv' && { borderColor: 'primary.main', borderWidth: 2 }) }}>
                  <FormControlLabel 
                    value="csv" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TableChartIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">CSV</Typography>
                      </Box>
                    }
                    sx={{ m: 1, width: '100%' }}
                  />
                </Paper>
                <Paper variant="outlined" sx={{ mb: 1, ...(exportFormat === 'png' && { borderColor: 'primary.main', borderWidth: 2 }) }}>
                  <FormControlLabel 
                    value="png" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ImageIcon sx={{ mr: 1 }} />
                        <Typography variant="body2">Image (PNG)</Typography>
                      </Box>
                    }
                    sx={{ m: 1, width: '100%' }}
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
            
            {/* Export options based on format */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Options d'exportation
              </Typography>
              
              {exportFormat === 'geojson' && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.includeStyles}
                        onChange={(e) => handleOptionChange('includeStyles', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Inclure les styles"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={exportOptions.simplify}
                        onChange={(e) => handleOptionChange('simplify', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Simplifier la géométrie"
                  />
                  
                  {exportOptions.simplify && (
                    <Box sx={{ pl: 4, pr: 2 }}>
                      <Typography variant="caption" gutterBottom>
                        Tolérance: {exportOptions.simplificationTolerance}
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                          <Slider
                            value={exportOptions.simplificationTolerance}
                            onChange={(_, value) => handleOptionChange('simplificationTolerance', value)}
                            min={0.00001}
                            max={0.001}
                            step={0.00001}
                            sx={{ display: 'block' }}
                          />
                        </Grid>
                        <Grid item>
                          <TextField
                            value={exportOptions.simplificationTolerance}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                handleOptionChange('simplificationTolerance', value);
                              }
                            }}
                            size="small"
                            sx={{ width: 100 }}
                            inputProps={{
                              step: 0.00001,
                              min: 0.00001,
                              max: 0.001,
                              type: 'number',
                            }}
                          />
                        </Grid>
                      </Grid>
                      <Typography variant="caption" color="textSecondary">
                        Plus la valeur est faible, plus la géométrie sera précise.
                      </Typography>
                    </Box>
                  )}
                </>
              )}
              
              {exportFormat === 'csv' && (
                <Typography variant="body2" color="textSecondary">
                  Les géométries non ponctuelles seront converties en points (centroïdes).
                </Typography>
              )}
              
              {exportFormat === 'png' && (
                <>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={true}
                        disabled
                        size="small"
                      />
                    }
                    label="Inclure la légende"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={true}
                        disabled
                        size="small"
                      />
                    }
                    label="Inclure l'échelle"
                  />
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={false}
                        disabled
                        size="small"
                      />
                    }
                    label="Haute résolution"
                  />
                </>
              )}
            </Box>
            
            {/* Export name */}
            <Box sx={{ mt: 3 }}>
              <TextField
                label="Nom du fichier"
                variant="outlined"
                fullWidth
                size="small"
                value={exportName}
                onChange={(e) => setExportName(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <Typography variant="caption" color="textSecondary">
                      .{exportFormat}
                    </Typography>
                  ),
                }}
              />
            </Box>
          </Grid>
          
          {/* Layer selection */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Couches à exporter
              </Typography>
              
              <Box>
                <Button 
                  size="small" 
                  onClick={selectAllLayers}
                  sx={{ mr: 1 }}
                >
                  Tout
                </Button>
                <Button 
                  size="small" 
                  onClick={selectVisibleLayers}
                  sx={{ mr: 1 }}
                >
                  Visible
                </Button>
                <Button 
                  size="small" 
                  onClick={deselectAllLayers}
                >
                  Aucun
                </Button>
              </Box>
            </Box>
            
            <Paper variant="outlined" sx={{ p: 0, maxHeight: 300, overflow: 'auto' }}>
              {layers.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Aucune couche disponible
                  </Typography>
                </Box>
              ) : (
                <List dense>
                  {layers.map((layer) => (
                    <ListItem key={layer.id} sx={{ px: 2 }}>
                      <ListItemIcon sx={{ minWidth: 34 }}>
                        <Checkbox
                          edge="start"
                          checked={layersToExport.includes(layer.id)}
                          onChange={() => toggleLayerExport(layer.id)}
                          inputProps={{ 'aria-labelledby': `layer-${layer.id}` }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        id={`layer-${layer.id}`}
                        primary={layer.title || layer.id}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" component="span">
                              {layer.type === 'choropleth' ? 'Choroplèthe' : 
                                layer.type === 'point' ? 'Points' :
                                layer.type === 'heatmap' ? 'Carte de chaleur' :
                                layer.type === 'cluster' ? 'Clusters' :
                                layer.type === '3d' ? 'Extrusion 3D' :
                                layer.type === 'line' ? 'Lignes' :
                                layer.type}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={`${layer.data?.features?.length || 0} objet${layer.data?.features?.length !== 1 ? 's' : ''}`} 
                              variant="outlined"
                              sx={{ height: 20 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
            
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" variant="outlined">
                <Typography variant="body2">
                  {layersToExport.length === 0 
                    ? 'Veuillez sélectionner au moins une couche à exporter.' 
                    : `${layersToExport.length} couche${layersToExport.length > 1 ? 's' : ''} sélectionnée${layersToExport.length > 1 ? 's' : ''} pour l'exportation.`}
                </Typography>
              </Alert>
            </Box>
            
            {message && (
              <Alert
                severity={message.type}
                onClose={() => setMessage(null)}
                sx={{ mt: 2 }}
              >
                {message.text}
              </Alert>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={isProcessing ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          onClick={handleExport}
          disabled={isProcessing || layersToExport.length === 0}
        >
          {isProcessing ? 'Exportation...' : 'Exporter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;