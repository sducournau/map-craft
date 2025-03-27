const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
  });
  
  module.exports = withPWA({
    reactStrictMode: true,
    webpack: (config) => {
      // Corrections pour les modules qui dépendent de 'fs'
      config.resolve.fallback = {
        ...config.resolve.alias['mapbox-gl'] = 'maplibre-gl',
        fs: false,
        path: false,
        crypto: false
      };
  
      return config;
    }
  });