/* Linux Omnibus — offline cache (app shell + içerik + CDN varlıkları) */
const CACHE = 'linux-omnibus-v2';
const APP_SHELL = [
  './index.html',
  './app.js',
  './content.js',
  './content-more.js',
  './tracks.js',
  './interview.js',
  './encyclopedia.js',
  './encyclopedia-more.js',
  './encyclopedia-devops.js',
  './kali-arsenal.js',
  './kali-deep.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './og-image.jpg',
  './robots.txt',
  './sitemap.xml'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.all(
        APP_SHELL.map((url) => cache.add(url).catch(() => { /* tek dosya başarısız olsa kurulumu bozma */ }))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: false });
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && (req.url.startsWith(self.location.origin) || isCdn(req.url))) {
            cache.put(req, res.clone()).catch(() => {});
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

function isCdn(url) {
  return /cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url);
}
