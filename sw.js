// Service Worker MathEdu
// Strategi: NETWORK-FIRST, bukan cache-first.
// Alasan: aplikasi ini sering diperbarui dan datanya (Firebase) selalu live,
// jadi versi terbaru dari internet harus selalu diutamakan. Cache hanya
// dipakai sebagai cadangan kalau perangkat benar-benar tanpa koneksi.
// Setiap kali index.html diperbarui dan di-deploy ulang ke GitHub, tidak perlu
// mengubah apa pun di file ini - versi terbaru akan otomatis diambil selama
// perangkat siswa terhubung internet.

const CACHE_NAME = 'mathedu-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
