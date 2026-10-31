const CACHE_NAME = 'edge-tech-davidingalls1-20-v2-EMAIL-515063A7FEE681D9';
const urlsToCache = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
  if(event.request.url.includes('/api/') || event.request.url.includes('/internet')){
    return;
  }
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))));
});
