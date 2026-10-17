import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
const scope = "https://games.example/bar-adventures/";
async function worker() {
  const handlers = {},
    stores = new Map();
  let offline = false,
    body = "latest-index",
    claimed = false;
  const key = (x) => (typeof x === "string" ? x : x.url);
  const caches = {
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        match: async (request) => store.get(key(request))?.clone(),
        put: async (request, response) =>
          store.set(key(request), response.clone()),
        addAll: async () => {},
      };
    },
  };
  const self = {
    registration: { scope },
    location: new URL(scope + "sw.js"),
    clients: {
      claim: async () => {
        claimed = true;
      },
    },
    addEventListener: (type, callback) => (handlers[type] = callback),
  };
  vm.runInNewContext(
    await readFile(new URL("../sw.js", import.meta.url), "utf8"),
    {
      self,
      caches,
      URL,
      Response,
      fetch: async () => {
        if (offline) throw Error("Offline");
        return new Response(body);
      },
    },
  );
  const fetch = async (path, mode = "cors", method = "GET") => {
    const pending = [];
    let response;
    handlers.fetch({
      request: { url: new URL(path, scope).href, mode, method },
      respondWith: (p) => (response = p),
      waitUntil: (p) => pending.push(p),
    });
    const result = await response;
    await Promise.all(pending);
    return result;
  };
  return {
    fetch,
    caches,
    setOffline: (value) => (offline = value),
    setBody: (value) => (body = value),
    activate: async () => {
      let done;
      handlers.activate({ waitUntil: (p) => (done = p) });
      await done;
      return claimed;
    },
  };
}
test("home-screen metadata has stable scope, standalone display and correctly sized Bar portraits", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL("../public/manifest.webmanifest", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.id, "./");
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  for (const size of [192, 512]) {
    const icon = manifest.icons.find(
      (icon) => icon.sizes === `${size}x${size}`,
    );
    assert.ok(icon.purpose.includes("any"));
    assert.ok(icon.purpose.includes("maskable"));
    const png = await readFile(
      new URL("../public/" + icon.src, import.meta.url),
    );
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  const apple = await readFile(
    new URL("../public/assets/app-v1/bar-180.png", import.meta.url),
  );
  assert.equal(apple.readUInt32BE(16), 180);
  assert.equal(apple.readUInt32BE(20), 180);
});
test("launch checks for updates, falls back offline, and the adult gallery cannot replace the cached game", async () => {
  const w = await worker();
  assert.equal(await (await w.fetch("./", "navigate")).text(), "latest-index");
  w.setBody("updated-index");
  assert.equal(await (await w.fetch("./", "navigate")).text(), "updated-index");
  assert.equal(await w.fetch("art-gallery.html", "navigate"), undefined);
  w.setOffline(true);
  assert.equal(
    await (await w.fetch("index.html", "navigate")).text(),
    "updated-index",
  );
});
test("cached game resources work offline without intercepting other apps or writes", async () => {
  const w = await worker();
  w.setBody("versioned game module");
  assert.equal(
    await (await w.fetch("src-ab12/app.js")).text(),
    "versioned game module",
  );
  w.setOffline(true);
  assert.equal(
    await (await w.fetch("src-ab12/app.js")).text(),
    "versioned game module",
  );
  assert.equal(
    await w.fetch("https://games.example/another-game/src/app.js"),
    undefined,
  );
  assert.equal(await w.fetch("https://cdn.example/picture.png"), undefined);
  assert.equal(await w.fetch("src-ab12/app.js", "cors", "POST"), undefined);
});
test("activation removes obsolete versions only for this app and claims clients without forcing a reload", async () => {
  const w = await worker(),
    old = "bar-adventures:" + scope + ":old",
    other = "bar-adventures:https://games.example/other/:old";
  await w.caches.open(old);
  await w.caches.open(other);
  assert.equal(await w.activate(), true);
  assert.ok(!(await w.caches.keys()).includes(old));
  assert.ok((await w.caches.keys()).includes(other));
});
