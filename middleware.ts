import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Skip middleware for public routes
  const publicRoutes = [
    "/",
    "/login", 
    "/register",
    "/about",
    "/jobs",
    "/api/auth",
    "/api/upload",
    "/api/payments/webhook"
  ]
  
  const isPublicRoute = publicRoutes.some(route => 
    path === route || path.startsWith(route)
  )
  
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // For protected routes, redirect to login
  // The actual auth check will be done in the page components
  const token = req.cookies.get("authjs.session-token") || req.cookies.get("__Secure-authjs.session-token")
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
}

