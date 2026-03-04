import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_PATHS } from "./types/paths";

export function proxy(request: NextRequest) {
  const session = request.cookies.get("ff_session_id");
  const { pathname } = request.nextUrl;

  if (!session && !PUBLIC_PATHS.includes(pathname))
    return NextResponse.redirect(new URL("/login", request.url));

  if (session && pathname === "/login")
    return NextResponse.redirect(new URL("/home", request.url));

  return NextResponse.next();
}

export const config = {
  /*
   * 아래 경로를 제외한 모든 요청에 미들웨어 적용:
   * 1. api (API 경로)
   * 2. _next/static (정적 파일)
   * 3. _next/image (이미지 최적화 파일)
   * 4. favicon.ico (메타 파일)
   * 5. json, css, png, jpg, jpeg, svg, webp, woff, woff2 (정적 파일)
   * https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:json|css|png|jpg|jpeg|svg|webp|woff2?)$).*)",
  ],
};
