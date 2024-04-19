import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  const { pathname } = req.nextUrl;
  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (pathname.includes("/api/auth") || (token && token.accessTokenExpires)) {
    return NextResponse.next();
  }

  const currentTime = Math.floor(Date.now() / 1000);
  if (
    !token ||
    !token.accessTokenExpires ||
    token.accessTokenExpires < currentTime
  ) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
