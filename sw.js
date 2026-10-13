// GFD offline helper. Always asks GitHub for the newest files first (skipping the browser's stored copy),
// so a new version shows up straight away. Falls back to the last copy we saw when there's no signal.
const CACHE = 'gfd-v5';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;   // fonts, Supabase etc. go straight to the network
  e.respondWith(fetch(req.url, {cache: 'no-cache', credentials: 'same-origin'}).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('./'))));
});
