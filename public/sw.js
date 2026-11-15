/**
 * Service Worker de CanopIA (v3 - Purga total de Workbox Precache)
 *
 * Elimina cualquier caché de `workbox-precache` que retenía chunks viejos
 * (como `804-e08c3ca512e299d6.js`) e impedía ver los nuevos deploys en producción.
 */

const SW_VERSION = 'canopia-sw-v3';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      } catch (err) {
        // Ignorar errores de limpieza de caché
      }
      await self.clients.claim();
    })()
  );
});
