import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const project = fileURLToPath(new URL("../", import.meta.url));
const site = fileURLToPath(new URL("../dist/", import.meta.url));
const repository = "yogurtcp/bar-adventures";
const run = (command, args, options = {}) =>
  execFileSync(command, args, { cwd: project, encoding: "utf8", ...options });
run("npm", ["test"], { stdio: "inherit" });
run("npm", ["run", "build"], { stdio: "inherit" });
const work = mkdtempSync(join(tmpdir(), "bar-pages-"));
try {
  // An isolated index builds the Pages commit without changing the checkout.
  const env = {
    ...process.env,
    GIT_DIR: join(project, ".git"),
    GIT_WORK_TREE: site,
    GIT_INDEX_FILE: join(work, "index"),
  };
  const git = (args) => run("git", args, { cwd: site, env });
  const parentArgs = [];
  if (run("git", ["ls-remote", "--heads", "origin", "gh-pages"]).trim()) {
    run("git", ["fetch", "origin", "gh-pages"], { stdio: "inherit" });
    parentArgs.push("-p", run("git", ["rev-parse", "FETCH_HEAD"]).trim());
  }
  git(["read-tree", "--empty"]);
  git(["add", "--all", "--force"]);
  const tree = git(["write-tree"]).trim();
  const revision = run("git", ["rev-parse", "--short", "HEAD"]).trim();
  const commit = git([
    "commit-tree",
    tree,
    ...parentArgs,
    "-m",
    `Deploy game ${revision}`,
  ]).trim();
  run("git", ["push", "origin", `${commit}:refs/heads/gh-pages`], {
    stdio: "inherit",
  });
  const configuration = {
    build_type: "legacy",
    source: { branch: "gh-pages", path: "/" },
  };
  run(
    "gh",
    ["api", "--method", "PUT", `repos/${repository}/pages`, "--input", "-"],
    { input: JSON.stringify(configuration) },
  );
  run("gh", ["api", "--method", "POST", `repos/${repository}/pages/builds`]);
  console.log(
    "Deployment submitted: https://yogurtcp.github.io/bar-adventures/",
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
