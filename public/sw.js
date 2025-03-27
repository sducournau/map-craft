// Fixed fetch event handler with better error handling
self.addEventListener('fetch', event => {
  // Skip non-GET requests and certain URLs
  if (event.request.method !== 'GET' || 
      event.request.url.includes('/api/') || 
      event.request.url.includes('chrome-extension://') || 
      event.request.url.includes('maps.') || 
      event.request.url.includes('tiles.')) {
    return;
  }
  
  // For HTML requests, use network-first strategy
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }
        
        // Fallback to network
        return fetch(event.request)
          .then(response => {
            // Clone the response to cache it
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
            return response;
          })
          .catch(error => {
            console.error('Fetch error:', error);
            // Return appropriate fallback based on request type
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/i)) {
              return new Response('', { 
                status: 200, 
                statusText: 'OK',
                headers: {'Content-Type': 'image/svg+xml'} 
              });
            }
            return new Response('Network error', { 
              status: 408,
              headers: {'Content-Type': 'text/plain'}
            });
          });
      })
  );
});