import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useThemeStore } from '../hooks/useThemeState';
import { createAppTheme } from '../utils/theme';
import '../styles/globals.css';

// Création du cache Emotion
const clientSideEmotionCache = createCache({ key: 'css' });

// Composant App principal avec contexte global
function MapCraftApp({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
  const { theme: themeMode } = useThemeStore();
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialisation du thème et des données au chargement
  useEffect(() => {
    // Créer le thème
    setTheme(createAppTheme(themeMode));
    
    // Initialiser l'application
    const initApp = async () => {
      try {
        // Charger les préférences utilisateur depuis le stockage local
        if (typeof window !== 'undefined') {
          // Vérifier si l'API IndexedDB est disponible
          if ('indexedDB' in window) {
            console.log('Initialisation du stockage...');
            // Tout est prêt
          } else {
            console.warn('IndexedDB non disponible. Certaines fonctionnalités seront limitées.');
          }
        }
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
      } finally {
        // Marquer l'application comme chargée
        setLoading(false);
      }
    };
    
    initApp();
  }, [themeMode]);
  
  // Afficher un état de chargement si le thème n'est pas prêt
  if (!theme || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        background: '#121212'
      }}>
        <h1 style={{ color: '#ffffff' }}>Chargement de MapCraft...</h1>
      </div>
    );
  }
  
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MapCraft - Éditeur Cartographique</title>
        <meta name="description" content="Éditeur cartographique avancé avec visualisation et analyse spatiale" />
        <meta name="theme-color" content={theme.palette.primary.main} />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MapCraftApp;