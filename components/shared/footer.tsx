import Link from "next/link"
import { Briefcase, Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t-2 border-[var(--brand-200)] bg-gradient-to-r from-white via-[var(--accent-50)] to-white/95">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2 animate-slide-in-left">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Briefcase className="h-7 w-7 text-[var(--brand-600)]" />
                <Sparkles className="h-3 w-3 text-[var(--accent-500)] absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-brand">JobPortal Pro</span>
            </div>
            <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
              The revolutionary job portal with placement guarantees. Apply with
              confidence, get hired with certainty.
            </p>
          </div>

          <div className="animate-slide-in-left stagger-1">
            <h3 className="text-sm font-bold text-[var(--brand-700)] uppercase tracking-wider">For Job Seekers</h3>
            <ul className="mt-6 space-y-3">
              <li>
                <Link href="/jobs" className="text-sm text-[var(--muted)] hover:text-[var(--brand-600)] font-medium transition-colors duration-200">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-[var(--muted)] hover:text-[var(--brand-600)] font-medium transition-colors duration-200">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div className="animate-slide-in-right stagger-2">
            <h3 className="text-sm font-bold text-[var(--brand-700)] uppercase tracking-wider">For Companies</h3>
            <ul className="mt-6 space-y-3">
              <li>
                <Link href="/register" className="text-sm text-[var(--muted)] hover:text-[var(--brand-600)] font-medium transition-colors duration-200">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-[var(--muted)] hover:text-[var(--brand-600)] font-medium transition-colors duration-200">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t-2 border-[var(--brand-200)] pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-center sm:text-left text-sm text-[var(--muted)] font-medium">
              &copy; {new Date().getFullYear()} JobPortal Pro. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-xs text-[var(--muted)] hover:text-[var(--brand-600)] transition-colors duration-200">
                Privacy
              </Link>
              <Link href="#" className="text-xs text-[var(--muted)] hover:text-[var(--brand-600)] transition-colors duration-200">
                Terms
              </Link>
              <Link href="#" className="text-xs text-[var(--muted)] hover:text-[var(--brand-600)] transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

