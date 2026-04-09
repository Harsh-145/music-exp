const staticDevCoffee = "web-harmonium-v2";
const assets = [
  "/",
  "/index.html",
  "/webharmonium.html",
  "/harmonium-kannan-orig.wav"
];

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== staticDevCoffee)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", fetchEvent => {
  if (fetchEvent.request.mode === "navigate" || fetchEvent.request.destination === "document") {
    fetchEvent.respondWith(
      fetch(fetchEvent.request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(staticDevCoffee).then(cache => cache.put(fetchEvent.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(fetchEvent.request).then(res => res || caches.match("/index.html")))
    );
    return;
  }

  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request);
    })
  );
});