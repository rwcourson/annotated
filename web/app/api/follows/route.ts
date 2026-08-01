import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/db";

// POST /api/follows — auth. Body: { userId }. Toggles follow.
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
  const userId = typeof body.userId === "string" ? body.userId : null;
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (userId === user.id) {
    return NextResponse.json(
      { error: "you cannot follow yourself" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const key = { followerId: user.id, followeeId: userId };
  const existing = await prisma.follow.findUnique({
    where: { followerId_followeeId: key },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followeeId: key },
    });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: key });
  return NextResponse.json({ following: true });
}
