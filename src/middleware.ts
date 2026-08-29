import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Fixed 2026-08-29 (SEC-07, docs/audit/04-security-authz.md): the JWT is stored in localStorage
// (see lib/auth/token-storage.ts — a deliberate, documented trade-off, not something this change
// reverses) with no depth-of-defense against a future XSS bug reading it out. This adds the
// Content-Security-Policy Next.js itself documents for the App Router (nonce-based, since App
// Router's RSC-streaming inline scripts need *some* script-src allowance — Next.js reads the nonce
// back out of this same header to tag its own injected scripts, no manual wiring needed beyond
// this middleware). script-src stays strict (no 'unsafe-inline'/'unsafe-eval'); style-src allows
// 'unsafe-inline' only, since inline `style={{...}}` is used in a few components and CSS injection
// alone can't execute script.
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  // React uses eval() in development to reconstruct server-side error stacks in the browser
  // console — not used in production builds, per Next.js's own CSP guide.
  const isDev = process.env.NODE_ENV === "development";

  const apiOrigin = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "").origin;
    } catch {
      return "";
    }
  })();

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  // Skip static assets and image optimization — the CSP only needs to apply to documents/RSC
  // payloads that can actually render script.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
