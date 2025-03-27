import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
  Paper,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import TuneIcon from '@mui/icons-material/Tune';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ColorPicker from './ColorPicker';

const StyleEditor = ({ layer, onChange }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [styleConfig, setStyleConfig] = useState({
    opacity: 0.8,
    color: [67, 121, 237],
    colorField: '',
    colorScale: 'sequential',
    sizeField: '',
    radius: 5,
    filled: true,
    stroked: true,
    lineWidth: 1,
    lineColor: [255, 255, 255],
    textField: '',
    textSize: 12,
    extruded: false,
    elevationField: '',
    elevationScale: 1,
    pointType: 'circle'
  });

  // Initialiser le style à partir de la couche
  useEffect(() => {
    if (layer && layer.style) {
      setStyleConfig({
        ...styleConfig,
        ...layer.style
      });
    }
  }, [layer]);

  // Déterminer les champs disponibles dans la couche
  const getAvailableFields = () => {
    if (!layer || !layer.data || !layer.data.features || layer.data.features.length === 0) {
      return [];
    }

    // Utiliser le premier élément pour extraire les propriétés
    const sampleFeature = layer.data.features[0];
    return Object.keys(sampleFeature.properties || {});
  };

  // Déterminer les champs numériques
  const getNumericFields = () => {
    if (!layer || !layer.data || !layer.data.features || layer.data.features.length === 0) {
      return [];
    }

    const sampleFeature = layer.data.features[0];
    return Object.entries(sampleFeature.properties || {})
      .filter(([_, value]) => typeof value === 'number')
      .map(([key]) => key);
  };

  // Obtenir le type de géométrie
  const getGeometryType = () => {
    if (!layer || !layer.data || !layer.data.features || layer.data.features.length === 0) {
      return 'unknown';
    }

    return layer.data.features[0].geometry.type;
  };

  // Mise à jour du style
  const handleStyleChange = (property, value) => {
    const updatedConfig = {
      ...styleConfig,
      [property]: value
    };
    
    setStyleConfig(updatedConfig);
    
    if (onChange) {
      onChange(updatedConfig);
    }
  };

  const geometryType = getGeometryType();
  const availableFields = getAvailableFields();
  const numericFields = getNumericFields();

  return (
    <Box>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab 
          icon={<FormatColorFillIcon />} 
          label="Couleur & Opacité" 
          iconPosition="start"
        />
        <Tab 
          icon={<TuneIcon />} 
          label="Taille & Forme" 
          iconPosition="start"
        />
        <Tab 
          icon={<TextFormatIcon />} 
          label="Étiquettes" 
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Opacité générale
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={styleConfig.opacity}
              min={0}
              max={1}
              step={0.05}
              onChange={(_, value) => handleStyleChange('opacity', value)}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${Math.round(value * 100)}%`}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            Couleur de remplissage
            <Tooltip title="Définir la couleur de base ou une coloration basée sur un champ">
              <HelpOutlineIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
            </Tooltip>
          </Typography>

          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
            <InputLabel id="color-field-label">Champ pour la couleur</InputLabel>
            <Select
              labelId="color-field-label"
              value={styleConfig.colorField}
              onChange={(e) => handleStyleChange('colorField', e.target.value)}
              label="Champ pour la couleur"
            >
              <MenuItem value="">
                <em>Couleur unique</em>
              </MenuItem>
              {numericFields.map(field => (
                <MenuItem key={field} value={field}>{field}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {!styleConfig.colorField ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Couleur unique
              </Typography>
              <ColorPicker
                initialValue={styleConfig.color}
                onChange={(color) => handleStyleChange('color', color)}
              />
            </Box>
          ) : (
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                <InputLabel id="color-scale-label">Échelle de couleur</InputLabel>
                <Select
                  labelId="color-scale-label"
                  value={styleConfig.colorScale}
                  onChange={(e) => handleStyleChange('colorScale', e.target.value)}
                  label="Échelle de couleur"
                >
                  <MenuItem value="sequential">Séquentielle (progression)</MenuItem>
                  <MenuItem value="diverging">Divergente (opposés)</MenuItem>
                  <MenuItem value="categorical">Catégories (distinctes)</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={styleConfig.reverseColorScale || false}
                    onChange={(e) => handleStyleChange('reverseColorScale', e.target.checked)}
                  />
                }
                label="Inverser l'échelle de couleurs"
              />
            </Box>
          )}

          {(geometryType === 'Polygon' || geometryType === 'MultiPolygon' || geometryType === 'LineString' || geometryType === 'MultiLineString') && (
            <Box>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Options de contour
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={styleConfig.stroked}
                    onChange={(e) => handleStyleChange('stroked', e.target.checked)}
                  />
                }
                label="Afficher les contours"
              />
              
              {styleConfig.stroked && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    Largeur du contour: {styleConfig.lineWidth}px
                  </Typography>
                  <Slider
                    value={styleConfig.lineWidth}
                    min={1}
                    max={5}
                    step={0.5}
                    onChange={(_, value) => handleStyleChange('lineWidth', value)}
                    valueLabelDisplay="auto"
                  />
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Couleur du contour
                    </Typography>
                    <ColorPicker
                      initialValue={styleConfig.lineColor}
                      onChange={(color) => handleStyleChange('lineColor', color)}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Box>
          {(geometryType === 'Point' || geometryType === 'MultiPoint') && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Taille des points
              </Typography>
              
              <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                <InputLabel id="size-field-label">Champ pour la taille</InputLabel>
                <Select
                  labelId="size-field-label"
                  value={styleConfig.sizeField}
                  onChange={(e) => handleStyleChange('sizeField', e.target.value)}
                  label="Champ pour la taille"
                >
                  <MenuItem value="">
                    <em>Taille fixe</em>
                  </MenuItem>
                  {numericFields.map(field => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" gutterBottom>
                {styleConfig.sizeField ? 'Taille maximale:' : 'Taille:'} {styleConfig.radius}
              </Typography>
              <Slider
                value={styleConfig.radius}
                min={1}
                max={20}
                step={1}
                onChange={(_, value) => handleStyleChange('radius', value)}
                valueLabelDisplay="auto"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Forme des points
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Paper
                    elevation={styleConfig.pointType === 'circle' ? 3 : 1}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: styleConfig.pointType === 'circle' ? 2 : 1,
                      borderColor: styleConfig.pointType === 'circle' ? 'primary.main' : 'divider'
                    }}
                    onClick={() => handleStyleChange('pointType', 'circle')}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 1
                      }}
                    />
                    <Typography variant="caption">Cercle</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    elevation={styleConfig.pointType === 'square' ? 3 : 1}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: styleConfig.pointType === 'square' ? 2 : 1,
                      borderColor: styleConfig.pointType === 'square' ? 'primary.main' : 'divider'
                    }}
                    onClick={() => handleStyleChange('pointType', 'square')}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: 'primary.main',
                        mx: 'auto',
                        mb: 1
                      }}
                    />
                    <Typography variant="caption">Carré</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    elevation={styleConfig.pointType === 'triangle' ? 3 : 1}
                    sx={{
                      p: 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      border: styleConfig.pointType === 'triangle' ? 2 : 1,
                      borderColor: styleConfig.pointType === 'triangle' ? 'primary.main' : 'divider'
                    }}
                    onClick={() => handleStyleChange('pointType', 'triangle')}
                  >
                    <Box
                      sx={{
                        width: 0,
                        height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderBottom: '20px solid',
                        borderBottomColor: 'primary.main',
                        mx: 'auto',
                        mb: 1
                      }}
                    />
                    <Typography variant="caption">Triangle</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {(geometryType === 'Polygon' || geometryType === 'MultiPolygon') && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Style de polygone
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={styleConfig.filled}
                    onChange={(e) => handleStyleChange('filled', e.target.checked)}
                  />
                }
                label="Remplir les polygones"
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Options 3D
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={styleConfig.extruded}
                    onChange={(e) => handleStyleChange('extruded', e.target.checked)}
                  />
                }
                label="Activer l'extrusion 3D"
              />
              
              {styleConfig.extruded && (
                <Box sx={{ mt: 1 }}>
                  <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                    <InputLabel id="elevation-field-label">Champ pour la hauteur</InputLabel>
                    <Select
                      labelId="elevation-field-label"
                      value={styleConfig.elevationField}
                      onChange={(e) => handleStyleChange('elevationField', e.target.value)}
                      label="Champ pour la hauteur"
                    >
                      <MenuItem value="">
                        <em>Hauteur fixe</em>
                      </MenuItem>
                      {numericFields.map(field => (
                        <MenuItem key={field} value={field}>{field}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Typography variant="body2" gutterBottom>
                    Échelle d'élévation: {styleConfig.elevationScale}
                  </Typography>
                  <Slider
                    value={styleConfig.elevationScale}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onChange={(_, value) => handleStyleChange('elevationScale', value)}
                    valueLabelDisplay="auto"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={styleConfig.wireframe}
                        onChange={(e) => handleStyleChange('wireframe', e.target.checked)}
                      />
                    }
                    label="Afficher le maillage (wireframe)"
                  />
                </Box>
              )}
            </Box>
          )}
          
          {(geometryType === 'LineString' || geometryType === 'MultiLineString') && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Style de ligne
              </Typography>
              
              <Typography variant="body2" gutterBottom>
                Largeur des lignes: {styleConfig.lineWidth}px
              </Typography>
              <Slider
                value={styleConfig.lineWidth}
                min={1}
                max={10}
                step={0.5}
                onChange={(_, value) => handleStyleChange('lineWidth', value)}
                valueLabelDisplay="auto"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={styleConfig.rounded}
                    onChange={(e) => handleStyleChange('rounded', e.target.checked)}
                  />
                }
                label="Coins arrondis"
              />
            </Box>
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Étiquettes
          </Typography>
          
          <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
            <InputLabel id="text-field-label">Champ pour les étiquettes</InputLabel>
            <Select
              labelId="text-field-label"
              value={styleConfig.textField}
              onChange={(e) => handleStyleChange('textField', e.target.value)}
              label="Champ pour les étiquettes"
            >
              <MenuItem value="">
                <em>Aucune étiquette</em>
              </MenuItem>
              {availableFields.map(field => (
                <MenuItem key={field} value={field}>{field}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {styleConfig.textField && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Taille du texte: {styleConfig.textSize}px
              </Typography>
              <Slider
                value={styleConfig.textSize}
                min={8}
                max={24}
                step={1}
                onChange={(_, value) => handleStyleChange('textSize', value)}
                valueLabelDisplay="auto"
              />
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Couleur du texte
                </Typography>
                <ColorPicker
                  initialValue={styleConfig.textColor || [255, 255, 255]}
                  onChange={(color) => handleStyleChange('textColor', color)}
                />
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={styleConfig.textHalo}
                    onChange={(e) => handleStyleChange('textHalo', e.target.checked)}
                  />
                }
                label="Ajouter un halo au texte"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={styleConfig.alwaysVisible}
                    onChange={(e) => handleStyleChange('alwaysVisible', e.target.checked)}
                  />
                }
                label="Toujours afficher les étiquettes"
              />
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Infobulles
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={styleConfig.enableTooltip !== false}
                onChange={(e) => handleStyleChange('enableTooltip', e.target.checked)}
              />
            }
            label="Activer les infobulles"
          />
          
          {styleConfig.enableTooltip !== false && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" gutterBottom>
                Champs à afficher dans l'infobulle
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 1, maxHeight: 150, overflow: 'auto' }}>
                {availableFields.map(field => (
                  <FormControlLabel
                    key={field}
                    control={
                      <Switch
                        size="small"
                        checked={styleConfig.tooltipFields?.includes(field) || false}
                        onChange={(e) => {
                          const currentFields = styleConfig.tooltipFields || [];
                          const newFields = e.target.checked
                            ? [...currentFields, field]
                            : currentFields.filter(f => f !== field);
                          handleStyleChange('tooltipFields', newFields);
                        }}
                      />
                    }
                    label={<Typography variant="caption">{field}</Typography>}
                  />
                ))}
              </Paper>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PaletteIcon />}
          onClick={() => onChange(styleConfig)}
        >
          Appliquer le style
        </Button>
      </Box>
    </Box>
  );
};

export default StyleEditor;