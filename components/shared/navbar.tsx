"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  Briefcase,
  LogOut,
  User,
  Menu,
  X,
  Home,
  Globe,
  Building2,
  UserPlus,
  HelpCircle,
  LogIn,
  UserCheck,
  ChevronDown,
  MapPin,
  Mail,
  Phone,
  Settings
} from "lucide-react"
import { ThemeToggle } from "@/components/shared/theme-toggle"

declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: any
  }
}

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isIndustryOpen, setIsIndustryOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isTranslateLoaded, setIsTranslateLoaded] = useState(false)

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

  // Load Google Translate widget
  useEffect(() => {
    if (typeof window === "undefined" || isTranslateLoaded) return

    const initTranslate = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ar",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        )
        setIsTranslateLoaded(true)
      }
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = initTranslate
      const script = document.createElement("script")
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      script.async = true
      document.body.appendChild(script)
    } else {
      initTranslate()
    }

    return () => {
      // no cleanup needed
    }
  }, [isTranslateLoaded])

  // Get WhatsApp URL
  const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971502697904"
  const whatsappMessage = process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE || "Hello! I need help with Ittihad Placement."
  const formattedPhone = whatsappPhone.replace(/\D/g, "")
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(whatsappMessage)}`

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  const handleLanguageSwitch = (lang: "en" | "ar") => {
    const combo = document.querySelector("select.goog-te-combo") as HTMLSelectElement | null
    if (!combo) {
      // Retry shortly in case the widget hasn't rendered yet
      setTimeout(() => handleLanguageSwitch(lang), 300)
      return
    }
    combo.value = lang
    combo.dispatchEvent(new Event("change", { bubbles: true }))
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
    <div
      id="google_translate_element"
      className="pointer-events-none absolute -left-[9999px] -top-[9999px] opacity-0"
      aria-hidden="true"
    />
    <nav className="sticky top-0 z-[10000] border-b-2 border-[var(--brand-200)] dark:border-[var(--border)] bg-gradient-to-r from-white/80 via-[var(--brand-50)]/80 to-white/80 dark:from-[var(--surface)]/90 dark:via-[var(--surface-muted)]/90 dark:to-[var(--surface)]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[color:rgba(255,255,255,0.7)] dark:supports-[backdrop-filter]:bg-[color:rgba(26,31,58,0.8)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center space-x-4 hover:opacity-80 transition-all duration-200">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
              <Image
                src="/Ittihad Placement Logo.png"
                alt="Ittihad Placement logo"
                fill
                sizes="(max-width: 768px) 48px, 56px"
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-brand leading-tight">
              Ittihad Placement
            </span>
          </Link>

          {/* Desktop Navigation - Hidden for company users on screens < lg, hidden for others on screens < md */}
          <div className={`hidden ${isCompanyUser ? "lg:flex" : "md:flex"} items-center gap-1 sm:gap-3`}>
            {status === "loading" ? (
              <>
                <div className="h-8 w-24 animate-shimmer rounded-lg" />
                <ThemeToggle />
              </>
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
                
                <Link href="/profile/settings">
                  <Button variant="ghost" className="rounded-[var(--radius-md)]">
                    <Settings className="mr-2 h-4 w-4" />
                    My Profile
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
                <ThemeToggle />
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
                <ThemeToggle />
              </>
            )}
          </div>

          {/* Mobile Menu Button - Show on mobile for all users, and on desktop for company users */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`${isCompanyUser ? "lg:hidden" : "md:hidden"} p-2 rounded-md text-[var(--brand-600)] dark:text-[var(--brand-400)] hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors`}
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
        className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-[var(--surface)] shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--brand-200)] dark:border-[var(--border)]">
            <div className="flex items-center space-x-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white">
                <Image
                  src="/Ittihad Placement Logo.png"
                  alt="Ittihad Placement logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-brand leading-tight">
                Ittihad Placement
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[var(--surface-muted)] transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Home (Dashboard) */}
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
            >
              <Home className="mr-3 h-5 w-5" />
              Home
            </Link>
            {/* Dashboard */}
            <Link
              href={getDashboardPath()}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
            >
              <User className="mr-3 h-5 w-5" />
              Dashboard
            </Link>

            {/* My Profile - Account Settings */}
            {session && (
              <Link
                href="/profile/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
              >
                <Settings className="mr-3 h-5 w-5" />
                My Profile
              </Link>
            )}

            {/* Language switcher */}
            <div className="space-y-1">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
              >
                <span className="flex items-center">
                  <Globe className="mr-3 h-5 w-5" />
                  Language
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
              </button>
              {isLanguageOpen && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 dark:border-[var(--border)] pl-4">
                  <button
                    onClick={() => {
                      handleLanguageSwitch("en")
                      setIsLanguageOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-[var(--brand-600)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] rounded transition-colors"
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      handleLanguageSwitch("ar")
                      setIsLanguageOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-300 hover:text-[var(--brand-600)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] rounded transition-colors"
                  >
                    العربية
                  </button>
                </div>
              )}
            </div>

            <ThemeToggle variant="list" />

            {/* Industry dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsIndustryOpen(!isIndustryOpen)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
              >
                <div className="flex items-center">
                  <Building2 className="mr-3 h-5 w-5" />
                  Industry
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isIndustryOpen ? "rotate-180" : ""}`} />
              </button>
              {isIndustryOpen && (
                <div className="ml-4 space-y-1 border-l-2 border-gray-200 dark:border-[var(--border)] pl-4">
                  {loadingCategories ? (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</div>
                  ) : categories.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No categories available</div>
                  ) : (
                    categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/jobs?category=${encodeURIComponent(category.name)}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-[var(--brand-600)] hover:bg-gray-50 dark:hover:bg-[var(--surface-muted)] rounded transition-colors"
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
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
              >
                <UserPlus className="mr-3 h-5 w-5" />
                Hire
              </Link>
            )}

            {/* Find work (Browse job) */}
            <Link
              href="/jobs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
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
              className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium text-left"
            >
              <HelpCircle className="mr-3 h-5 w-5" />
              Help center
            </button>

            {/* Login - Only show if not logged in */}
            {!session && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
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
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
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
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
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
                className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-[var(--brand-50)] dark:hover:bg-[var(--surface-muted)] transition-colors font-medium"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            )}
          </div>

          <div className="border-t border-[var(--brand-200)] dark:border-[var(--border)] bg-[var(--brand-50)]/40 dark:bg-[var(--surface-muted)]/40 px-4 py-4 space-y-1">
            {/* <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-700)]">
              Contact
            </h3> */}
            <div className="space-y-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <div className="flex items-start gap-1">
                <MapPin className="mt-0.5 h-4 w-4 text-[var(--brand-600)] shrink-0" />
                <div className="space-y-0.5">
                  <p>Al Nahda Ittihad Placement</p>
                  <p>P.O. Box 261911 , Nahda, Dubai</p>
                  {/* <p>Nahda, Dubai</p>
                  <p>United Arab Emirates</p> */}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 text-[var(--brand-600)] shrink-0" />
                <a href="mailto:support@ittihadplacement.com" className="hover:text-[var(--brand-600)] transition-colors break-all">
                  support@ittihadplacement.com
                </a>
              </div>
              {/* <div className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 text-[var(--brand-600)] shrink-0" />
                <a href="tel:+971502697904" className="hover:text-[var(--brand-600)] transition-colors">
                  +971 50 269 7904
                </a>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

