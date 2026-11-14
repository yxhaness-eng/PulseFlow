// PulseFlow Service Worker — Multi-Strategy Cache & PWA Capabilities
const STATIC_CACHE = 'pulseflow-static-v1.1.0';
const RUNTIME_CACHE = 'pulseflow-runtime-v1.1.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

// Установка: предварительное кэширование основного shell приложения
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Активация: удаление устаревших версий кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Роутинг запросов с дифференцированными стратегиями кэширования
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Игнорируем не-GET запросы и схемы браузерных расширений (chrome-extension:// и т.д.)
  if (request.method !== 'GET' || !request.url.startsWith('http')) return;

  // 1. Навигационные запросы (HTML shell): NetworkFirst с оффлайн-фоллбэком на index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match('./index.html');
          if (fallback) return fallback;
          return caches.match('./');
        })
    );
    return;
  }

  // 2. Статические ресурсы (CSS, JS, Fonts, Images): CacheFirst со Stale-While-Revalidate
  const isStatic = ['style', 'script', 'font', 'image'].includes(request.destination) ||
    PRECACHE_ASSETS.some((asset) => request.url.endsWith(asset.replace('./', '')));

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Прочие запросы: NetworkFirst с динамическим RUNTIME_CACHE
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(request))
  );
});

// Клик по уведомлению: фокусировка существующего окна или открытие нового
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});

// Обработка ручного пропуска ожидания
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
