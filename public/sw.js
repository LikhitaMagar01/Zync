// Service Worker for PWA functionality
const CACHE_NAME = 'zync-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/chatOne.ico',
  '/icons/icon-144.png',
  '/icons/icon-192.png',
  '/icons/icon-256.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
  '/apple-touch-icon-57x57.png',
  '/apple-touch-icon-60x60.png',
  '/apple-touch-icon-72x72.png',
  '/apple-touch-icon-76x76.png',
  '/apple-touch-icon-114x114.png',
  '/apple-touch-icon-120x120.png',
  '/apple-touch-icon-144x144.png',
  '/apple-touch-icon-152x152.png',
  '/apple-touch-icon-180x180.png',
  '/apple-touch-icon-57x57-precomposed.png',
  '/apple-touch-icon-60x60-precomposed.png',
  '/apple-touch-icon-72x72-precomposed.png',
  '/apple-touch-icon-76x76-precomposed.png',
  '/apple-touch-icon-114x114-precomposed.png',
  '/apple-touch-icon-120x120-precomposed.png',
  '/apple-touch-icon-144x144-precomposed.png',
  '/apple-touch-icon-152x152-precomposed.png',
  '/apple-touch-icon-180x180-precomposed.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
