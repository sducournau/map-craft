import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Box, CircularProgress } from '@mui/material';
import useMapState from '../hooks/useMapState.js';
import useDataState from '../hooks/useDataState.js';
import { generateSampleData } from '../utils/dataFormatters.js';

// Loading component
const Loading = () => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
    <CircularProgress />
  </Box>
);

// Dynamically import components with SSR disabled
const DeckGLMap = dynamic(() => import('../components/Map/DeckGLMap'), {
  ssr: false,
  loading: Loading,
});

const Sidebar = dynamic(() => import('../components/UI/Sidebar'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

const DataPanel = dynamic(() => import('../components/UI/DataPanel'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

const MapControls = dynamic(() => import('../components/Map/MapControls'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

// Dynamic spatial analysis component
const SpatialAnalysis = dynamic(() => import('../components/Analysis/SpatialAnalysis'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

// Dynamic data import component
const DataImport = dynamic(() => import('../components/DataHandling/DataImport'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

// Dynamic export dialog component
const ExportDialog = dynamic(() => import('../components/DataHandling/ExportDialog'), {
  ssr: false,
  loading: () => <CircularProgress />,
});

export default function Home() {
  const { viewState, setViewState } = useMapState();
  const { 
    addData,
    datasets,
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
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  // Load sample data after initial render
  useEffect(() => {
    if (!isDataLoaded && typeof window !== 'undefined') {
      // Use setTimeout to ensure this happens after hydration
      const timer = setTimeout(() => {
        const sampleData = generateSampleData('points', 100);
        addData(sampleData, 'Sample Points');
        setIsDataLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, addData]);
  
  // Handle imported data
  const handleDataImported = (newData) => {
    addData(newData, 'Imported Data');
    
    // Adapt visualization type based on data
    if (newData && newData.features && newData.features.length > 0) {
      const firstFeature = newData.features[0];
      const geometryType = firstFeature.geometry.type;
      
      if (geometryType === 'Point') {
        setVisualizationType('points');
      } else if (geometryType.includes('Polygon')) {
        setVisualizationType('choropleth');
      }
    }
    
    // Close the import dialog
    setShowImport(false);
  };
  
  // Handle showing spatial analysis
  const handleShowAnalysis = () => {
    setShowAnalysis(true);
  };
  
  // Handle closing spatial analysis
  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
  };
  
  // Handle showing import dialog
  const handleShowImport = () => {
    setShowImport(true);
  };
  
  // Handle showing export dialog
  const handleShowExport = () => {
    setShowExport(true);
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
      
      <Sidebar 
        onImportData={handleShowImport}
        onShowAnalysis={handleShowAnalysis}
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
        
        {/* Show dialogs conditionally */}
        {showAnalysis && (
          <SpatialAnalysis onClose={handleCloseAnalysis} />
        )}
        
        {showImport && (
          <DataImport 
            onDataImported={handleDataImported} 
            onClose={() => setShowImport(false)} 
          />
        )}
        
        {showExport && (
          <ExportDialog 
            onClose={() => setShowExport(false)} 
          />
        )}
      </Box>
    </Box>
  );
}