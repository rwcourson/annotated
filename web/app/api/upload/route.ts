import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_MIME: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "video/webm": "webm",
};

// POST /api/upload — auth. Production writes to Vercel Blob. Local
// development retains a filesystem fallback for zero-credential setup.
export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
  const match = dataUrl.match(/^data:([a-z0-9/-]+);base64,(.+)$/is);
  if (!match) {
    return NextResponse.json(
      { error: "dataUrl must be a base64 data URL" },
      { status: 400 }
    );
  }
  const mime = match[1].toLowerCase();
  const ext = EXT_BY_MIME[mime];
  if (!ext) {
    return NextResponse.json(
      { error: `unsupported media type "${mime}"` },
      { status: 400 }
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(match[2], "base64");
  } catch {
    return NextResponse.json({ error: "invalid base64" }, { status: 400 });
  }
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "file must be between 1 byte and 5MB" },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`audio/commentary/${user.id}/${filename}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: mime,
      cacheControlMaxAge: 31_536_000,
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Hosted audio storage is not configured" },
      { status: 503 }
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
