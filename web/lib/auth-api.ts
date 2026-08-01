import type { User } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/**
 * Shared auth for every mutating / "me"-scoped API route.
 * Accepts EITHER an Auth.js session cookie OR `Authorization: Bearer <api-token>`
 * (the token minted on /connect for the Chrome extension).
 */
export async function getAuthUser(request: Request): Promise<User | null> {
  const header = request.headers.get("authorization");
  if (header?.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    if (token) {
      const apiToken = await prisma.apiToken.findUnique({
        where: { token },
        include: { user: true },
      });
      if (apiToken) return apiToken.user;
    }
  }

  const session = await auth();
  if (session?.user?.id) {
    return prisma.user.findUnique({ where: { id: session.user.id } });
  }
  return null;
}
