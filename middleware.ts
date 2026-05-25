// middleware.ts (root of project)
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/src/lib/auth-edge"

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl

  const token = await auth(req)

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
    if (token.role !== "ADMIN" && token.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // ── Checkout routes ───────────────────────────────────────────────────────
   
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*",],
}