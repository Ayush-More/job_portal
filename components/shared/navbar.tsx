"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Briefcase, LogOut, User, Sparkles, Menu, X } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMobileMenuOpen])

  return (
    <>
    <nav className="sticky top-0 z-[10000] border-b-2 border-[var(--brand-200)] bg-gradient-to-r from-white/80 via-[var(--brand-50)]/80 to-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.7)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center space-x-2 hover:opacity-80 transition-all duration-200">
            <div className="relative">
              <Briefcase className="h-6 w-6 text-[var(--brand-600)] group-hover:scale-110 transition-transform duration-300 animate-bounce-subtle" />
              <Sparkles className="h-3 w-3 text-[var(--accent-500)] absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-brand">Ittihad Placement</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 sm:gap-3">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-[var(--brand-600)] hover:bg-[var(--brand-50)] transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Sidebar (outside nav to avoid containing block clipping) */}
    <div
      className={`fixed inset-0 z-[10001] md:hidden transition-opacity duration-300 ${
        isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--brand-200)]">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Briefcase className="h-6 w-6 text-[var(--brand-600)]" />
                <Sparkles className="h-3 w-3 text-[var(--accent-500)] absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-brand">Ittihad Placement</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {status === "loading" ? (
              <div className="space-y-4">
                <div className="h-12 w-full animate-shimmer rounded-lg" />
                <div className="h-12 w-full animate-shimmer rounded-lg" />
                <div className="h-12 w-full animate-shimmer rounded-lg" />
              </div>
            ) : session ? (
              <div className="space-y-2">
                <Link
                  href="/jobs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
                >
                  <Briefcase className="mr-3 h-5 w-5" />
                  Browse Jobs
                </Link>
                
                <Link
                  href={`/dashboard/${session.user.role.toLowerCase().replace("_", "-")}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
                >
                  <User className="mr-3 h-5 w-5" />
                  Dashboard
                </Link>
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    signOut({ callbackUrl: "/" })
                  }}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/jobs"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
                >
                  <Briefcase className="mr-3 h-5 w-5" />
                  Browse Jobs
                </Link>
                
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
                >
                  <User className="mr-3 h-5 w-5" />
                  Sign In
                </Link>
                
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--brand-600)] to-[var(--secondary-500)] text-white hover:shadow-lg hover:shadow-[rgba(168,85,247,0.4)] transition-all font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

