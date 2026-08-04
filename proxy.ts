import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/auth/session";

// Only /login (and its own sub-paths, if any) is public. Everything else
// requires a valid session cookie.
const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (isPublicPath(pathname)) {
    // Already logged in? Skip the login page.
    if (session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Runs on every route except static assets / image optimization / favicon,
// which never need auth and must always load.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
