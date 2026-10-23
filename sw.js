// Service worker: lets the installed app open offline.
// Network first: when online you always get the newest files (and they're saved for later);
// offline, the saved copy is used. Only this app's own files are handled.
// When adding a file to the app, add it to APP_FILES so it's available offline from the first visit.

const CACHE = 'shifty-v2';

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/tokens.css',
  'css/styles.css',
  'assets/images/icon.svg',
  'assets/images/icon-192.png',
  'assets/images/icon-512.png',
  'assets/images/apple-touch-icon.png',
  'js/app.js',
  'js/dates.js',
  'js/deductions.js',
  'js/dom.js',
  'js/format.js',
  'js/icons.js',
  'js/live-time.js',
  'js/pay-calc.js',
  'js/router.js',
  'js/shifts.js',
  'js/storage.js',
  'js/tabbar.js',
  'js/tips-estimate.js',
  'js/view-month.js',
  'js/components/completed-shifts.js',
  'js/components/day-panel.js',
  'js/components/money-card.js',
  'js/components/month-grid.js',
  'js/components/period-nav.js',
  'js/components/save-field.js',
  'js/components/shift-badge.js',
  'js/components/so-far.js',
  'js/components/week-list.js',
  'js/print/print.js',
  'js/print/summary.js',
  'js/screens/calendar.js',
  'js/screens/home.js',
  'js/screens/pay.js',
  'js/screens/shift-form.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting()),
  );
});

// Remove caches from older versions of this service worker.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;
        // Offline page loads (any #/route) fall back to the app's page.
        if (request.mode === 'navigate') return caches.match('index.html');
        return Response.error();
      }),
  );
});
