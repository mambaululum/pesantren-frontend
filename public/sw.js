const CACHE_NAME = 'mambaul-ulum-v1';
const urlsToCache = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

// ✅ TAMBAHAN: Terima push dari server
self.addEventListener('push', e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Notifikasi Baru', {
      body: data.body || '',
      icon: '/Mu.png',
      badge: '/Mu.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' }
    })
  );
});

// ✅ TAMBAHAN: Klik notifikasi → buka app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});