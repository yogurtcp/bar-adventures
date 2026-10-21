// Build substitutes a release fingerprint and an atomic, versioned app shell.
const BUILD = "8cf45455f9e35bb4";
const SHELL = ["./","./index.html","./manifest.webmanifest","./src-cea29029f859/animal-sound.js","./src-cea29029f859/animal-view.js","./src-cea29029f859/animals.css","./src-cea29029f859/app.js","./src-cea29029f859/config.js","./src-cea29029f859/explore-model.js","./src-cea29029f859/explore-view.js","./src-cea29029f859/explore.css","./src-cea29029f859/food-sound.js","./src-cea29029f859/food-view.js","./src-cea29029f859/food.css","./src-cea29029f859/icecream-model.js","./src-cea29029f859/icecream-view.js","./src-cea29029f859/icecream.css","./src-cea29029f859/install.css","./src-cea29029f859/install.js","./src-cea29029f859/journey-model.js","./src-cea29029f859/pancake-model.js","./src-cea29029f859/pancake-view.js","./src-cea29029f859/pancake.css","./src-cea29029f859/race-art.js","./src-cea29029f859/race-endings.js","./src-cea29029f859/race-model.js","./src-cea29029f859/race-sound.js","./src-cea29029f859/rocket-model.js","./src-cea29029f859/rocket-view.js","./src-cea29029f859/rocket.css","./src-cea29029f859/style.css","./src-cea29029f859/trails-view.js","./src-cea29029f859/trails.css","./assets/app-v1/bar-180.png","./assets/app-v1/bar-192.png","./assets/app-v1/bar-512.png","./assets/race-v2/bar.png","./assets/rocket-v1/ship.png","./assets/objects/egg.webp","./assets/icecream-v1/bar.png","./assets/explore-v1/fishing.png","./assets/explore-v1/balloon.png","./assets/explore-v1/fish.png"];
const BASE = self.registration.scope;
const PREFIX = `bar-adventures:${BASE}:`;
const CACHE = `${PREFIX}${BUILD}`;
const HOME = new URL("./", BASE).href;
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(SHELL.map((path) => new URL(path, BASE).href)),
      ),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    !url.href.startsWith(BASE)
  )
    return;
  // Navigation checks the network first so new releases are visible on launch.
  // Saved progress lives in localStorage and is never touched by this cache.
  if (request.mode === "navigate") {
    if (
      url.pathname !== new URL(HOME).pathname &&
      url.pathname !== new URL("index.html", BASE).pathname
    )
      return;
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(HOME, response.clone());
            return response;
          }
          const cached = await cache.match(HOME);
          return cached || response;
        } catch {
          const cached = await cache.match(HOME);
          return cached || Response.error();
        }
      })(),
    );
    return;
  }
  const path = url.pathname.slice(new URL(BASE).pathname.length);
  if (!/^(assets\/|src(?:-[a-f0-9]+)?\/|manifest\.webmanifest$)/.test(path))
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE),
        cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok)
        event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
      return response;
    })(),
  );
});
