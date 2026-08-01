import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";
import { prisma } from "@/lib/db";

// POST /api/annotations/[id]/claim — auth optional. Body: { reason, contact? }
// The "File a claim" fair-use dispute endpoint.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (!reason || reason.length > 5000) {
    return NextResponse.json(
      { error: "reason is required (max 5000 chars)" },
      { status: 400 }
    );
  }
  const contact =
    typeof body.contact === "string" && body.contact.trim()
      ? body.contact.trim()
      : null;

  const annotation = await prisma.annotation.findUnique({ where: { id } });
  if (!annotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getAuthUser(req);

  const claim = await prisma.claim.create({
    data: { annotationId: id, userId: user?.id ?? null, reason, contact },
  });

  return NextResponse.json(
    { claim: { id: claim.id, createdAt: claim.createdAt.toISOString() } },
    { status: 201 }
  );
}
