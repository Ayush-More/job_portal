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
              <span className="text-xl font-bold tracking-tight bg-gradient-brand">Ittihad Placement</span>
            </div>
            <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
              The revolutionary Ittihad placement platform with placement guarantees. Apply with
              confidence, get hired with certainty.
            </p>
          </div>

          {/* Mobile: Horizontal layout with divider */}
          <div className="flex md:contents gap-6 md:gap-0">
            <div className="flex-1 animate-slide-in-left stagger-1">
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

            {/* Vertical divider line */}
            <div className="md:hidden w-px bg-[var(--brand-200)] self-stretch"></div>

            <div className="flex-1 animate-slide-in-right stagger-2">
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

          <div className="animate-slide-in-right stagger-3 md:col-span-full w-full">
            <h3 className="text-sm font-bold text-[var(--brand-700)] uppercase tracking-wider">Contact Us</h3>
            <div className="mt-6 grid gap-6 text-sm text-[var(--muted)] leading-relaxed sm:grid-cols-2 lg:grid-cols-4 md:gap-10">
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-[var(--brand-700)] uppercase tracking-wider">Address</p>
                <address className="not-italic space-y-1">
                  <p>Al Nahda Ittihad Placement</p>
                  <p>P.O. Box 261911</p>
                  <p>Nahda, Dubai</p>
                  <p>United Arab Emirates</p>
                </address>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-[var(--brand-700)] uppercase tracking-wider">Phone</p>
                <p className="text-base font-medium md:text-lg">
                  <a href="tel:+971502697904" className="hover:text-[var(--brand-600)] transition-colors duration-200">
                    +971 50 269 7904
                  </a>
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-[var(--brand-700)] uppercase tracking-wider">Email</p>
                <p className="text-base font-medium md:text-lg">
                  <a href="mailto:support@ittihadplacement.com" className="hover:text-[var(--brand-600)] transition-colors duration-200">
                    support@ittihadplacement.com
                  </a>
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-semibold text-[var(--brand-700)] uppercase tracking-wider">Visit Us</p>
                {/* <a
                  href="https://www.google.com/maps/search/?api=1&query=Al+Nahda+Ittihad+Placement+Dubai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-[var(--brand-600)] hover:text-[var(--brand-800)] transition-colors duration-200"
                >
                  Open in Google Maps
                </a> */}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Al+Nahda+Ittihad+Placement+Dubai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg  shadow-sm transition-transform duration-200 hover:scale-[1.02]"
                >
                  <img
                    src="/google map.png"
                    alt="Map showing the location of Al Nahda Ittihad Placement in Dubai"
                    className="w-full h-auto max-w-[190px] mx-auto rounded-md"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t-2 border-[var(--brand-200)] pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-center sm:text-left text-sm text-[var(--muted)] font-medium">
              &copy; 2024 Ittihad Placement. All rights reserved.
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

