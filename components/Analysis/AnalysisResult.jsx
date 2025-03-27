import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Alert,
  LinearProgress,
  Tab,
  Tabs
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import MapIcon from '@mui/icons-material/Map';
import InfoIcon from '@mui/icons-material/Info';
import * as turf from '@turf/turf';

const AnalysisResult = ({ 
  analysisType, 
  result, 
  metadata = {}, 
  onSave, 
  onClose, 
  onAddToMap 
}) => {
  const [expanded, setExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [visible, setVisible] = useState(true);

  // Calcul des statistiques de base
  const calculateStats = () => {
    if (!result || !result.features || result.features.length === 0) {
      return { count: 0 };
    }

    // Nombre d'entités
    const count = result.features.length;
    
    // Type de géométrie
    const geometryType = result.features[0].geometry.type;
    
    // Statistiques supplémentaires selon le type de géométrie
    let stats = { count, geometryType };
    
    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
      // Surface totale
      const totalArea = result.features.reduce((sum, feature) => {
        try {
          return sum + turf.area(feature);
        } catch (error) {
          console.warn('Erreur lors du calcul de surface:', error);
          return sum;
        }
      }, 0);
      
      stats.totalArea = totalArea;
      stats.formattedArea = formatArea(totalArea);
    }
    
    if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
      // Longueur totale
      const totalLength = result.features.reduce((sum, feature) => {
        try {
          return sum + turf.length(feature, { units: 'kilometers' });
        } catch (error) {
          console.warn('Erreur lors du calcul de longueur:', error);
          return sum;
        }
      }, 0);
      
      stats.totalLength = totalLength;
      stats.formattedLength = formatLength(totalLength);
    }
    
    return stats;
  };

  // Formater une surface
  const formatArea = (areaSqMeters) => {
    if (areaSqMeters < 10000) {
      return `${areaSqMeters.toFixed(1)} m²`;
    } else if (areaSqMeters < 1000000) {
      return `${(areaSqMeters / 10000).toFixed(2)} ha`;
    } else {
      return `${(areaSqMeters / 1000000).toFixed(2)} km²`;
    }
  };

  // Formater une longueur
  const formatLength = (lengthKm) => {
    if (lengthKm < 1) {
      return `${(lengthKm * 1000).toFixed(1)} m`;
    } else {
      return `${lengthKm.toFixed(2)} km`;
    }
  };

  // Extraire jusqu'à 5 propriétés d'exemple
  const getSampleProperties = () => {
    if (!result || !result.features || result.features.length === 0) {
      return {};
    }
    
    const properties = result.features[0].properties || {};
    const keys = Object.keys(properties).slice(0, 5);
    
    const sample = {};
    keys.forEach(key => {
      sample[key] = properties[key];
    });
    
    return sample;
  };

  // Télécharger le résultat en GeoJSON
  const downloadResult = () => {
    if (!result) return;
    
    const filename = `analyse_${analysisType}_${new Date().toISOString().slice(0, 10)}.geojson`;
    const jsonString = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Obtenir un titre lisible pour le type d'analyse
  const getAnalysisTitle = () => {
    const titles = {
      buffer: 'Zone tampon',
      centroid: 'Centroïdes',
      intersection: 'Intersection',
      union: 'Union',
      difference: 'Différence',
      voronoi: 'Diagramme de Voronoï'
    };
    
    return titles[analysisType] || 'Analyse spatiale';
  };

  const stats = calculateStats();
  const sampleProperties = getSampleProperties();

  return (
    <Paper elevation={3} sx={{ 
      maxWidth: 600, 
      mb: 2,
      borderLeft: 4, 
      borderColor: 'primary.main',
      position: 'relative'
    }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        cursor: 'pointer'
      }} onClick={() => setExpanded(!expanded)}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="subtitle1">
            {getAnalysisTitle()}: {result ? result.features.length : 0} entités
          </Typography>
        </Box>
        <Box>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            setVisible(!visible);
            if (onAddToMap) {
              onAddToMap(result, !visible);
            }
          }}>
            {visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            if (onClose) onClose();
          }}>
            <CloseIcon />
          </IconButton>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Divider />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            aria-label="analysis tabs"
          >
            <Tab icon={<InfoIcon />} label="Résumé" />
            <Tab icon={<TableChartIcon />} label="Données" />
            <Tab icon={<BarChartIcon />} label="Statistiques" />
          </Tabs>
        </Box>
        
        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Paramètres de l'analyse
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {Object.entries(metadata).map(([key, value]) => (
                    <Chip 
                      key={key} 
                      label={`${key}: ${value}`} 
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Résultats
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Type d'analyse
                        </TableCell>
                        <TableCell align="right">
                          {getAnalysisTitle()}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Nombre d'entités
                        </TableCell>
                        <TableCell align="right">
                          {stats.count}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row">
                          Type de géométrie
                        </TableCell>
                        <TableCell align="right">
                          {stats.geometryType || 'Inconnu'}
                        </TableCell>
                      </TableRow>
                      {stats.totalArea && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Surface totale
                          </TableCell>
                          <TableCell align="right">
                            {stats.formattedArea}
                          </TableCell>
                        </TableRow>
                      )}
                      {stats.totalLength && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            Longueur totale
                          </TableCell>
                          <TableCell align="right">
                            {stats.formattedLength}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => {
                    if (onSave) onSave(result);
                  }}
                >
                  Ajouter comme couche
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={downloadResult}
                >
                  Télécharger GeoJSON
                </Button>
              </Box>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Aperçu des données
              </Typography>
              
              {!result || !result.features || result.features.length === 0 ? (
                <Alert severity="info">
                  Aucune donnée disponible.
                </Alert>
              ) : (
                <Box>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxHeight: 200 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          {Object.keys(sampleProperties).map(key => (
                            <TableCell key={key}>{key}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.features.slice(0, 5).map((feature, index) => (
                          <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            {Object.keys(sampleProperties).map(key => (
                              <TableCell key={key}>
                                {feature.properties?.[key] !== undefined 
                                  ? String(feature.properties[key]).substring(0, 30) 
                                  : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Typography variant="caption" color="text.secondary">
                    Affichage de 5 entités sur {result.features.length}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Statistiques d'analyse
              </Typography>
              
              {!result || !result.features || result.features.length === 0 ? (
                <Alert severity="info">
                  Aucune donnée disponible pour les statistiques.
                </Alert>
              ) : (
                <Box>
                  {analysisType === 'buffer' && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Taille moyenne des zones tampon:
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={70}
                        sx={{ height: 8, borderRadius: 1, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {stats.formattedArea || 'Non disponible'}
                      </Typography>
                    </Box>
                  )}
                  
                  {analysisType === 'intersection' && (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Pourcentage de chevauchement:
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={35}
                        sx={{ height: 8, borderRadius: 1, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Environ 35% de chevauchement
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Autres types d'analyses auraient des statistiques spécifiques ici */}
                  
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Des statistiques plus détaillées seront disponibles dans une prochaine version.
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default AnalysisResult;