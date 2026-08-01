import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/db";
import { serializeAuthor } from "@/lib/serialize";

// POST /api/annotations/[id]/comments — auth. Body: { text }
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 2000) {
    return NextResponse.json(
      { error: "text is required (max 2000 chars)" },
      { status: 400 }
    );
  }

  const annotation = await prisma.annotation.findUnique({ where: { id } });
  if (!annotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { annotationId: id, userId: user.id, text },
    include: { user: true },
  });

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt.toISOString(),
        author: serializeAuthor(comment.user),
      },
    },
    { status: 201 }
  );
}
