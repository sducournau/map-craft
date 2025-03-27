// Cette version du service worker est prévue pour être gérée par next-pwa
// next-pwa fait le gros du travail, mais nous ajoutons quelques personnalisations

const CACHE_NAME = 'mapcraft-cache-v1';

// Les ressources à mettre en cache de manière proactive
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
];

// Installation: mise en cache proactive
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activation: nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name.startsWith('mapcraft-'))
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Stratégie de cache: network-first avec fallback vers le cache
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non GET et les requêtes à des API externes
  if (event.request.method !== 'GET' || 
      event.request.url.includes('/api/') || 
      event.request.url.includes('maps.') || 
      event.request.url.includes('tiles.')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre en cache les nouvelles ressources
        const responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Si offline, essayer de servir depuis le cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Retourner une page d'erreur offline si disponible
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            
            return new Response('Offline et non disponible en cache.');
          });
      })
  );
});