import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import DeckGLMap from '../components/Map/DeckGLMap';
import Sidebar from '../components/UI/Sidebar';
import DataPanel from '../components/UI/DataPanel';
import MapControls from '../components/Map/MapControls';
import { useMapState } from '../hooks/useMapState';
import { useDataState } from '../hooks/useDataState';
import { generateSampleData } from '../utils/dataFormatters';
import styles from '../styles/Home.module.css';

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
    <div className={styles.container}>
      <Head>
        <title>MapCraft - Éditeur Cartographique</title>
        <meta name="description" content="Éditeur cartographique PWA avec deck.gl" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a202c" />
      </Head>

      <main className={styles.main}>
        <Sidebar 
          open={sidebarOpen} 
          setOpen={setSidebarOpen} 
          onDataImported={handleDataImported} 
        />
        
        <div className={styles.mapContainer}>
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
        </div>
      </main>
    </div>
  );
}