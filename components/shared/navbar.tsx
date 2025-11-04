"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  Briefcase, 
  LogOut, 
  User, 
  Sparkles, 
  Menu, 
  X,
  Home,
  Globe,
  Building2,
  UserPlus,
  HelpCircle,
  LogIn,
  UserCheck,
  ChevronDown
} from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isIndustryOpen, setIsIndustryOpen] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Check if user is a company user
  const isCompanyUser = session?.user?.role === "COMPANY"

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    const handleResize = () => {
      // For company users, close at lg breakpoint (1024px), for others at md breakpoint (768px)
      const breakpoint = isCompanyUser ? 1024 : 768
      if (window.innerWidth >= breakpoint) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isCompanyUser])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" })
        const data = await res.json()
        if (res.ok) {
          setCategories((data?.categories || []).map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
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

  // Get WhatsApp URL
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971502697904"
  const whatsappMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Hello! I need help with Ittihad Placement."
  const formattedPhone = whatsappPhone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  const getDashboardPath = () => {
    if (session?.user) {
      const role = session.user.role.toLowerCase().replace("_", "-")
      return `/dashboard/${role}`
    }
    return "/dashboard"
  }

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

          {/* Desktop Navigation - Hidden for company users on screens < lg, hidden for others on screens < md */}
          <div className={`hidden ${isCompanyUser ? "lg:flex" : "md:flex"} items-center gap-1 sm:gap-3`}>
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

          {/* Mobile Menu Button - Show on mobile for all users, and on desktop for company users */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`${isCompanyUser ? "lg:hidden" : "md:hidden"} p-2 rounded-md text-[var(--brand-600)] hover:bg-[var(--brand-50)] transition-colors`}
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

    {/* Mobile Sidebar - Show on mobile for all users, and on desktop for company users */}
    <div
      className={`fixed inset-0 z-[10001] ${isCompanyUser ? "lg:hidden" : "md:hidden"} transition-opacity duration-300 ${
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Home (Dashboard) */}
            <Link
              href={getDashboardPath()}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
            >
              <Home className="mr-3 h-5 w-5" />
              Home (Dashboard)
            </Link>

            {/* Language EN */}
            <button
              onClick={(e) => {
                e.preventDefault()
                // Language selector functionality can be added here
              }}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium text-left"
            >
              <Globe className="mr-3 h-5 w-5" />
              Language EN
            </button>

            {/* Industry dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsIndustryOpen(!isIndustryOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
              >
                <div className="flex items-center">
                  <Building2 className="mr-3 h-5 w-5" />
                  Industry
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isIndustryOpen ? "rotate-180" : ""}`} />
              </button>
              {isIndustryOpen && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-4">
                  {loadingCategories ? (
                    <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                  ) : categories.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">No categories available</div>
                  ) : (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/jobs?category=${encodeURIComponent(category.name)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-[var(--brand-600)] hover:bg-gray-50 rounded transition-colors"
                      >
                        {category.name}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Hire - Only show for company users */}
            {session?.user?.role === "COMPANY" && (
              <Link
                href="/dashboard/company/jobs/new"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
              >
                <UserPlus className="mr-3 h-5 w-5" />
                Hire
              </Link>
            )}

            {/* Find work (Browse job) */}
            <Link
              href="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
            >
              <Briefcase className="mr-3 h-5 w-5" />
              Find work
            </Link>

            {/* Help center */}
            <button
              onClick={(e) => {
                e.preventDefault()
                handleWhatsAppClick()
              }}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium text-left"
            >
              <HelpCircle className="mr-3 h-5 w-5" />
              Help center
            </button>

            {/* Login - Only show if not logged in */}
            {!session && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
              >
                <LogIn className="mr-3 h-5 w-5" />
                Login
              </Link>
            )}

            {/* Registration - Only show if not logged in */}
            {!session && (
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
              >
                <UserCheck className="mr-3 h-5 w-5" />
                Registration
              </Link>
            )}

            {/* Company registration - Only show if not logged in */}
            {!session && (
              <Link
                href="/register?role=COMPANY"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-[var(--brand-50)] transition-colors font-medium"
              >
                <Building2 className="mr-3 h-5 w-5" />
                Company registration
              </Link>
            )}

            {/* Sign Out - Only show if logged in */}
            {session && (
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
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

