/* Denov Kindergarden PWA service worker */
const CACHE = 'bogcham-v14';
const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css?v=20260904a',
  '/app.js?v=20260904d',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

/* Yangi dastur fayllari (JS/CSS/HTML) har doim tarmoqdan olinadi */
const NETWORK_FIRST = (u) => {
  return /\.(js|css)(\?v=.*)?$/.test(u) || u === '/' || u === '/index.html' || u === '/landing' || u === '/landing.html';
};

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;

  if (e.request.mode === 'navigate') {
    // SPA navigation — tarmoqdan, muvaffaqiyatsiz bo'lsa kesh
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put('/', copy));
          return r;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  if (NETWORK_FIRST(url.pathname)) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          if (r && r.status === 200) {
            const copy = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Rasm, ikonkla va boshqa statik — keshdan, keyin yangilash
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetched = fetch(e.request)
        .then(r => {
          if (r && r.status === 200) {
            const copy = r.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return r;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
