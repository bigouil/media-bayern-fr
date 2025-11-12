import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionTokenEdge } from "./lib/auth/admin-edge";

const ADMIN_LOGIN_PATH = "/admin/login";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== ADMIN_LOGIN_PATH) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    const session = await verifySessionTokenEdge(sessionCookie);

    if (!session) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
