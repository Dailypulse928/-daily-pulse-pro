const CACHE_NAME = 'pulse-pro-v2';

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['/', '/index.html'])));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Never intercept Firebase, Google, or non-GET requests
    const url = event.request.url;
    if (event.request.method !== 'GET') return;
    if (url.includes('firebase') || url.includes('googleapis') || url.includes('gstatic') || url.includes('google')) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                // Only cache valid responses
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                // Clone BEFORE reading — store clone in cache, return original
                const toCache = response.clone();
                caches.open(CACHE_NAME).then(c => c.put(event.request, toCache));
                return response;
            }).catch(() => cached);
        })
    );
});
