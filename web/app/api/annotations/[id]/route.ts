import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/db";
import { serializeAnnotation } from "@/lib/serialize";

// GET /api/annotations/[id] — public; includes author, comments, claim count.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const annotation = await prisma.annotation.findUnique({
    where: { id },
    include: {
      user: true,
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: true },
      },
      _count: { select: { comments: true, claims: true } },
    },
  });

  if (!annotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const followers = await prisma.follow.count({
    where: { followeeId: annotation.userId },
  });

  return NextResponse.json({
    annotation: serializeAnnotation(annotation, {
      commentCount: annotation._count.comments,
      claimCount: annotation._count.claims,
      followers,
      comments: annotation.comments,
    }),
  });
}

// DELETE /api/annotations/[id] — auth; only the annotation owner may delete.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const annotation = await prisma.annotation.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!annotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (annotation.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.annotation.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
