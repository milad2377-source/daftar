```javascript
// نام کش برای ذخیره فایل‌های برنامه جهت اجرای آفلاین
const CACHE_NAME = 'rikad-cache-v33';

// فهرست فایل‌های اصلی برنامه
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

// مرحله نصب سرویس‌ورکر و ذخیره فایل‌ها در حافظه کش
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(ASSETS_TO_CACHE.map(function(url) {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(function() {
        return self.skipWaiting();
      })
  );
});

// مرحله فعال‌سازی و پاک کردن کش‌های قدیمی
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys()
      .then(function(keys) {
        return Promise.all(
          keys.filter(function(key) {
            return key !== CACHE_NAME;
          }).map(function(key) {
            return caches.delete(key);
          })
        );
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

// مدیریت درخواست‌های شبکه (پاسخ‌دهی آفلاین و به‌روزرسانی در پس‌زمینه)
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== location.origin) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(function(cachedResponse) {
      const networkFetch = fetch(event.request, { cache: 'no-cache' })
        .then(function(networkResponse) {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(function() {
          return cachedResponse;
        });

      return cachedResponse || networkFetch;
    })
  );
});

```
