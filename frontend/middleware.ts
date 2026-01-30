import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("ff_session_id");
  const { pathname } = request.nextUrl;

  if (!session && pathname !== "/login")
    return NextResponse.redirect(new URL("/login", request.url));

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 작동할 경로 설정
export const config = {
  matcher: ["/login", "/home", "/"],
};
