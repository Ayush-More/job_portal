"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Briefcase, LogOut, User } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--color-border)]/60 backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.6)] dark:supports-[backdrop-filter]:bg-[color:rgba(15,23,42,0.6)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-[var(--brand-600)] group-hover:scale-105 transition" />
            <span className="text-xl font-semibold tracking-tight text-[var(--heading)]">JobPortal Pro</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
            ) : session ? (
              <>
                <Link href="/jobs">
                  <Button variant="ghost" className="rounded-[var(--radius-sm)]">Browse Jobs</Button>
                </Link>
                
                <Link href={`/dashboard/${session.user.role.toLowerCase().replace("_", "-")}`}>
                  <Button variant="ghost" className="rounded-[var(--radius-sm)]">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                
                <Button
                  variant="outline"
                  className="rounded-[var(--radius-sm)] border-[var(--color-border)] hover:border-[var(--brand-500)]"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/jobs">
                  <Button variant="ghost" className="rounded-[var(--radius-sm)]">Browse Jobs</Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-[var(--radius-sm)]">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-[var(--radius-sm)] bg-[var(--brand-600)] hover:bg-[var(--brand-700)]">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

