import { createServer } from "node:http";
import { createReadStream, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp",
  ".png": "image/png",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://local").pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (pathname.includes("\0")) {
    res.writeHead(400).end();
    return;
  }
  const allowed =
    pathname === "/" ||
    pathname === "/art-gallery.html" ||
    pathname.startsWith("/assets/") ||
    (pathname.startsWith("/src/") &&
      [".js", ".css"].includes(extname(pathname)));
  if (!allowed) {
    res.writeHead(404).end();
    return;
  }
  const file =
    pathname === "/"
      ? resolve(root, "index.html")
      : pathname.startsWith("/assets/")
        ? resolve(root, "public", `.${pathname}`)
        : resolve(root, `.${pathname}`);
  if (!file.startsWith(root + sep)) {
    res.writeHead(404).end();
    return;
  }
  let stat;
  try {
    stat = statSync(file, { throwIfNoEntry: false });
  } catch {
    res.writeHead(404).end();
    return;
  }
  if (!stat?.isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, {
    "Content-Type": mime[extname(file)] || "application/octet-stream",
    "Content-Length": stat.size,
    "Cache-Control": "no-cache",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") {
    res.end();
    return;
  }
  const stream = createReadStream(file);
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}).listen(Number(process.env.PORT || 4173), "0.0.0.0", () =>
  console.log(
    `Bar’s Race ready at http://localhost:${process.env.PORT || 4173}`,
  ),
);
