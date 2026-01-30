import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("ff_session_id");
  const { pathname } = request.nextUrl;

  if (!session && pathname !== "/login")
    return NextResponse.redirect(new URL("/login", request.url));

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/home", "/"],
};
