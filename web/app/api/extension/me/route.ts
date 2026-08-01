import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-api";

// GET /api/extension/me — verifies a session or extension bearer token and
// returns the account identity shown in the Chrome side panel.
export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
    },
  });
}
