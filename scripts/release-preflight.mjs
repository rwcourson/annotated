import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productionUrl = "https://annotated-social.vercel.app";
const checks = [];

function check(name, pass, detail) {
  checks.push({ name, pass: Boolean(pass), detail });
}

function text(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function pngSize(relativePath) {
  const bytes = readFileSync(path.join(root, relativePath));
  if (bytes.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const sourceDefault = text("extension/shared.js");
check(
  "Extension source uses production URL",
  sourceDefault.includes(`var DEFAULT_BASE_URL = '${productionUrl}';`),
  productionUrl,
);

const zipRelative = "release/annotated-extension-v0.1.0.zip";
const zipPath = path.join(root, zipRelative);
check("Extension ZIP exists", existsSync(zipPath), zipRelative);
if (existsSync(zipPath)) {
  const packagedShared = execFileSync(
    "unzip",
    ["-p", zipPath, "annotated-extension-v0.1.0/shared.js"],
    { encoding: "utf8" },
  );
  check(
    "Packaged extension uses production URL",
    packagedShared.includes(`var DEFAULT_BASE_URL = "${productionUrl}";`),
    productionUrl,
  );
}

for (const screenshot of [
  "release/screenshots/annotated-home-1280x800.png",
  "release/screenshots/annotated-feed-1280x800.png",
]) {
  const size = existsSync(path.join(root, screenshot)) ? pngSize(screenshot) : null;
  check(
    `Store screenshot ${path.basename(screenshot)}`,
    size?.width === 1280 && size?.height === 800,
    size ? `${size.width}x${size.height}` : "missing",
  );
}

const privacy = text("PRIVACY.md");
check(
  "Privacy support contact filled",
  !privacy.includes("Replace this section") && /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(privacy),
  "Replace the placeholder with the approved public support email",
);

check(
  "Neon production provider",
  process.env.DATABASE_PROVIDER === "postgresql" && /^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL ?? ""),
  "DATABASE_PROVIDER=postgresql and a Postgres DATABASE_URL",
);
check(
  "Hosted audio storage",
  Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  "BLOB_READ_WRITE_TOKEN",
);
check(
  "Production auth origin",
  process.env.AUTH_URL === productionUrl && process.env.NEXTAUTH_URL === productionUrl,
  "AUTH_URL and NEXTAUTH_URL must match the canonical HTTPS site",
);
check(
  "OAuth credentials",
  ["AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "AUTH_TWITTER_ID", "AUTH_TWITTER_SECRET"].every(
    (key) => Boolean(process.env[key]),
  ),
  "Google, X, and Auth.js production secrets",
);

const qualityDecision = text("release/240P_DECISION.md");
check(
  "Actual 240p delivery verified",
  /^Status:\s*verified\s*$/im.test(qualityDecision),
  "Document the approved delivery/transcode evidence before changing Status",
);

const e2eResults = text("release/E2E_RESULTS.md");
check(
  "Physical Chrome E2E complete",
  !/- \[ \]/.test(e2eResults),
  "Complete every checkbox using the staged release extension",
);

check(
  "Public demo video ready",
  /^https:\/\//.test(process.env.DEMO_VIDEO_URL ?? ""),
  "DEMO_VIDEO_URL",
);

console.log("Annotated release preflight\n");
for (const item of checks) {
  console.log(`${item.pass ? "PASS" : "FAIL"}  ${item.name} — ${item.detail}`);
}

const failed = checks.filter((item) => !item.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} release gates passed.`);
if (failed.length) {
  console.error("Release is not ready. Nothing was deployed or submitted.");
  process.exitCode = 1;
}
