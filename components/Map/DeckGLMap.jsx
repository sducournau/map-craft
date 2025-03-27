import React, { useState, useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { Box, Paper, Typography, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';

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

function DeckGLMap({ layers, viewState, onViewStateChange }) {
  const theme = useTheme();
  const [hoverInfo, setHoverInfo] = useState(null);
  
  // Memoize deck.gl props to prevent unnecessary re-renders
  const deckProps = useMemo(() => ({
    layers,
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

  return (
    <Box 
      sx={{ 
        position: 'absolute', 
        width: '100%', 
        height: '100%',
        '& .mapboxgl-ctrl-bottom-right': {
          display: 'none', // Hide MapLibre attribution
        },
      }}
    >
      <DeckGL {...deckProps}>
        <Map 
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          reuseMaps
          attributionControl={false}
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