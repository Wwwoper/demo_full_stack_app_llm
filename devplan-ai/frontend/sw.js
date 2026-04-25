const CACHE_NAME = 'devplan-v1';
const ASSETS_TO_CACHE = [
  '/static/index.html',
  '/static/style.css',
  '/static/app.js',
  '/manifest.json'
];

// Установка Service Worker и кэширование активов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Кэширование активов');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Активация Service Worker и очистка старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов: сначала кэш, потом сеть (offline-first для статики)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Для API-запросов — только сеть
  if (request.url.includes('/tasks') || request.url.includes('/tools') || request.url.includes('/health')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Если сеть недоступна, возвращаем ошибку с информацией об офлайн-режиме
        return new Response(JSON.stringify({ error: 'offline', message: 'Нет подключения к серверу. Работаем в офлайн-режиме.' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Для статики — стратегия Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        // Клонируем ответ, чтобы сохранить в кэш
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      // Если ничего не найдено, возвращаем index.html для SPA
      return caches.match('/static/index.html');
    })
  );
});

// Синхронизация данных при восстановлении соединения (опционально)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  // Логика синхронизации отложенных действий
  console.log('[ServiceWorker] Синхронизация задач');
}
