// Build substitutes a release fingerprint and an atomic, versioned app shell.
const BUILD = /* __BUILD__ */ "development";
const SHELL = /* __SHELL__ */ [];
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
