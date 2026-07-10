/* ImkerBuch Service Worker – Offline-Fähigkeit
   Strategie: App-Shell cache-first mit Hintergrund-Update,
   CDN-Bibliotheken cache-first (versionierte URLs), APIs network-only. */
const CACHE = 'imkerbuch-v059';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png', './impressum.html', './datenschutz.html', './agb.html'];
// CDN-Hosts, deren Antworten dauerhaft gecacht werden (Bibliotheken, unveränderlich versioniert)
const CDN_HOSTS = ['cdn.sheetjs.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com'];
// Hosts, die NIE gecacht werden (Live-Daten bzw. eigenes Caching der Bibliothek)
const BYPASS_HOSTS = ['api.open-meteo.com', 'huggingface.co', 'cdn-lfs.huggingface.co', 'cas-bridge.xethub.hf.co'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Klick auf eine Erinnerung: App fokussieren und zu den Aufgaben springen */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const app = list.find((c) => 'focus' in c);
      if (app) { app.navigate(app.url.split('#')[0] + '#/aufgaben').catch(() => {}); return app.focus(); }
      return self.clients.openWindow('./#/aufgaben');
    })
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (BYPASS_HOSTS.some((h) => url.hostname.endsWith(h))) return; // network-only
  // Testbetrieb nie cachen: Testseite und App-unter-Test immer frisch laden
  if (url.pathname.includes('/tests/') || url.searchParams.has('testdb')) return;

  if (url.origin === location.origin) {
    // App-Shell: cache-first, im Hintergrund aktualisieren (stale-while-revalidate)
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fresh = fetch(e.request)
          .then((res) => {
            if (res && res.ok) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
            return res;
          })
          .catch(() => cached);
        return cached || fresh;
      })
    );
  } else if (CDN_HOSTS.some((h) => url.hostname.endsWith(h))) {
    // Bibliotheken: cache-first, einmal geladen = offline verfügbar
    e.respondWith(
      caches.match(e.request).then(
        (cached) =>
          cached ||
          fetch(e.request).then((res) => {
            if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then((c) => c.put(e.request, res.clone()));
            return res;
          })
      )
    );
  }
});
