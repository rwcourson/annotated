/* Generates the extension icons: the warm coral-to-lilac annotated mark
 * with a white center on a transparent background.
 * Pure Node — no dependencies; encodes PNG with raw zlib.
 *
 * Usage: node scripts/make-icons.mjs
 */
import zlib from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'icons');

/* ---------- CRC32 ---------- */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed), 0);
  return Buffer.concat([len, typed, crc]);
}

/* ---------- orb pixel shader ---------- */
function orbPixel(size, x, y) {
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const R = size * 0.4;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist <= R) {
    const t = dist / R;
    const blend = Math.min(1, Math.max(0, (x + y) / (size * 2)));
    let r = Math.round(255 * (1 - blend) + 119 * blend);
    let g = Math.round(98 * (1 - blend) + 101 * blend);
    let b = Math.round(72 * (1 - blend) + 255 * blend);
    const softHighlight = Math.max(0, 1 - Math.hypot(x - size * 0.32, y - size * 0.28) / (size * 0.38)) ** 2 * 0.48;
    r = Math.min(255, Math.round(r + (255 - r) * softHighlight));
    g = Math.min(255, Math.round(g + (255 - g) * softHighlight));
    b = Math.min(255, Math.round(b + (255 - b) * softHighlight));
    if (dist < R * 0.3) [r, g, b] = [255, 255, 255];
    const edge = Math.min(1, Math.max(0, (R - dist) / Math.max(1, size * 0.02)));
    return [r, g, b, Math.round(255 * edge)];
  }

  const falloff = Math.exp(-(dist - R) / (size * 0.11));
  if (falloff < 0.01) return [0, 0, 0, 0];
  return [155, 118, 243, Math.round(90 * falloff)];
}

/* ---------- PNG encode ---------- */
function encodePng(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const stride = size * 4 + 1;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = orbPixel(size, x, y);
      const o = y * stride + 1 + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(outDir, { recursive: true });
for (const size of [16, 48, 128]) {
  const file = join(outDir, `icon${size}.png`);
  writeFileSync(file, encodePng(size));
  console.log(`wrote ${file}`);
}
