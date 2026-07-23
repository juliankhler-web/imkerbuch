/* ImkerBuch Service Worker – Offline-Fähigkeit
   Strategie: HTML-Seite NETWORK-FIRST (online immer frisch → Updates erscheinen
   sofort, offline aus Cache), übrige App-Dateien stale-while-revalidate,
   CDN-Bibliotheken cache-first (versionierte URLs), APIs network-only. */
const CACHE = 'imkerbuch-v101';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-180.png', './impressum.html', './datenschutz.html', './agb.html',
  // selbst gehostete Bibliotheken (PDF/Excel/QR) – einmal geladen = komplett offline nutzbar
  './libs/jspdf.umd.min.js', './libs/jspdf.plugin.autotable.min.js', './libs/pdf.min.js', './libs/pdf.worker.min.js', './libs/qrcode.min.js', './libs/xlsx.full.min.js'];
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

/* Klick auf eine Erinnerung: App fokussieren und zum passenden Bereich springen
   (Aufgaben-Erinnerung → Aufgaben, Sicherungs-Meldung → Einstellungen) */
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const ziel = (e.notification.data && e.notification.data.ziel) || '/aufgaben';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const app = list.find((c) => 'focus' in c);
      if (app) { app.navigate(app.url.split('#')[0] + '#' + ziel).catch(() => {}); return app.focus(); }
      return self.clients.openWindow('./#' + ziel);
    })
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (BYPASS_HOSTS.some((h) => url.hostname.endsWith(h))) return; // network-only
  // Testbetrieb nie cachen: Testseite und App-unter-Test immer frisch laden
  if (url.pathname.includes('/tests/') || url.searchParams.has('testdb')) return;
  // Das SW-Skript selbst nie über den SW ausliefern (Browser aktualisiert es direkt)
  if (url.pathname.endsWith('service-worker.js')) return;

  if (url.origin === location.origin) {
    const istSeite = e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('/index.html');
    if (istSeite) {
      // HTML: NETWORK-FIRST – online immer die neueste Version, offline aus dem Cache.
      // Löst „ich lade hoch, aber die App zeigt weiter das Alte“.
      e.respondWith(
        fetch(e.request)
          .then((res) => {
            if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); }
            return res;
          })
          .catch(() => caches.match(e.request).then((c) => c || caches.match('./index.html') || caches.match('./')))
      );
    } else {
      // übrige App-Dateien (Icons, Manifest, Rechtsseiten): stale-while-revalidate
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
    }
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
