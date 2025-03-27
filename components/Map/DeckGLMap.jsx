// components/Map/DeckGLMap.jsx
import React, { useState, useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { Map } from 'react-map-gl';
import { Box } from '@mui/material';

function DeckGLMap({ layers, viewState, onViewStateChange }) {
  const [hoverInfo, setHoverInfo] = useState(null);
  
  // Memoize deck.gl props to prevent unnecessary re-renders
  const deckProps = useMemo(() => ({
    layers,
    viewState,
    onViewStateChange,
    getTooltip: ({ object }) => object && {
      html: `
        <div>
          <strong>${object.properties.name || 'Sans nom'}</strong>
          <div>Valeur: ${object.properties.value !== undefined ? object.properties.value : 'N/A'}</div>
          ${Object.entries(object.properties)
            .filter(([key]) => !['name', 'value'].includes(key))
            .map(([key, value]) => `<div>${key}: ${value}</div>`)
            .join('')
          }
        </div>
      `,
      style: { 
        backgroundColor: '#1a202c', 
        color: 'white', 
        fontSize: '12px', 
        padding: '8px',
        borderRadius: '4px',
        maxWidth: '300px'
      }
    },
    controller: true,
    pickingRadius: 5,
    onHover: info => setHoverInfo(info.object ? info : null)
  }), [layers, viewState, onViewStateChange]);

  return (
    <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
      <DeckGL {...deckProps}>
        <Map 
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          preventStyleDiffing={true}
        />
      </DeckGL>
    </Box>
  );
}

export default React.memo(DeckGLMap);