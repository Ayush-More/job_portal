import Link from "next/link"
import { Briefcase } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">JobPortal Pro</span>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              The revolutionary job portal with placement guarantees. Apply with
              confidence, get hired with certainty.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Job Seekers</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Companies</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <p className="text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} JobPortal Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

