import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useThemeStore } from '../hooks/useThemeState';
import { createAppTheme } from '../utils/theme';

// Create emotion cache
const clientSideEmotionCache = createCache({ key: 'css' });

function MyApp({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
  const { theme: themeMode } = useThemeStore();
  const [theme, setTheme] = useState(createAppTheme('dark'));
  
  // Update theme when theme mode changes
  useEffect(() => {
    setTheme(createAppTheme(themeMode));
  }, [themeMode]);
  
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MapCraft - Éditeur Cartographique</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </CacheProvider>
  );
}

export default MyApp;