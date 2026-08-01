import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// GET /api/extension/token — session auth only (used by the /connect page).
// Returns the user's extension API token, creating one if missing.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.apiToken.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  if (existing) {
    return NextResponse.json({ token: existing.token });
  }

  const created = await prisma.apiToken.create({
    data: {
      userId: session.user.id,
      token: `ant_${randomBytes(24).toString("hex")}`,
    },
  });
  return NextResponse.json({ token: created.token });
}
