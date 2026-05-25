import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session-constants";
import { isSessionTokenValidForMiddleware } from "@/lib/auth/session-middleware";

const PROTECTED_PREFIXES = ["/sell", "/seller/inbox"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = token ? await isSessionTokenValidForMiddleware(token) : false;

  if (!valid) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sell", "/sell/:path*", "/seller/inbox", "/seller/inbox/:path*"],
};
