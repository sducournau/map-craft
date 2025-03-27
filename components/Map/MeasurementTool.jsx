import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import GridOnIcon from '@mui/icons-material/GridOn';
import PlaceIcon from '@mui/icons-material/Place';
import DeleteIcon from '@mui/icons-material/Delete';
import * as turf from '@turf/turf';

const MeasurementTool = ({ map, onClose }) => {
  const [measureType, setMeasureType] = useState('distance');
  const [measurements, setMeasurements] = useState([]);
  const [points, setPoints] = useState([]);
  const [active, setActive] = useState(true);
  const [currentMeasurement, setCurrentMeasurement] = useState(null);

  // Initialiser l'outil de mesure
  useEffect(() => {
    if (!map) return;

    const handleMapClick = (e) => {
      if (!active) return;

      const point = [e.lngLat.lng, e.lngLat.lat];
      
      // Ajouter le point à la liste des points
      setPoints(prevPoints => [...prevPoints, point]);
      
      // Mettre à jour la mesure actuelle
      if (measureType === 'distance') {
        handleDistanceMeasurement([...points, point]);
      } else if (measureType === 'area') {
        handleAreaMeasurement([...points, point]);
      } else if (measureType === 'position') {
        handlePositionMeasurement(point);
      }
    };

    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
      // Nettoyer les couches de mesure si nécessaire
      clearMeasurements();
    };
  }, [map, active, points, measureType]);

  // Gérer les mesures de distance
  const handleDistanceMeasurement = (currentPoints) => {
    if (currentPoints.length < 2) return;
    
    // Créer une ligne avec les points
    const line = turf.lineString(currentPoints);
    
    // Calculer la distance totale
    const distance = turf.length(line, { units: 'kilometers' });
    
    // Formater la distance
    let formattedDistance;
    if (distance < 1) {
      formattedDistance = `${(distance * 1000).toFixed(0)} m`;
    } else {
      formattedDistance = `${distance.toFixed(2)} km`;
    }
    
    setCurrentMeasurement({
      type: 'distance',
      value: formattedDistance,
      geometry: line,
      rawValue: distance
    });
  };

  // Gérer les mesures de surface
  const handleAreaMeasurement = (currentPoints) => {
    if (currentPoints.length < 3) return;
    
    // Fermer le polygone si nécessaire
    const closedPoints = [...currentPoints];
    if (currentPoints.length >= 3 && 
        (currentPoints[0][0] !== currentPoints[currentPoints.length - 1][0] || 
         currentPoints[0][1] !== currentPoints[currentPoints.length - 1][1])) {
      closedPoints.push(currentPoints[0]);
    }
    
    // Créer un polygone
    const polygon = turf.polygon([closedPoints]);
    
    // Calculer la superficie
    const area = turf.area(polygon);
    
    // Formater la superficie
    let formattedArea;
    if (area < 10000) {
      formattedArea = `${area.toFixed(0)} m²`;
    } else if (area < 1000000) {
      formattedArea = `${(area / 10000).toFixed(2)} ha`;
    } else {
      formattedArea = `${(area / 1000000).toFixed(2)} km²`;
    }
    
    setCurrentMeasurement({
      type: 'area',
      value: formattedArea,
      geometry: polygon,
      rawValue: area
    });
  };

  // Gérer les mesures de position
  const handlePositionMeasurement = (point) => {
    setCurrentMeasurement({
      type: 'position',
      value: `${point[1].toFixed(6)}, ${point[0].toFixed(6)}`,
      geometry: turf.point(point),
      rawValue: point
    });
    
    // Réinitialiser les points pour la prochaine mesure
    setPoints([]);
  };

  // Sauvegarder la mesure actuelle
  const saveMeasurement = () => {
    if (!currentMeasurement) return;
    
    setMeasurements(prev => [...prev, currentMeasurement]);
    setCurrentMeasurement(null);
    setPoints([]);
  };

  // Annuler la mesure en cours
  const cancelMeasurement = () => {
    setCurrentMeasurement(null);
    setPoints([]);
  };

  // Supprimer toutes les mesures
  const clearMeasurements = () => {
    setMeasurements([]);
    setCurrentMeasurement(null);
    setPoints([]);
  };

  // Supprimer une mesure spécifique
  const deleteMeasurement = (index) => {
    setMeasurements(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 80,
        right: 20,
        width: 300,
        zIndex: 1000,
        p: 2
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ mr: 1 }} />
          Outil de mesure
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ mb: 2 }}>
        <RadioGroup
          row
          value={measureType}
          onChange={(e) => {
            setMeasureType(e.target.value);
            setPoints([]);
            setCurrentMeasurement(null);
          }}
        >
          <FormControlLabel 
            value="distance" 
            control={<Radio size="small" />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Distance</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="area" 
            control={<Radio size="small" />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <GridOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Surface</Typography>
              </Box>
            }
          />
          <FormControlLabel 
            value="position" 
            control={<Radio size="small" />} 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Position</Typography>
              </Box>
            }
          />
        </RadioGroup>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        {measureType === 'distance' && "Cliquez sur la carte pour mesurer une distance. Double-cliquez pour terminer."}
        {measureType === 'area' && "Cliquez pour définir les sommets du polygone. Double-cliquez pour terminer."}
        {measureType === 'position' && "Cliquez sur la carte pour obtenir les coordonnées d'un point."}
      </Typography>

      {currentMeasurement && (
        <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="subtitle2">Mesure actuelle:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {currentMeasurement.value}
          </Typography>
          
          <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
            <Button size="small" variant="outlined" onClick={saveMeasurement}>
              Sauvegarder
            </Button>
            <Button size="small" color="error" onClick={cancelMeasurement}>
              Annuler
            </Button>
          </Box>
        </Box>
      )}

      {measurements.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Mesures sauvegardées</Typography>
            <Tooltip title="Effacer toutes les mesures">
              <IconButton size="small" onClick={clearMeasurements}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          {measurements.map((measurement, index) => (
            <Box 
              key={index}
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1, 
                mb: 0.5, 
                bgcolor: 'background.default', 
                borderRadius: 1 
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {measurement.type === 'distance' && 'Distance:'}
                  {measurement.type === 'area' && 'Surface:'}
                  {measurement.type === 'position' && 'Position:'}
                </Typography>
                <Typography variant="body2">{measurement.value}</Typography>
              </Box>
              <IconButton size="small" onClick={() => deleteMeasurement(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default MeasurementTool;