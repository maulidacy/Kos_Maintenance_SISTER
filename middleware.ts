import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const payload = verifyJwt(token);
  if (!payload) return NextResponse.redirect(new URL("/login", req.url));

  // admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/reports", req.url));
    }
  }

  // teknisi routes
  if (req.nextUrl.pathname.startsWith("/teknisi")) {
    if (payload.role !== "TEKNISI") {
      return NextResponse.redirect(new URL("/reports", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teknisi/:path*"],
};
