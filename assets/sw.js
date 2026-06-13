const CACHE_NAME = 'mn-smart-cache-v1';

// 1. INSTALL: Take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
});

// 2. ACTIVATE: Clean old caches & Claim Control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(), // <--- CRITICAL FIX: Controls the page on 1st visit
      caches.keys().then((keys) => Promise.all(
        keys.map((key) => {
          if (!key.includes(CACHE_NAME)) return caches.delete(key);
        })
      ))
    ])
  );
});

// 3. LISTEN FOR COMMANDS: Receive the list of images to cache
self.addEventListener('message', (event) => {
  if (event.data.action === 'CACHE_SPECIFIC_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        // Download them quietly in the background
        return Promise.allSettled(
          urls.map(url => fetch(url, { mode: 'no-cors' }).then(res => cache.put(url, res)))
        );
      })
    );
  }
});

// 4. FETCH: Serve from Cache if available
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' || event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});