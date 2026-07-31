const CACHE_NAME = 'nutrizionistaai-v7';
const FONT_CACHE = 'nutrizionistaai-fonts-v1';

// App shell: tutto cio che serve per far partire l'app anche senza rete.
// Include index.html cosi la primissima apertura offline funziona comunque.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/icon-512-monochrome.png',
  './icons/icon-apple-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch((err) => console.warn('[SW] precache parziale:', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== FONT_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // Solo GET va gestito/cacheato
  if (req.method !== 'GET') return;

  // Le chiamate a Gemini vanno sempre e solo in rete, mai in cache
  if (url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Google Fonts (foglio CSS + file dei font): cache-first in una cache dedicata,
  // cosi la tipografia funziona anche offline dopo il primo caricamento online.
  if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req)
            .then((res) => {
              cache.put(req, res.clone()).catch(() => {});
              return res;
            })
            .catch(() => cached);
        })
      )
    );
    return;
  }

  // La pagina HTML (navigazioni + index.html): network-first,
  // cosi ogni aggiornamento pubblicato su GitHub arriva subito.
  // La cache (e come ultimo fallback index.html) copre la modalita offline.
  const isHTML = req.mode === 'navigate' || url.endsWith('index.html') || url.endsWith('/');
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Altri asset statici same-origin (icone, manifest): cache-first, cambiano raramente
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone)).catch(() => {});
        return res;
      });
    })
  );
});
