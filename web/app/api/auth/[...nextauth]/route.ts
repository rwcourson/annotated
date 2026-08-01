import { handlers } from "@/auth";
import { NextRequest } from "next/server";

/**
 * Keep the OAuth authorization and code-exchange redirect URI byte-for-byte
 * identical. Auth providers reject a code when a reverse proxy or local host
 * alias causes Auth.js to rebuild the callback on a different origin.
 */
function canonicalRequest(request: NextRequest) {
  const configured = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
  if (!configured) return request;

  const requestUrl = new URL(request.url);
  const configuredUrl = new URL(configured);
  if (requestUrl.origin === configuredUrl.origin) return request;

  requestUrl.protocol = configuredUrl.protocol;
  requestUrl.host = configuredUrl.host;
  return new NextRequest(requestUrl, request);
}

export function GET(request: NextRequest) {
  return handlers.GET(canonicalRequest(request));
}

export function POST(request: NextRequest) {
  return handlers.POST(canonicalRequest(request));
}
