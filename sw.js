const CACHE = 'app-repo-v1';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];
// apps.json is intentionally NOT cached here — it must always be fetched fresh
// from the network so newly added apps show up immediately for every viewer.

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
  // Never intercept the apps data file or GitHub API calls — always go to network
  // so newly added/edited/deleted apps show up immediately.
  if (e.request.url.includes('apps.json') || e.request.url.includes('api.github.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});
