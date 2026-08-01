import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/db";
import { serializeAnnotation } from "@/lib/serialize";
import { clipWindowError, isValidHttpUrl } from "@/lib/utils";

const TYPES = new Set(["article", "video", "audio"]);

// POST /api/annotations — auth (session cookie OR Bearer token).
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

  const { type, sourceUrl, title } = body;
  if (typeof type !== "string" || !TYPES.has(type)) {
    return NextResponse.json(
      { error: 'type must be one of "article" | "video" | "audio"' },
      { status: 400 }
    );
  }
  if (typeof sourceUrl !== "string" || !isValidHttpUrl(sourceUrl)) {
    return NextResponse.json(
      { error: "sourceUrl is required and must be a valid http(s) URL" },
      { status: 400 }
    );
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  let startSec: number | null = null;
  let endSec: number | null = null;
  let mediaUrl: string | null = null;
  if (type === "video" || type === "audio") {
    const err = clipWindowError(body.startSec, body.endSec);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    startSec = body.startSec as number;
    endSec = body.endSec as number;
    if (typeof body.mediaUrl === "string" && body.mediaUrl.trim()) {
      if (!isValidHttpUrl(body.mediaUrl)) {
        return NextResponse.json(
          { error: "mediaUrl must be a valid http(s) URL" },
          { status: 400 }
        );
      }
      mediaUrl = body.mediaUrl.trim();
    }
  }

  let publishedAt: Date | null = null;
  if (typeof body.publishedAt === "string" && body.publishedAt) {
    const d = new Date(body.publishedAt);
    if (isNaN(d.getTime())) {
      return NextResponse.json(
        { error: "publishedAt must be a valid date" },
        { status: 400 }
      );
    }
    publishedAt = d;
  }

  const str = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  const annotation = await prisma.annotation.create({
    data: {
      userId: user.id,
      type,
      sourceUrl,
      mediaUrl,
      title: title.trim(),
      siteName: str(body.siteName),
      author: str(body.author),
      publishedAt,
      quote: str(body.quote),
      startSec,
      endSec,
      comment: str(body.comment),
      commentAudioUrl: str(body.commentAudioUrl),
    },
    include: { user: true },
  });

  return NextResponse.json(
    { annotation: serializeAnnotation(annotation) },
    { status: 201 }
  );
}
