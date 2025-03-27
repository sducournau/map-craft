import React, { useState, useEffect, Suspense, lazy } from 'react';
import Head from 'next/head';
import { Box, CircularProgress } from '@mui/material';
import useMapState from '../hooks/useMapState.js';
import useDataState from '../hooks/useDataState.js';
import generateSampleData from '../utils/dataFormatters.js';

// Lazy load components
const DeckGLMap = lazy(() => import('../components/Map/DeckGLMap'));
const Sidebar = lazy(() => import('../components/UI/Sidebar'));
const DataPanel = lazy(() => import('../components/UI/DataPanel'));
const MapControls = lazy(() => import('../components/Map/MapControls'));

// Loading fallback
const Loading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
);

export default function Home() {
  const { viewState, setViewState } = useMapState();
  const { 
    data, 
    setData, 
    visualizationType, 
    setVisualizationType, 
    classificationMethod, 
    setClassificationMethod,
    colorPalette,
    setColorPalette,
    opacity,
    setOpacity,
    radius,
    setRadius,
    layers
  } = useDataState();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Charger des données d'exemple au démarrage
  useEffect(() => {
    const sampleData = generateSampleData('points', 100);
    setData(sampleData);
  }, [setData]);
  
  // Handle imported data
  const handleDataImported = (newData) => {
    setData(newData);
    
    // Adapter le type de visualisation selon les données
    if (newData && newData.features && newData.features.length > 0) {
      const firstFeature = newData.features[0];
      const geometryType = firstFeature.geometry.type;
      
      if (geometryType === 'Point') {
        setVisualizationType('points');
      } else if (geometryType.includes('Polygon')) {
        setVisualizationType('choropleth');
      }
    }
  };
  
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Head>
        <title>MapCraft - Éditeur Cartographique</title>
        <meta name="description" content="Éditeur cartographique PWA avec deck.gl" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a202c" />
      </Head>
      
      <Suspense fallback={<Loading />}>
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          onDataImported={handleDataImported} 
        />
        
        <Box sx={{ flexGrow: 1, position: 'relative', overflow: 'hidden' }}>
          <DeckGLMap
            layers={layers}
            viewState={viewState}
            onViewStateChange={evt => setViewState(evt.viewState)}
          />
          
          <MapControls 
            viewState={viewState}
            setViewState={setViewState}
          />
          
          <DataPanel 
            visualizationType={visualizationType} 
            setVisualizationType={setVisualizationType}
            classificationMethod={classificationMethod}
            setClassificationMethod={setClassificationMethod}
            colorPalette={colorPalette}
            setColorPalette={setColorPalette}
            opacity={opacity}
            setOpacity={setOpacity}
            radius={radius}
            setRadius={setRadius}
          />
        </Box>
      </Suspense>
    </Box>
  );
}