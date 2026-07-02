import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// ------------------------------------------------------------
// Precaching otomatis dari Workbox (menggantikan generateSW).
// Baris ini WAJIB ada — Vite/Workbox akan inject daftar file
// yang perlu di-cache ke __WB_MANIFEST saat build.
// ------------------------------------------------------------
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

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
    icon: '/Mu.png',
    badge: '/Mu.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
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
