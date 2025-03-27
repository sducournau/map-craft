import React, { useState, useMemo, useEffect } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { Box, Paper, Typography, Fade, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import styles from '../../styles/DeckGLMap.module.css';

// Tooltip component for hover information
const CustomTooltip = ({ hoveredObject, x, y }) => {
  const theme = useTheme();
  
  if (!hoveredObject) return null;
  
  const properties = hoveredObject.properties || {};
  
  return (
    <Fade in={!!hoveredObject}>
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          zIndex: 10000,
          pointerEvents: 'none',
          maxWidth: 300,
          left: x,
          top: y,
          p: 1.5,
          borderLeft: 4,
          borderColor: 'primary.main',
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {properties.name || 'Sans nom'}
        </Typography>
        
        {Object.entries(properties)
          .filter(([key]) => !['name', 'id'].includes(key))
          .map(([key, value]) => (
            <Box key={key} sx={{ display: 'flex', fontSize: '0.85rem', my: 0.5 }}>
              <Typography
                variant="caption"
                sx={{ mr: 1, fontWeight: 500, minWidth: 70 }}
              >
                {key}:
              </Typography>
              <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                {typeof value === 'object' ? JSON.stringify(value) : value}
              </Typography>
            </Box>
          ))}
      </Paper>
    </Fade>
  );
};

function DeckGLMap({ layers = [], viewState, onViewStateChange }) {
  const theme = useTheme();
  const [hoverInfo, setHoverInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Validate layers
  useEffect(() => {
    setIsLoading(false);
    if (!Array.isArray(layers)) {
      console.error("DeckGLMap: 'layers' prop must be an array");
      setError("Invalid layers configuration");
    } else {
      setError(null);
    }
  }, [layers]);
  
  // Memoize deck.gl props to prevent unnecessary re-renders
  const deckProps = useMemo(() => ({
    layers: Array.isArray(layers) ? layers : [],
    viewState,
    onViewStateChange,
    getTooltip: null, // We'll use our custom tooltip instead
    controller: true,
    pickingRadius: 5,
    onHover: (info) => {
      if (info.object) {
        setHoverInfo({
          object: info.object,
          x: info.x,
          y: info.y
        });
      } else {
        setHoverInfo(null);
      }
    }
  }), [layers, viewState, onViewStateChange]);

  // Select appropriate map style based on theme
  const mapStyle = useMemo(() => {
    return theme.palette.mode === 'dark'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
  }, [theme.palette.mode]);

  // Clean up hover info when component unmounts
  useEffect(() => {
    return () => {
      setHoverInfo(null);
    };
  }, []);

  // Display loading state
  if (isLoading) {
    return (
      <Box className={styles.mapWrapper} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display error state
  if (error) {
    return (
      <Box className={styles.mapWrapper} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 2, maxWidth: 400, textAlign: 'center' }}>
          <Typography color="error" variant="h6">Map Error</Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box 
      className={styles.mapWrapper}
      sx={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%',
        '& .mapboxgl-ctrl-bottom-right': {
          display: 'none', // Hide MapLibre attribution
        },
      }}
    >
      <DeckGL 
        {...deckProps}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <Map 
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          reuseMaps
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>
      
      {/* Custom tooltip */}
      {hoverInfo && (
        <CustomTooltip 
          hoveredObject={hoverInfo.object} 
          x={hoverInfo.x} 
          y={hoverInfo.y}
        />
      )}
    </Box>
  );
}

export default React.memo(DeckGLMap);