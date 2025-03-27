const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});
const path = require('path');

module.exports = withPWA({
  reactStrictMode: true,
  webpack: (config) => {
    // Corrections pour les modules qui dépendent de 'fs'
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false
    };
    
    // Définir correctement l'alias pour mapbox-gl et le préfixe @
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'maplibre-gl',
      '@': path.resolve(__dirname)
    };

    return config;
  }
});