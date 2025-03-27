import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  IconButton,
  Tooltip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LayersIcon from '@mui/icons-material/Layers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import { validateGeoJSON } from '../../../utils/validators';

const LayerOptions = ({ 
  layer, 
  onLayerChange,
  onLayerDelete,
  onLayerVisibilityToggle,
  onLayerLockToggle,
  isVisible = true,
  isLocked = false
}) => {
  const [expanded, setExpanded] = useState({
    metadata: true,
    filter: false,
    advanced: false
  });
  const [filterField, setFilterField] = useState('');
  const [filterOperator, setFilterOperator] = useState('==');
  const [filterValue, setFilterValue] = useState('');
  const [showFilterAlert, setShowFilterAlert] = useState(false);

  // Obtenir les statistiques de la couche
  const getLayerStats = () => {
    if (!layer || !layer.data) return { features: 0, type: 'Inconnu' };

    const features = layer.data.features || [];
    const type = features.length > 0 ? features[0].geometry.type : 'Inconnu';
    
    return {
      features: features.length,
      type
    };
  };

  // Obtenir les champs disponibles dans la couche
  const getAvailableFields = () => {
    if (!layer || !layer.data || !layer.data.features || layer.data.features.length === 0) {
      return [];
    }

    // Utiliser le premier élément pour extraire les propriétés
    const sampleFeature = layer.data.features[0];
    return Object.keys(sampleFeature.properties || {});
  };

  // Mettre à jour les métadonnées
  const updateMetadata = (field, value) => {
    if (!layer) return;

    const updatedLayer = {
      ...layer,
      [field]: value
    };

    if (onLayerChange) {
      onLayerChange(updatedLayer);
    }
  };

  // Ajouter un filtre
  const addFilter = () => {
    if (!filterField || !filterOperator) {
      setShowFilterAlert(true);
      return;
    }

    setShowFilterAlert(false);

    const filter = {
      field: filterField,
      operator: filterOperator,
      value: filterValue
    };

    const currentFilters = layer.filters || [];
    const updatedLayer = {
      ...layer,
      filters: [...currentFilters, filter]
    };

    if (onLayerChange) {
      onLayerChange(updatedLayer);
    }

    // Réinitialiser les champs de filtre
    setFilterField('');
    setFilterValue('');
  };

  // Supprimer un filtre
  const removeFilter = (index) => {
    const filters = [...(layer.filters || [])];
    filters.splice(index, 1);

    const updatedLayer = {
      ...layer,
      filters
    };

    if (onLayerChange) {
      onLayerChange(updatedLayer);
    }
  };

  // Valider la couche
  const validateLayer = () => {
    if (!layer || !layer.data) return { valid: false, errors: ['Données manquantes'] };

    return validateGeoJSON(layer.data);
  };

  const { features, type } = getLayerStats();
  const availableFields = getAvailableFields();
  const validation = validateLayer();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <LayersIcon sx={{ mr: 1 }} />
          Options de couche
        </Typography>
        <Box>
          <Tooltip title={isVisible ? "Masquer" : "Afficher"}>
            <IconButton onClick={onLayerVisibilityToggle}>
              {isVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={isLocked ? "Déverrouiller" : "Verrouiller"}>
            <IconButton onClick={onLayerLockToggle}>
              {isLocked ? <LockIcon /> : <LockOpenIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {!validation.valid && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Cette couche contient des données invalides: {validation.errors[0]}
        </Alert>
      )}

      <Accordion
        expanded={expanded.metadata}
        onChange={() => setExpanded({...expanded, metadata: !expanded.metadata})}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Métadonnées</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Nom de la couche"
            value={layer?.title || ''}
            onChange={(e) => updateMetadata('title', e.target.value)}
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={layer?.description || ''}
            onChange={(e) => updateMetadata('description', e.target.value)}
            variant="outlined"
            size="small"
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Informations
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Type:</Typography>
              <Typography variant="body2" fontWeight="medium">{type}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Entités:</Typography>
              <Typography variant="body2" fontWeight="medium">{features}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Propriétés:</Typography>
              <Typography variant="body2" fontWeight="medium">{availableFields.length}</Typography>
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={layer?.minzoom !== undefined}
                onChange={(e) => updateMetadata('minzoom', e.target.checked ? 0 : undefined)}
              />
            }
            label="Limiter la visibilité par zoom"
          />

          {layer?.minzoom !== undefined && (
            <Box sx={{ px: 2, mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                Zoom minimum: {layer.minzoom || 0}
              </Typography>
              <Slider
                value={layer.minzoom || 0}
                min={0}
                max={22}
                step={1}
                onChange={(_, value) => updateMetadata('minzoom', value)}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" gutterBottom>
                Zoom maximum: {layer.maxzoom || 22}
              </Typography>
              <Slider
                value={layer.maxzoom || 22}
                min={0}
                max={22}
                step={1}
                onChange={(_, value) => updateMetadata('maxzoom', value)}
                valueLabelDisplay="auto"
              />
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded.filter}
        onChange={() => setExpanded({...expanded, filter: !expanded.filter})}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon fontSize="small" sx={{ mr: 1 }} />
            Filtres
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Les filtres permettent de limiter les entités affichées selon certains critères.
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ajouter un filtre
            </Typography>
            
            <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 1 }}>
              <InputLabel id="filter-field-label">Champ</InputLabel>
              <Select
                labelId="filter-field-label"
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
                label="Champ"
              >
                <MenuItem value="">
                  <em>Sélectionner un champ</em>
                </MenuItem>
                {availableFields.map(field => (
                  <MenuItem key={field} value={field}>{field}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <FormControl variant="outlined" size="small" sx={{ width: 120 }}>
                <InputLabel id="filter-operator-label">Opérateur</InputLabel>
                <Select
                  labelId="filter-operator-label"
                  value={filterOperator}
                  onChange={(e) => setFilterOperator(e.target.value)}
                  label="Opérateur"
                >
                  <MenuItem value="==">=</MenuItem>
                  <MenuItem value="!=">≠</MenuItem>
                  <MenuItem value=">">&gt;</MenuItem>
                  <MenuItem value="<">&lt;</MenuItem>
                  <MenuItem value=">=">&ge;</MenuItem>
                  <MenuItem value="<=">&le;</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Valeur"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Box>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={addFilter}
              fullWidth
            >
              Ajouter le filtre
            </Button>
            
            {showFilterAlert && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Veuillez sélectionner un champ et un opérateur.
              </Alert>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Filtres actifs
          </Typography>
          
          {!layer?.filters || layer.filters.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun filtre actif.
            </Typography>
          ) : (
            <Box>
              {layer.filters.map((filter, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1, 
                    mb: 1, 
                    bgcolor: 'background.default', 
                    borderRadius: 1 
                  }}
                >
                  <Typography variant="body2">
                    {filter.field} {filter.operator} {filter.value}
                  </Typography>
                  <IconButton size="small" onClick={() => removeFilter(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded.advanced}
        onChange={() => setExpanded({...expanded, advanced: !expanded.advanced})}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            Options avancées
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            control={
              <Switch
                checked={layer?.cacheFeatures || false}
                onChange={(e) => updateMetadata('cacheFeatures', e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">Mettre en cache</Typography>
                <Tooltip title="Conserve les entités en mémoire pour améliorer les performances">
                  <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            }
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={layer?.pickable !== false}
                onChange={(e) => updateMetadata('pickable', e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">Sélectionnable</Typography>
                <Tooltip title="Permet d'interagir avec les entités (cliquer, survol)">
                  <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            }
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={layer?.autoHighlight || false}
                onChange={(e) => updateMetadata('autoHighlight', e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">Surbrillance automatique</Typography>
                <Tooltip title="Met en évidence les entités au survol">
                  <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
            }
          />
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onLayerDelete}
        >
          Supprimer
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={() => onLayerChange(layer)}
        >
          Appliquer
        </Button>
      </Box>
    </Box>
  );
};

export default LayerOptions;