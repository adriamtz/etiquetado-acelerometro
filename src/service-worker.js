/* === src/service-worker.js === */
// Service worker simple per cache d'actius estàtics (no és una solució completa Workbox, però útil per PWA bàsica)
const CACHE_NAME = 'etiquetado-cache-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/styles.css',
  '/logo-dark.png'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(()=>{})
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  )
})
/* === end src/service-worker.js === */
