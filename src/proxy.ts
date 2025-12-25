import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isAdminRoute = pathname.startsWith("/admin");
  const isManagerRoute = pathname.startsWith("/manager");

  // 1. Protected Routes: If no token, redirect to login
  if ((isAdminRoute || isManagerRoute) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Auth Routes: If token exists, redirect to dashboard (or root specific dashboard)
  // We don't know the role here easily, so we send to root / which will handle it
  // OR we can just send to a generic dashboard landing if we had one.
  // User asked: "dont go to login page directly".
  if ((pathname === "/login" || pathname === "/register") && token) {
    return NextResponse.redirect(new URL("/admin/triage", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/login", "/register"],
};
