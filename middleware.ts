import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith("/dashboard/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Company routes
    if (path.startsWith("/dashboard/company") && token?.role !== "COMPANY") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Job seeker routes
    if (path.startsWith("/dashboard/job-seeker") && token?.role !== "JOB_SEEKER") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
}

