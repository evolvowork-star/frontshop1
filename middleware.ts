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
  if (pathname.startsWith("/checkout")) {
    if (!token) {
      const url = new URL("/login", req.url)
      // preserve the package query param so we redirect back correctly
      const pkg = searchParams.get("package")
      const callbackUrl = pkg ? `/checkout?package=${pkg}` : "/checkout"
      url.searchParams.set("callbackUrl", callbackUrl)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/checkout", "/checkout/:path*"],
}