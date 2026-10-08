/* A deliberately narrow offline fallback. Never cache merchant records. */
const CACHE_NAME = "dukaanset-public-v1";
const PUBLIC_ASSETS = ["/offline.html", "/icon.svg", "/manifest.webmanifest", "/brand/icon-192.png", "/brand/icon-512.png", "/brand/maskable-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PUBLIC_ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("dukaanset-public-") && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (event.request.mode === "navigate") {
    // Network only: no authenticated HTML, customer data or financial responses enter Cache Storage.
    event.respondWith(fetch(event.request).catch(async () => (await caches.match("/offline.html")) || new Response("You are offline. Reconnect to open DukaanSet. No business records have been cached.", { headers: { "Content-Type": "text/plain; charset=utf-8" } })));
    return;
  }
  if (PUBLIC_ASSETS.includes(url.pathname) && !url.search) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
