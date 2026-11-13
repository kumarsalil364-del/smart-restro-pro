
const CACHE_NAME = "smart-restro-v1";
const APP_URL = "/smart-restro-pro/";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.add(APP_URL)
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    self.clients.claim()
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, copy)
          );
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        if (event.request.mode === "navigate") {
          return caches.match(APP_URL);
        }

        return new Response("You are offline.", {
          status: 503,
          headers: { "Content-Type": "text/plain" }
        });
      })
  );
});
