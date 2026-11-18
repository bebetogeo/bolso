const CACHE = 'bolso-v2.1.2';
const ATIVOS = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './manifest.webmanifest',
  './icons/mask.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ATIVOS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Rede primeiro para sempre pegar atualizações; cai no cache se estiver offline.
  // 'no-cache' faz o navegador confirmar com o servidor (o GitHub Pages manda max-age=600, e sem isso
  // uma versão nova só aparecia depois de até 10 minutos).
  const naRede = req.mode === 'navigate'
    ? new Request(req.url, { cache: 'no-cache' })
    : new Request(req, { cache: 'no-cache' });
  event.respondWith(
    fetch(naRede)
      .then(res => {
        if (res && res.status === 200) {
          const copia = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(cached => cached || caches.match('./index.html')))
  );
});
