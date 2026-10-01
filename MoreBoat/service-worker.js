const CACHE_NAME = 'moreboat-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './three.min.js',
  './icon.svg'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      return cached || fetch(e.request).then(function (res) {
        // кэшируем всё, что загружено с нашего origin
        if (e.request.method === 'GET' && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(e.request, copy);
          });
        }
        return res;
      }).catch(function () {
        // офлайн: если HTML — вернём главную
        if (e.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});