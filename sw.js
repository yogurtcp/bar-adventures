// Build substitutes a release fingerprint and an atomic, versioned app shell.
const BUILD = "c606371707882139";
const SHELL = ["./","./index.html","./manifest.webmanifest","./src-6e4bb06d9e45/animal-sound.js","./src-6e4bb06d9e45/animal-view.js","./src-6e4bb06d9e45/animals.css","./src-6e4bb06d9e45/app.js","./src-6e4bb06d9e45/config.js","./src-6e4bb06d9e45/food-sound.js","./src-6e4bb06d9e45/food-view.js","./src-6e4bb06d9e45/food.css","./src-6e4bb06d9e45/install.css","./src-6e4bb06d9e45/install.js","./src-6e4bb06d9e45/journey-model.js","./src-6e4bb06d9e45/pancake-model.js","./src-6e4bb06d9e45/pancake-view.js","./src-6e4bb06d9e45/pancake.css","./src-6e4bb06d9e45/race-art.js","./src-6e4bb06d9e45/race-endings.js","./src-6e4bb06d9e45/race-model.js","./src-6e4bb06d9e45/race-sound.js","./src-6e4bb06d9e45/rocket-model.js","./src-6e4bb06d9e45/rocket-view.js","./src-6e4bb06d9e45/rocket.css","./src-6e4bb06d9e45/style.css","./assets/app-v1/bar-180.png","./assets/app-v1/bar-192.png","./assets/app-v1/bar-512.png","./assets/race-v2/bar.png","./assets/rocket-v1/ship.png","./assets/objects/egg.webp"];
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
