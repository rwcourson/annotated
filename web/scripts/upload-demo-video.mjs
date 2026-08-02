import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const input = process.argv[2];
if (!input) {
  throw new Error("Usage: npm run demo:upload -- /absolute/path/to/demo.mp4");
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN is required");
}

const filePath = path.resolve(input);
const extension = path.extname(filePath).toLowerCase();
const contentTypes = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};
const contentType = contentTypes[extension];
if (!contentType) {
  throw new Error("Demo video must be .mp4, .webm, or .mov");
}

const info = await stat(filePath);
if (!info.isFile() || info.size === 0) {
  throw new Error("Demo video is missing or empty");
}

const body = await readFile(filePath);
const uploaded = await put(`demo/annotated-bounty-demo${extension}`, body, {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType,
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

console.log(uploaded.url);
