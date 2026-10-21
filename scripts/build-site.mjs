import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const project = new URL("../", import.meta.url);
const output = new URL("dist/", project);
const hash = createHash("sha256");
async function fingerprint(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const path = new URL(
      entry.name + (entry.isDirectory() ? "/" : ""),
      directory,
    );
    hash.update(entry.name);
    if (entry.isDirectory()) await fingerprint(path);
    else hash.update(await readFile(path));
  }
}
await fingerprint(new URL("src/", project));
const sourceFolder = `src-${hash.digest("hex").slice(0, 12)}`;
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
// Version all modules and CSS together so a tablet cannot combine old cached
// modules with a newly deployed entry point. Generated image URLs stay stable.
const html = (
  await readFile(new URL("index.html", project), "utf8")
).replaceAll("./src/", `./${sourceFolder}/`);
await writeFile(new URL("index.html", output), html);
await cp(
  new URL("art-gallery.html", project),
  new URL("art-gallery.html", output),
);
await cp(new URL("src/", project), new URL(`${sourceFolder}/`, output), {
  recursive: true,
});
await cp(new URL("public/assets/", project), new URL("assets/", output), {
  recursive: true,
});
await cp(
  new URL("public/manifest.webmanifest", project),
  new URL("manifest.webmanifest", output),
);
const worker = await readFile(new URL("sw.js", project), "utf8");
const manifest = await readFile(
  new URL("public/manifest.webmanifest", project),
);
const releaseHash = createHash("sha256")
  .update(sourceFolder)
  .update(html)
  .update(manifest)
  .update(worker);
for (const size of [180, 192, 512])
  releaseHash.update(
    await readFile(new URL(`public/assets/app-v1/bar-${size}.png`, project)),
  );
const release = releaseHash.digest("hex").slice(0, 16);
const shell = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  ...(await readdir(new URL("src/", project)))
    .filter((name) => /\.(js|css)$/.test(name))
    .map((name) => `./${sourceFolder}/${name}`),
  ...[180, 192, 512].map((size) => `./assets/app-v1/bar-${size}.png`),
  "./assets/race-v2/bar.png",
  "./assets/rocket-v1/ship.png",
  "./assets/objects/egg.webp",
  "./assets/icecream-v1/bar.png",
  ...["fishing", "balloon", "fish"].map(
    (name) => `./assets/explore-v1/${name}.png`,
  ),
];
await writeFile(
  new URL("sw.js", output),
  worker
    .replace('/* __BUILD__ */ "development"', JSON.stringify(release))
    .replace("/* __SHELL__ */ []", JSON.stringify(shell)),
);
await writeFile(new URL(".nojekyll", output), "");
console.log(`Static site built in dist/ (${sourceFolder}).`);
