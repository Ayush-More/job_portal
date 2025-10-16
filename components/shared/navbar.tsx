"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Briefcase, LogOut, User, Sparkles } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="sticky top-0 z-40 border-b-2 border-[var(--brand-200)] bg-gradient-to-r from-white/80 via-[var(--brand-50)]/80 to-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.7)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2 hover:opacity-80 transition-all duration-200">
            <div className="relative">
              <Briefcase className="h-6 w-6 text-[var(--brand-600)] group-hover:scale-110 transition-transform duration-300 animate-bounce-subtle" />
              <Sparkles className="h-3 w-3 text-[var(--accent-500)] absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-brand">JobPortal Pro</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-shimmer rounded-lg" />
            ) : session ? (
              <>
                <Link href="/jobs">
                  <Button variant="ghost" className="rounded-[var(--radius-md)]">Browse Jobs</Button>
                </Link>
                
                <Link href={`/dashboard/${session.user.role.toLowerCase().replace("_", "-")}`}>
                  <Button variant="ghost" className="rounded-[var(--radius-md)]">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  className="rounded-[var(--radius-md)] border-[var(--brand-300)] hover:border-[var(--brand-500)]"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/jobs">
                  <Button variant="ghost" className="rounded-[var(--radius-md)]">Browse Jobs</Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-[var(--radius-md)]">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-[var(--radius-md)] bg-gradient-to-r from-[var(--brand-600)] to-[var(--secondary-500)] text-white hover:shadow-lg hover:shadow-[rgba(168,85,247,0.4)]">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

