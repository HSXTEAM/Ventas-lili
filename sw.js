const CACHE_NAME = 'ventas-lili-v1';
const ASSETS_TO_CACHE = [
  './app.html',
  './manifest.json'
];

// Instalación: Cachar archivos esenciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('PWA: Archivos cacheados correctamente');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activación: Limpiar cachés antiguos si actualizamos la app
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('PWA: Borrando caché antiguo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Interceptar peticiones
self.addEventListener('fetch', event => {
  // Ignorar peticiones a Supabase para garantizar datos en tiempo real
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // Estrategia Network-First para el resto de la app
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
