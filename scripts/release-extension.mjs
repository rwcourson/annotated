import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionRoot = path.join(repoRoot, "extension");
const releaseRoot = path.join(repoRoot, "release");
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, "").split("=");
    return [key, value.join("=")];
  }),
);

const siteUrl = (args["site-url"] || process.env.ANNOTATED_SITE_URL || "").replace(/\/+$/, "");
if (!siteUrl) {
  throw new Error("Pass --site-url=https://your-production-domain.example");
}
const parsedSiteUrl = new URL(siteUrl);
if (parsedSiteUrl.protocol !== "https:") {
  throw new Error("Release site URL must use HTTPS");
}

const manifest = JSON.parse(await readFile(path.join(extensionRoot, "manifest.json"), "utf8"));
const version = args.version || manifest.version;
const packageName = `annotated-extension-v${version}`;
const stageDir = path.join(releaseRoot, packageName);
const zipPath = path.join(releaseRoot, `${packageName}.zip`);

await rm(stageDir, { recursive: true, force: true });
await rm(zipPath, { force: true });
await mkdir(stageDir, { recursive: true });

for (const entry of [
  "background.js",
  "content.js",
  "manifest.json",
  "shared.js",
  "sidepanel.css",
  "sidepanel.html",
  "sidepanel.js",
  "assets",
  "icons",
]) {
  await cp(path.join(extensionRoot, entry), path.join(stageDir, entry), { recursive: true });
}

const sharedPath = path.join(stageDir, "shared.js");
const shared = await readFile(sharedPath, "utf8");
await writeFile(
  sharedPath,
  shared.replace(
    /var DEFAULT_BASE_URL = (?:'[^']*'|"[^"]*");/,
    `var DEFAULT_BASE_URL = ${JSON.stringify(siteUrl)};`,
  ),
);

manifest.version = version;
await writeFile(path.join(stageDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

execFileSync("zip", ["-q", "-r", zipPath, packageName], {
  cwd: releaseRoot,
  stdio: "inherit",
});

console.log(`Release package: ${zipPath}`);
console.log(`Production origin: ${siteUrl}`);
