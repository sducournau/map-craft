import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
  Radio,
  Chip,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import MapIcon from '@mui/icons-material/Map';
import TerrainIcon from '@mui/icons-material/Terrain';
import SatelliteIcon from '@mui/icons-material/Satellite';
import GridOnIcon from '@mui/icons-material/GridOn';
import { create } from 'zustand';

// Store for basemap management
export const useBasemapStore = create((set) => ({
  // Active basemap
  activeBasemap: 'dark',
  
  // Set active basemap
  setActiveBasemap: (id) => set({ activeBasemap: id }),
  
  // Basemap display options
  options: {
    showLabels: true,
    show3DBuildings: false,
    showTerrain: false,
  },
  
  // Update options
  setOption: (option, value) => set(state => ({
    options: {
      ...state.options,
      [option]: value
    }
  }))
}));

// Styled components
const BasemapCard = styled(Paper)(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.2s',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  '&:hover': {
    boxShadow: theme.shadows[3],
    transform: 'translateY(-3px)',
  },
  position: 'relative'
}));

const BasemapImage = styled(Box)(({ theme }) => ({
  height: 120,
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
}));

const BasemapInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  position: 'relative',
}));

const SelectedIcon = styled(CheckCircleIcon)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '50%',
  zIndex: 1,
}));

// Available basemaps catalog
const BASEMAPS = [
  {
    id: 'dark',
    name: 'Carte sombre',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    thumbnail: '/thumbnail/dark-basemap.svg',
    description: 'Fond de carte sombre avec détails minimaux',
    provider: 'CARTO',
    color: '#0f1621',
    icon: <MapIcon />,
    features: ['labels', '3d-buildings']
  },
  {
    id: 'light',
    name: 'Carte claire',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    thumbnail: '/thumbnail/light-basemap.svg',
    description: 'Fond de carte clair avec détails minimaux',
    provider: 'CARTO',
    color: '#f8f9fa',
    icon: <MapIcon />,
    features: ['labels', '3d-buildings']
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_key',
    thumbnail: '/thumbnail/satellite-basemap.svg',
    description: 'Imagerie satellite avec étiquettes',
    provider: 'MapTiler',
    color: '#143d6b',
    icon: <SatelliteIcon />,
    features: ['labels']
  },
  {
    id: 'streets',
    name: 'Rues',
    url: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_key',
    thumbnail: '/thumbnail/streets-basemap.svg',
    description: 'Carte détaillée des rues et points d\'intérêt',
    provider: 'MapTiler',
    color: '#f8f8f8',
    icon: <MapIcon />,
    features: ['labels', '3d-buildings']
  },
  {
    id: 'topo',
    name: 'Topographique',
    url: 'https://api.maptiler.com/maps/topo/style.json?key=get_your_own_key',
    thumbnail: '/thumbnail/topo-basemap.svg',
    description: 'Carte topographique avec relief',
    provider: 'MapTiler',
    color: '#f1f1f1',
    icon: <TerrainIcon />,
    features: ['labels', 'terrain']
  },
  {
    id: 'basic',
    name: 'Basique',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    thumbnail: '/thumbnail/basic-basemap.svg',
    description: 'Carte simple et épurée',
    provider: 'CARTO',
    color: '#f8f8f8',
    icon: <MapIcon />,
    features: ['labels']
  }
];

const BasemapSelector = () => {
  const { activeBasemap, setActiveBasemap, options, setOption } = useBasemapStore();
  const [expandedBasemap, setExpandedBasemap] = useState(null);
  
  // Get active basemap URL
  const getActiveBasemapUrl = () => {
    const basemap = BASEMAPS.find(b => b.id === activeBasemap);
    return basemap ? basemap.url : BASEMAPS[0].url;
  };
  
  // Get basemap details
  const getExpandedBasemapDetails = () => {
    if (!expandedBasemap) return null;
    return BASEMAPS.find(b => b.id === expandedBasemap);
  };
  
  // Toggle basemap details
  const toggleBasemapDetails = (id) => {
    setExpandedBasemap(expandedBasemap === id ? null : id);
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
          <MapIcon sx={{ mr: 1 }} />
          Fonds de carte
        </Typography>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {BASEMAPS.map(basemap => (
          <Grid item xs={6} key={basemap.id}>
            <BasemapCard 
              selected={activeBasemap === basemap.id}
              onClick={() => setActiveBasemap(basemap.id)}
              elevation={activeBasemap === basemap.id ? 3 : 1}
            >
              {activeBasemap === basemap.id && (
                <SelectedIcon fontSize="small" />
              )}
              
              <BasemapImage
                sx={{
                  backgroundImage: basemap.thumbnail 
                    ? `url(${basemap.thumbnail})` 
                    : 'none',
                  backgroundColor: basemap.color,
                }}
              >
                {!basemap.thumbnail && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '100%',
                      color: basemap.id === 'dark' ? 'white' : 'rgba(0,0,0,0.5)'
                    }}
                  >
                    {React.cloneElement(basemap.icon, { fontSize: 'large' })}
                  </Box>
                )}
              </BasemapImage>
              
              <BasemapInfo>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 500 }}>
                  {basemap.name}
                </Typography>
                <Typography variant="caption" color="textSecondary" noWrap>
                  {basemap.description}
                </Typography>
                
                <Box sx={{ display: 'flex', mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip 
                    label={basemap.provider} 
                    size="small" 
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.6rem' }}
                  />
                  
                  {basemap.features.includes('labels') && (
                    <Chip 
                      label="Étiquettes" 
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.6rem' }}
                    />
                  )}
                </Box>
                
                <Link
                  component="button"
                  variant="caption"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBasemapDetails(basemap.id);
                  }}
                  sx={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    width: '100%',
                    mt: 1
                  }}
                >
                  {expandedBasemap === basemap.id ? 'Moins d\'infos' : 'Plus d\'infos'}
                </Link>
              </BasemapInfo>
              
              {expandedBasemap === basemap.id && (
                <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" paragraph sx={{ mb: 1 }}>
                    <strong>Fournisseur:</strong> {basemap.provider}
                  </Typography>
                  <Typography variant="caption" paragraph sx={{ mb: 1 }}>
                    <strong>Fonctionnalités:</strong> 
                    {basemap.features.map(feature => (
                      <span key={feature}>{' '}
                        {feature === 'labels' ? 'Étiquettes' : 
                         feature === '3d-buildings' ? 'Bâtiments 3D' :
                         feature === 'terrain' ? 'Terrain' : 
                         feature}
                      </span>
                    ))}
                  </Typography>
                  <Typography variant="caption">
                    <strong>Licence:</strong> Usage non commercial
                  </Typography>
                </Box>
              )}
            </BasemapCard>
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
        Options d'affichage
      </Typography>
      
      <Paper variant="outlined" sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={options.showLabels}
              onChange={(e) => setOption('showLabels', e.target.checked)}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">Afficher les étiquettes</Typography>
              <Tooltip title="Noms des villes, rues et points d'intérêt">
                <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
              </Tooltip>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={options.show3DBuildings}
              onChange={(e) => setOption('show3DBuildings', e.target.checked)}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">Bâtiments 3D</Typography>
              <Tooltip title="Afficher les bâtiments en 3D (si disponibles)">
                <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
              </Tooltip>
            </Box>
          }
        />
        
        <FormControlLabel
          control={
            <Switch
              checked={options.showTerrain}
              onChange={(e) => setOption('showTerrain', e.target.checked)}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2">Relief du terrain</Typography>
              <Tooltip title="Afficher le relief de terrain (si disponible)">
                <InfoIcon fontSize="small" color="action" sx={{ ml: 1 }} />
              </Tooltip>
            </Box>
          }
        />
      </Paper>
      
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 3 }}>
        Opacité de la carte
      </Typography>
      
      <Box sx={{ px: 2 }}>
        <Typography variant="body2" gutterBottom>
          Opacité du fond de carte: 100%
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Radio checked={true} size="small" />
          <Typography variant="body2">100%</Typography>
          <Radio checked={false} size="small" disabled />
          <Typography variant="body2" color="textSecondary">70%</Typography>
          <Radio checked={false} size="small" disabled />
          <Typography variant="body2" color="textSecondary">50%</Typography>
        </Box>
        <Typography variant="caption" color="textSecondary">
          Réduisez l'opacité pour superposer d'autres couches sur le fond de carte (bientôt disponible)
        </Typography>
      </Box>
    </Box>
  );
};

export default BasemapSelector;