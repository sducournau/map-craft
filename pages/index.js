import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { 
  Box, 
  CircularProgress, 
  Backdrop, 
  Snackbar, 
  Alert,
  LinearProgress
} from '@mui/material';
import useMapState from '../hooks/useMapState.js';
import useDataState from '../hooks/useDataState.js';
import useLayerManager from '../hooks/useLayerManager.js';
import { generateSampleData } from '../utils/dataFormatters.js';
import MainLayout from '../components/Layout/MainLayout';
import styles from '../styles/Home.module.css';

// Loading component
const Loading = () => (
  <Backdrop open={true} sx={{ zIndex: 9999 }}>
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        bgcolor: 'background.paper',
        p: 4,
        borderRadius: 2,
        boxShadow: 6,
        maxWidth: 400,
      }}
    >
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress />
      </Box>
      <CircularProgress size={60} thickness={4} />
      <Box sx={{ mt: 2, color: 'text.primary' }}>
        Chargement de MapCraft...
      </Box>
    </Box>
  </Backdrop>
);

// Dynamically import components with SSR disabled
const DeckGLMap = dynamic(() => import('../components/Map/DeckGLMap'), {
  ssr: false,
  loading: () => <Loading />,
});

const AdvancedMapControls = dynamic(() => import('../components/Map/AdvancedMapControls'), {
  ssr: false,
});

const MapLegend = dynamic(() => import('../components/Map/MapLegend'), {
  ssr: false,
});

const LayerSidebar = dynamic(() => import('../components/UI/LayerSidebar'), {
  ssr: false,
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
  const { getVisualizationLayers } = useDataState();
  const { activeLayers } = useLayerManager();
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Initialize the ref at the component level, not inside useEffect
  const loadingAttempted = React.useRef(false);
  
  // Generate layers for deck.gl
  const mapLayers = getVisualizationLayers();
  
  // Load sample data after initial render
  useEffect(() => {
    if (!isDataLoaded && typeof window !== 'undefined' && !loadingAttempted.current) {
      loadingAttempted.current = true;
      
      const { addData } = useDataState.getState();
      
      const timer = setTimeout(async () => {
        try {
          // Generate sample points in France
          const samplePoints = generateSampleData('points', 100);
          await addData(samplePoints, 'Points d\'exemple');
          
          const samplePolygons = generateSampleData('polygons', 15);
          await addData(samplePolygons, 'Zones d\'exemple');
          
          setIsDataLoaded(true);
          setNotification({
            type: 'success',
            message: 'Données d\'exemple chargées avec succès'
          });
        } catch (error) {
          console.error('Error loading sample data:', error);
          setNotification({
            type: 'error',
            message: 'Erreur lors du chargement des données d\'exemple'
          });
          // Mark as loaded anyway to prevent retries
          setIsDataLoaded(true);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isDataLoaded]);
  
  // Handle imported data
  const handleDataImported = (newData) => {
    try {
      const { addData } = useDataState.getState();
      const dataName = newData.name || 'Données importées';
      
      // Better validation
      if (!newData) {
        throw new Error('Données manquantes');
      }
      
      // For GeoJSON format
      if (newData.type === 'FeatureCollection') {
        if (!Array.isArray(newData.features)) {
          throw new Error('Format GeoJSON invalide: features doit être un tableau');
        }
      }
      
      // Add data and handle promise correctly
      addData(newData, dataName)
        .then(() => {
          setNotification({
            type: 'success',
            message: `${dataName} importées avec succès`
          });
          setShowImport(false);
        })
        .catch(error => {
          console.error('Error in addData:', error);
          setNotification({
            type: 'error',
            message: `Erreur lors de l'importation: ${error.message}`
          });
        });
    } catch (error) {
      console.error('Error importing data:', error);
      setNotification({
        type: 'error',
        message: `Erreur lors de l'importation: ${error.message}`
      });
    }
  };
  
  // Close notification
  const handleCloseNotification = () => {
    setNotification(null);
  };
  
  return (
    <>
      <Head>
        <title>MapCraft - Éditeur Cartographique</title>
        <meta name="description" content="Éditeur cartographique avancé avec visualisation et analyse spatiale" />
        <link rel="icon" href="/favicon.ico" />
        <style>{`
          html, body, #__next {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
        `}</style>
      </Head>
      
      <MainLayout
        sidebarContent={
          <LayerSidebar 
            onImportData={() => setShowImport(true)}
            onShowAnalysis={() => setShowAnalysis(true)}
          />
        }
        title="MapCraft Studio"
      >
        <Box className={styles.mapContainer} sx={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Main Map */}
          <DeckGLMap
            layers={mapLayers}
            viewState={viewState}
            onViewStateChange={evt => setViewState(evt.viewState)}
          />
          
          {/* Map Controls */}
          <AdvancedMapControls />
          
          {/* Map Legend */}
          <MapLegend />
          
          {/* Modals and Dialogs */}
          {showAnalysis && (
            <SpatialAnalysis onClose={() => setShowAnalysis(false)} />
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
          
          {/* Notifications */}
          <Snackbar
            open={!!notification}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            {notification && (
              <Alert 
                onClose={handleCloseNotification} 
                severity={notification.type} 
                variant="filled"
                sx={{ width: '100%' }}
              >
                {notification.message}
              </Alert>
            )}
          </Snackbar>
        </Box>
      </MainLayout>
    </>
  );
}