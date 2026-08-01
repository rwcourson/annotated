import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeAnnotation } from "@/lib/serialize";

// GET /api/feed — public, newest first.
export async function GET() {
  const annotations = await prisma.annotation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: true,
      _count: { select: { comments: true, claims: true } },
    },
  });

  const authorIds = [...new Set(annotations.map((a) => a.userId))];
  const followGroups = await prisma.follow.groupBy({
    by: ["followeeId"],
    where: { followeeId: { in: authorIds } },
    _count: { _all: true },
  });
  const followersByAuthor = new Map(
    followGroups.map((g) => [g.followeeId, g._count._all])
  );

  return NextResponse.json({
    annotations: annotations.map((a) =>
      serializeAnnotation(a, {
        commentCount: a._count.comments,
        claimCount: a._count.claims,
        followers: followersByAuthor.get(a.userId) ?? 0,
      })
    ),
  });
}
