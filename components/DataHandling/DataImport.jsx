import React, { useCallback, useState } from 'react';
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
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  TextField,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DataObjectIcon from '@mui/icons-material/DataObject';
import PublicIcon from '@mui/icons-material/Public';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { 
  formatGeoJson, 
  csvToGeoJson, 
  generateSampleData,
  processGeoPackage,
  processShapefile
} from '../../utils/dataFormatters.js';

// Styled components
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
}));

const UploadBox = styled(Paper)(({ theme }) => ({
  height: 200,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
}));

const SampleCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  minHeight: 120,
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

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function DataImport({ onDataImported, onClose }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dataType, setDataType] = useState('auto');
  const [customOptions, setCustomOptions] = useState({
    latField: '',
    lonField: '',
    valueField: '',
    nameField: '',
  });
  const [sampleCount, setSampleCount] = useState(100);
  const [sampleType, setSampleType] = useState('points');
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFileUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          let data;
          
          if (fileExtension === 'geojson' || fileExtension === 'json') {
            // Handle GeoJSON
            data = JSON.parse(e.target.result);
            data = formatGeoJson(data);
          } else if (fileExtension === 'csv') {
            // Handle CSV with custom options if provided
            const csvText = new TextDecoder().decode(e.target.result);
            data = csvToGeoJson(csvText, dataType === 'auto' ? {} : customOptions);
          } else if (fileExtension === 'gpkg') {
            // Handle GeoPackage
            data = await processGeoPackage(file);
          } else if (fileExtension === 'zip') {
            // Handle Shapefile in ZIP
            data = await processShapefile(e.target.result);
          } else {
            throw new Error(`Format de fichier non supporté: ${fileExtension}`);
          }

          onDataImported(data);
          if (onClose) onClose();
          setLoading(false);
        } catch (err) {
          setError(`Erreur lors du traitement du fichier: ${err.message}`);
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier');
        setLoading(false);
      };

      if (fileExtension === 'csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError(`Erreur: ${err.message}`);
      setLoading(false);
    }
  }, [onDataImported, onClose, dataType, customOptions]);

  const loadSampleData = useCallback((type = 'points', count = 100) => {
    setLoading(true);
    setError(null);

    try {
      const sampleData = generateSampleData(type, count);
      onDataImported(sampleData);
      if (onClose) onClose();
    } catch (err) {
      setError(`Erreur lors du chargement des données d'exemple: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [onDataImported, onClose]);
  
  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = document.getElementById('file-upload');
      fileInput.files = e.dataTransfer.files;
      handleFileUpload({ target: fileInput });
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
          height: '90vh',
          maxHeight: 700,
        },
      }}
    >
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FileUploadIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Importer des données</Typography>
        </Box>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <Divider />
      
      <StyledTabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
      >
        <Tab label="Importer un fichier" />
        <Tab label="Données d'exemple" />
        <Tab label="Options avancées" />
      </StyledTabs>
      
      <DialogContent>
        {activeTab === 0 && (
          // File import tab
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Importez des données géographiques
            </Typography>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              Glissez-déposez un fichier ou cliquez pour parcourir vos fichiers. 
              Formats supportés: GeoJSON, CSV avec coordonnées, GeoPackage (.gpkg), Shapefile (ZIP).
            </Typography>
            
            <UploadBox
              variant="outlined"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".geojson,.json,.csv,.gpkg,.zip"
                onChange={handleFileUpload}
                disabled={loading}
                style={{ display: 'none' }}
              />
              
              {loading ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={40} sx={{ mb: 2 }} />
                  <Typography variant="body2">Traitement en cours...</Typography>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2, opacity: 0.7 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Déposer un fichier ici
                  </Typography>
                  <Button variant="outlined" component="span" disabled={loading} sx={{ mt: 1 }}>
                    Parcourir
                  </Button>
                </>
              )}
            </UploadBox>
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Options d'importation
              </Typography>
              
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={dataType}
                  onChange={(e) => setDataType(e.target.value)}
                >
                  <FormControlLabel 
                    value="auto" 
                    control={<Radio size="small" />} 
                    label="Détection automatique" 
                  />
                  <FormControlLabel 
                    value="custom" 
                    control={<Radio size="small" />} 
                    label="Paramètres personnalisés" 
                  />
                </RadioGroup>
              </FormControl>
              
              {dataType === 'custom' && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Champ de latitude"
                      placeholder="latitude, lat, y..."
                      value={customOptions.latField}
                      onChange={(e) => setCustomOptions({...customOptions, latField: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Champ de longitude"
                      placeholder="longitude, lng, x..."
                      value={customOptions.lonField}
                      onChange={(e) => setCustomOptions({...customOptions, lonField: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Champ de valeur"
                      placeholder="value, montant, total..."
                      value={customOptions.valueField}
                      onChange={(e) => setCustomOptions({...customOptions, valueField: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Champ de nom"
                      placeholder="name, nom, label..."
                      value={customOptions.nameField}
                      onChange={(e) => setCustomOptions({...customOptions, nameField: e.target.value})}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        )}
        
        {activeTab === 1 && (
          // Sample data tab
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Données d'exemple
            </Typography>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              Générez des données d'exemple pour tester les fonctionnalités de l'application.
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <SampleCard
                  onClick={() => loadSampleData('points', sampleCount)}
                  elevation={sampleType === 'points' ? 4 : 1}
                  sx={{
                    border: sampleType === 'points' ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                >
                  <Box 
                    sx={{ 
                      color: sampleType === 'points' ? 'primary.main' : 'text.secondary',
                      mb: 1 
                    }}
                  >
                    <PublicIcon fontSize="large" />
                  </Box>
                  <Typography 
                    variant="subtitle2" 
                    align="center"
                    color={sampleType === 'points' ? 'primary' : 'textPrimary'}
                    onClick={() => setSampleType('points')}
                  >
                    Points aléatoires
                  </Typography>
                  <Typography variant="caption" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                    Génère des points répartis sur la carte
                  </Typography>
                </SampleCard>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <SampleCard
                  onClick={() => loadSampleData('polygons', Math.min(sampleCount, 20))}
                  elevation={sampleType === 'polygons' ? 4 : 1}
                  sx={{
                    border: sampleType === 'polygons' ? 2 : 0,
                    borderColor: 'primary.main',
                  }}
                >
                  <Box 
                    sx={{ 
                      color: sampleType === 'polygons' ? 'primary.main' : 'text.secondary',
                      mb: 1 
                    }}
                  >
                    <ViewInArIcon fontSize="large" />
                  </Box>
                  <Typography 
                    variant="subtitle2" 
                    align="center"
                    color={sampleType === 'polygons' ? 'primary' : 'textPrimary'}
                    onClick={() => setSampleType('polygons')}
                  >
                    Polygones aléatoires
                  </Typography>
                  <Typography variant="caption" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                    Génère des polygones répartis sur la carte
                  </Typography>
                </SampleCard>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Options de génération
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="body2">
                    Nombre d'entités à générer: {sampleCount}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    variant="outlined"
                    value={sampleCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value > 0 && value <= 1000) {
                        setSampleCount(value);
                      }
                    }}
                    inputProps={{ min: 1, max: 1000 }}
                  />
                </Grid>
              </Grid>
              
              <Typography variant="caption" color="textSecondary">
                Note: Pour les polygones, le maximum est limité à 20 entités pour des raisons de performance.
              </Typography>
            </Box>
            
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <CircularProgress />
              </Box>
            )}
            
            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
        
        {activeTab === 2 && (
          // Advanced options tab
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Options avancées d'importation
            </Typography>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              Configurations supplémentaires pour l'importation de données spécifiques.
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Formats supportés
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary">GeoJSON</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Format standard pour les données géospatiales.
                    </Typography>
                    <Link href="https://geojson.org/" target="_blank" rel="noopener" variant="caption" display="block" sx={{ mt: 1 }}>
                      En savoir plus sur GeoJSON
                    </Link>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary">CSV</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Nécessite des colonnes de latitude/longitude.
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                      Noms de colonnes reconnus: lat/lng, latitude/longitude, y/x
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary">GeoPackage (.gpkg)</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Format OGC pour stocker plusieurs couches.
                    </Typography>
                    <Link href="https://www.geopackage.org/" target="_blank" rel="noopener" variant="caption" display="block" sx={{ mt: 1 }}>
                      En savoir plus sur GeoPackage
                    </Link>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="primary">Shapefile (.zip)</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Format Esri, nécessite un fichier ZIP contenant .shp, .dbf, .prj, etc.
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                      Compressez tous les fichiers associés dans un seul ZIP
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Options de transformation
              </Typography>
              
              <Typography variant="body2" color="textSecondary" paragraph>
                Transformations appliquées après l'importation des données.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Radio checked={true} />}
                    label="Importation standard"
                  />
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ ml: 4 }}>
                    Importe les données telles quelles sans transformation
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Radio disabled />}
                    label="Reprojection (bientôt disponible)"
                  />
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ ml: 4 }}>
                    Convertit depuis d'autres systèmes de coordonnées
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        {activeTab === 0 ? (
          <Button
            component="label"
            variant="contained"
            startIcon={<FileUploadIcon />}
            disabled={loading}
          >
            Importer un fichier
            <VisuallyHiddenInput 
              id="file-upload-button"
              type="file"
              accept=".geojson,.json,.csv,.gpkg,.zip"
              onChange={handleFileUpload}
            />
          </Button>
        ) : activeTab === 1 ? (
          <Button
            variant="contained"
            startIcon={<AutoAwesomeIcon />}
            onClick={() => loadSampleData(sampleType, sampleCount)}
            disabled={loading}
          >
            Générer des données
          </Button>
        ) : (
          <Button
            component="label"
            variant="contained"
            startIcon={<FileUploadIcon />}
            disabled={loading}
          >
            Importer avec ces options
            <VisuallyHiddenInput 
              id="file-upload-advanced"
              type="file"
              accept=".geojson,.json,.csv,.gpkg,.zip"
              onChange={handleFileUpload}
            />
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}