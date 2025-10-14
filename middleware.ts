import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const path = req.nextUrl.pathname

  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = req.auth.user?.role

  // Admin routes
  if (path.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Company routes
  if (path.startsWith("/dashboard/company") && role !== "COMPANY") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Job seeker routes
  if (path.startsWith("/dashboard/job-seeker") && role !== "JOB_SEEKER") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
}

