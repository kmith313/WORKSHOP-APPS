const CACHE = 'workshop-apps-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
// apps.json is intentionally NOT cached here: it must always come fresh from the network
// so newly added apps show up immediately for every viewer.

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Only handle same-origin GETs. Everything else (other apps, GitHub API, apps.json) goes straight to network.
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.endsWith('apps.json')) return;
  // Stale-while-revalidate: show the cached copy instantly, refresh it in the background.
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(cached => {
        const network = fetch(req).then(res => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
