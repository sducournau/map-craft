import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  Paper,
  Divider,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Slider,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MemoryIcon from '@mui/icons-material/Memory';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TuneIcon from '@mui/icons-material/Tune';
import FunctionsIcon from '@mui/icons-material/Functions';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LayersIcon from '@mui/icons-material/Layers';
import useLayerManager from '../../hooks/useLayerManager.js';
import * as turf from '@turf/turf';

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const AnalysisCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiTab-root': {
    textTransform: 'none',
  },
}));

const SpatialAnalysis = ({ onClose }) => {
  const { layers, addLayer } = useLayerManager();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedAnalysis, setSelectedAnalysis] = useState('buffer');
  const [sourceLayer, setSourceLayer] = useState('');
  const [targetLayer, setTargetLayer] = useState('');
  const [bufferDistance, setBufferDistance] = useState(1);
  const [bufferUnit, setBufferUnit] = useState('kilometers');
  const [resultName, setResultName] = useState('Résultat d\'analyse');
  const [status, setStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Analysis options
  const analyses = [
    { id: 'buffer', name: 'Zone tampon', icon: <AddCircleOutlineIcon fontSize="large" />, description: 'Crée une zone tampon autour des entités' },
    { id: 'centroid', name: 'Centroïdes', icon: <SearchIcon fontSize="large" />, description: 'Calcule le centre de chaque entité' },
    { id: 'intersection', name: 'Intersection', icon: <LayersIcon fontSize="large" />, description: 'Trouve les zones communes entre deux couches' },
    { id: 'union', name: 'Union', icon: <AddCircleOutlineIcon fontSize="large" />, description: 'Combine plusieurs entités en une seule' },
    { id: 'difference', name: 'Différence', icon: <FunctionsIcon fontSize="large" />, description: 'Soustrait une couche d\'une autre' },
    { id: 'voronoi', name: 'Diagramme de Voronoï', icon: <TuneIcon fontSize="large" />, description: 'Crée un pavage de l\'espace basé sur la proximité' }
  ];
  
  // Auto-update result name when analysis type changes
  useEffect(() => {
    const analysis = analyses.find(a => a.id === selectedAnalysis);
    if (analysis) {
      setResultName(`${analysis.name} - Résultat`);
    }
  }, [selectedAnalysis]);
  
  // Run spatial analysis
  const runAnalysis = async () => {
    try {
      setIsProcessing(true);
      setStatus({ type: 'info', message: 'Analyse en cours...' });
      
      // Check parameters
      if (!sourceLayer) {
        throw new Error('Veuillez sélectionner une couche source');
      }
      
      // Find source layer
      const source = layers.find(l => l.id === sourceLayer);
      if (!source || !source.data) {
        throw new Error('Couche source non trouvée ou invalide');
      }
      
      let result;
      
      // Perform analysis based on selected type
      switch (selectedAnalysis) {
        case 'buffer':
          // Create buffer
          result = {
            type: 'FeatureCollection',
            features: source.data.features.map(feature => 
              turf.buffer(feature, bufferDistance, { units: bufferUnit })
            )
          };
          break;
          
        case 'centroid':
          // Calculate centroids
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
          
          // Calculate intersection between layers
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
          
          // Calculate union
          const combined = {
            type: 'FeatureCollection',
            features: [
              ...source.data.features,
              ...targetForUnion.data.features
            ]
          };
          
          // Use dissolve to union all features
          result = turf.dissolve(combined);
          break;
          
        case 'difference':
          if (!targetLayer) {
            throw new Error('Veuillez sélectionner une couche cible');
          }
          
          const targetForDiff = layers.find(l => l.id === targetLayer);
          if (!targetForDiff || !targetForDiff.data) {
            throw new Error('Couche cible non trouvée ou invalide');
          }
          
          // Calculate difference between layers
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
          // Extract points or centroids for polygons
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
          
          // Calculate bounds
          const bbox = turf.bbox(pointsCollection);
          
          // Create Voronoi diagram
          const voronoiPolygons = turf.voronoi(pointsCollection, { bbox });
          
          result = voronoiPolygons;
          break;
          
        default:
          throw new Error(`Type d'analyse non pris en charge: ${selectedAnalysis}`);
      }
      
      // Add result layer
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
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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
          <MemoryIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Analyse spatiale</Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <Divider />
      
      <StyledTabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Analyse simple" />
        <Tab label="Analyse avancée" />
      </StyledTabs>
      
      <DialogContent>
        {selectedTab === 0 ? (
          // Simple analysis tab
          <Box>
            {/* Analysis type */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Type d'analyse
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {analyses.map((analysis) => (
                <Grid item xs={6} sm={4} key={analysis.id}>
                  <AnalysisCard
                    onClick={() => setSelectedAnalysis(analysis.id)}
                    elevation={selectedAnalysis === analysis.id ? 4 : 1}
                    sx={{
                      border: selectedAnalysis === analysis.id ? 2 : 0,
                      borderColor: 'primary.main',
                    }}
                  >
                    <Box 
                      sx={{ 
                        color: selectedAnalysis === analysis.id ? 'primary.main' : 'text.secondary',
                        mb: 1 
                      }}
                    >
                      {analysis.icon}
                    </Box>
                    <Typography 
                      variant="subtitle2" 
                      align="center"
                      color={selectedAnalysis === analysis.id ? 'primary' : 'textPrimary'}
                    >
                      {analysis.name}
                    </Typography>
                    <Typography variant="caption" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                      {analysis.description}
                    </Typography>
                  </AnalysisCard>
                </Grid>
              ))}
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Source and target layers */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel id="source-layer-label">Couche source</InputLabel>
                  <Select
                    labelId="source-layer-label"
                    value={sourceLayer}
                    onChange={(e) => setSourceLayer(e.target.value)}
                    label="Couche source"
                  >
                    <MenuItem value="">
                      <em>Sélectionner une couche</em>
                    </MenuItem>
                    {layers.map((layer) => (
                      <MenuItem key={layer.id} value={layer.id}>
                        {layer.title || layer.id}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {['intersection', 'union', 'difference'].includes(selectedAnalysis) && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel id="target-layer-label">Couche cible</InputLabel>
                    <Select
                      labelId="target-layer-label"
                      value={targetLayer}
                      onChange={(e) => setTargetLayer(e.target.value)}
                      label="Couche cible"
                    >
                      <MenuItem value="">
                        <em>Sélectionner une couche</em>
                      </MenuItem>
                      {layers
                        .filter((l) => l.id !== sourceLayer)
                        .map((layer) => (
                          <MenuItem key={layer.id} value={layer.id}>
                            {layer.title || layer.id}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              
              {/* Buffer parameters */}
              {selectedAnalysis === 'buffer' && (
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Paramètres de zone tampon
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        Distance: {bufferDistance} {bufferUnit}
                      </Typography>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                          <Slider
                            value={bufferDistance}
                            onChange={(e, value) => setBufferDistance(value)}
                            min={0.1}
                            max={100}
                            step={0.1}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            size="small"
                            variant="outlined"
                            value={bufferDistance}
                            onChange={(e) => setBufferDistance(Number(e.target.value))}
                            type="number"
                            inputProps={{ min: 0.1, step: 0.1 }}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                    
                    <FormControl component="fieldset">
                      <RadioGroup
                        row
                        value={bufferUnit}
                        onChange={(e) => setBufferUnit(e.target.value)}
                      >
                        <FormControlLabel 
                          value="kilometers" 
                          control={<Radio size="small" />} 
                          label="Kilomètres" 
                        />
                        <FormControlLabel 
                          value="meters" 
                          control={<Radio size="small" />} 
                          label="Mètres" 
                        />
                        <FormControlLabel 
                          value="miles" 
                          control={<Radio size="small" />} 
                          label="Miles" 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Paper>
                </Grid>
              )}
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="Nom de la couche résultante"
                variant="outlined"
                size="small"
                value={resultName}
                onChange={(e) => setResultName(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Le résultat sera ajouté comme nouvelle couche">
                        <HelpOutlineIcon fontSize="small" color="action" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            
            {/* Analysis status */}
            {status && (
              <Alert 
                severity={status.type} 
                sx={{ mt: 3 }}
                action={
                  status.layerId && (
                    <Button 
                      color="inherit" 
                      size="small" 
                      onClick={onClose}
                    >
                      Voir le résultat
                    </Button>
                  )
                }
              >
                {status.message}
              </Alert>
            )}
          </Box>
        ) : (
          // Advanced analysis tab
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="body1" color="textSecondary">
              La fonctionnalité d'analyse avancée sera disponible prochainement
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button
          onClick={runAnalysis}
          variant="contained"
          color="primary"
          disabled={
            !sourceLayer ||
            (['intersection', 'union', 'difference'].includes(selectedAnalysis) && !targetLayer) ||
            isProcessing
          }
          startIcon={isProcessing ? <CircularProgress size={20} /> : <PlayArrowIcon />}
        >
          {isProcessing ? 'En cours...' : 'Exécuter l\'analyse'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpatialAnalysis;