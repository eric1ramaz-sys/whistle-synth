const CACHE_NAME = 'whistlesynth-v5-satchmo';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './qr_whistle.png',
  './samples/trumpet_manifest.json',
  './samples/open_53.mp3',
  './samples/open_57.mp3',
  './samples/open_60.mp3',
  './samples/open_63.mp3',
  './samples/open_67.mp3',
  './samples/open_70.mp3',
  './samples/open_74.mp3',
  './samples/open_77.mp3',
  './samples/open_81.mp3',
  './samples/open_84.mp3',
  './samples/ballad_53.mp3',
  './samples/ballad_57.mp3',
  './samples/ballad_60.mp3',
  './samples/ballad_63.mp3',
  './samples/ballad_65.mp3',
  './samples/ballad_67.mp3',
  './samples/ballad_70.mp3',
  './samples/ballad_74.mp3',
  './samples/ballad_77.mp3',
  './samples/ballad_81.mp3',
  './samples/ballad_84.mp3',
  './samples/muted_58.mp3',
  './samples/muted_60.mp3',
  './samples/muted_63.mp3',
  './samples/muted_68.mp3',
  './samples/muted_70.mp3',
  './samples/muted_74.mp3',
  './samples/muted_77.mp3',
  './samples/muted_81.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Navigation request (loading the app page)
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html') || caches.match('./'))
    );
    return;
  }

  // Static assets & audio samples (cache-first with network fallback)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
