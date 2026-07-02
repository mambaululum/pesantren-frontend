const CACHE_NAME = 'mambaul-ulum-v1';
const urlsToCache = ['/'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

// ------------------------------------------------------------
// PUSH NOTIFICATION
// Terima push dari server (webpush.sendNotification di admin.js)
// dan tampilkan sebagai notifikasi di HP user.
// ------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = { title: 'Notifikasi', body: 'Ada pemberitahuan baru' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || '',
    icon: '/Mu.png',        // sesuaikan path icon PWA kamu
    badge: '/Mu.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' }, // dipakai saat notif diklik
    tag: data.tag || 'default',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi', options)
  );
});

// ------------------------------------------------------------
// Saat notifikasi diklik, buka/fokuskan tab aplikasi
// ------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});