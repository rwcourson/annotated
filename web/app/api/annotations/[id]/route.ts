import { NextResponse } from "next/server";
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
