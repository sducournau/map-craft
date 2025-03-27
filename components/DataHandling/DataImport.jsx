import React, { useCallback, useState } from 'react';
import { 
  formatGeoJson, 
  csvToGeoJson, 
  generateSampleData,
  processGeoPackage,
  processShapefile
} from '../../utils/dataFormatters';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Alert,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Hidden file input
const Input = styled('input')({
  display: 'none',
});

export default function DataImport({ onDataImported, onClose }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
            // Handle CSV
            const csvText = new TextDecoder().decode(e.target.result);
            data = csvToGeoJson(csvText);
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
  }, [onDataImported, onClose]);

  const loadSampleData = useCallback((type = 'points') => {
    setLoading(true);
    setError(null);

    try {
      const sampleData = generateSampleData(type, type === 'points' ? 100 : 20);
      onDataImported(sampleData);
      if (onClose) onClose();
    } catch (err) {
      setError(`Erreur lors du chargement des données d'exemple: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [onDataImported, onClose]);

  return (
    <Paper 
      sx={{ 
        p: 3, 
        maxWidth: 500, 
        mx: 'auto',
        mt: 4,
        bgcolor: 'background.paper' 
      }}
    >
      <Typography variant="h5" gutterBottom>
        Importer des données
      </Typography>
      
      <Stack spacing={3}>
        <Box>
          <label htmlFor="file-upload">
            <Input
              id="file-upload"
              type="file"
              accept=".geojson,.json,.csv,.gpkg,.zip"
              onChange={handleFileUpload}
              disabled={loading}
            />
            <Button
              component="span"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              fullWidth
              disabled={loading}
            >
              Choisir un fichier
            </Button>
          </label>
          <Typography variant="caption" display="block" mt={1} color="text.secondary">
            Formats supportés: GeoJSON, CSV avec coordonnées, GeoPackage (.gpkg), Shapefile (ZIP)
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Données d'exemple
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => loadSampleData('points')}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              Points aléatoires
            </Button>
            <Button
              variant="outlined"
              onClick={() => loadSampleData('polygons')}
              disabled={loading}
              sx={{ flex: 1 }}
            >
              Polygones aléatoires
            </Button>
          </Stack>
        </Box>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}
        
        {onClose && (
          <Button onClick={onClose}>
            Fermer
          </Button>
        )}
      </Stack>
    </Paper>
  );
}