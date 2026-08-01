import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const envText = readFileSync(new URL("../.env", import.meta.url), "utf8");
const values = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const at = line.indexOf("=");
      const key = line.slice(0, at);
      let value = line.slice(at + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      return [key, value];
    }),
);

const productionUrl = "https://annotated-social.vercel.app";
const productionValues = {
  AUTH_SECRET: values.AUTH_SECRET,
  AUTH_GOOGLE_ID: values.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: values.AUTH_GOOGLE_SECRET,
  AUTH_TWITTER_ID: values.AUTH_TWITTER_ID,
  AUTH_TWITTER_SECRET: values.AUTH_TWITTER_SECRET,
  AUTH_URL: productionUrl,
  NEXTAUTH_URL: productionUrl,
  AUTH_TRUST_HOST: "true",
  NEXT_PUBLIC_SITE_URL: productionUrl,
};

for (const [key, value] of Object.entries(productionValues)) {
  if (!value) throw new Error(`${key} is missing`);
  const result = spawnSync("vercel", ["env", "add", key, "production", "--force"], {
    input: value,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.status !== 0) {
    throw new Error(`Could not set ${key}: ${result.stderr || result.stdout}`);
  }
  console.log(`set ${key}`);
}
