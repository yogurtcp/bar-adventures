import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const project = new URL("../", import.meta.url);
const output = new URL("dist/", project);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of ["index.html", "art-gallery.html", "src"]) {
  await cp(new URL(file, project), new URL(file, output), { recursive: true });
}
await cp(new URL("public/assets/", project), new URL("assets/", output), {
  recursive: true,
});
await writeFile(new URL(".nojekyll", output), "");
console.log("Static site built in dist/.");
