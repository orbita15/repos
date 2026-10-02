/* ============================================================
   Service Worker для "Безграничное море"
   Кэширует все файлы игры → работает офлайн
   ============================================================ */

const CACHE_NAME = 'moreboat-v3';

// Все файлы, которые нужны игре
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './three.min.js',
  './johnson.js',
  './icon.svg'
];

/* ---------- INSTALL: скачиваем и кэшируем всё ---------- */
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('[SW] Кэширую файлы игры...');
        return cache.addAll(ASSETS);
      })
      .then(function () {
        // Активируемся сразу, не ждём закрытия всех вкладок
        return self.skipWaiting();
      })
      .catch(function (err) {
        console.error('[SW] Ошибка кэширования:', err);
      })
  );
});

/* ---------- ACTIVATE: чистим старые кэши ---------- */
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) {
              console.log('[SW] Удаляю старый кэш:', key);
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        // Берём под контроль все открытые страницы
        return self.clients.claim();
      })
  );
});

/* ---------- FETCH: сначала кэш, потом сеть ---------- */
self.addEventListener('fetch', function (event) {
  // Игнорируем не-GET запросы
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(function (cached) {
        // 1) Есть в кэше — отдаём моментально
        if (cached) return cached;

        // 2) Нет — идём в сеть
        return fetch(event.request)
          .then(function (response) {
            // Кэшируем успешные ответы с нашего origin
            if (response && response.status === 200 &&
                event.request.url.indexOf(self.location.origin) === 0) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, copy);
              });
            }
            return response;
          })
          .catch(function () {
            // 3) Офлайн: если запрашивают HTML — вернём главную
            const accept = event.request.headers.get('accept') || '';
            if (accept.indexOf('text/html') !== -1) {
              return caches.match('./index.html');
            }
            // Иначе — тихо провалимся
            return new Response('', { status: 408, statusText: 'Offline' });
          });
      })
  );
});

/* ---------- Сообщения от страницы (например, force-update) ---------- */
self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});