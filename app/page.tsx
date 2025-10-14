import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, DollarSign, Users, Briefcase, TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Find Your Dream Job with
              <span className="text-blue-600"> Placement Guarantee</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              The revolutionary job portal where serious candidates meet quality employers.
              Apply with confidence, backed by our unique placement guarantee system.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/register">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose JobPortal Pro?</h2>
            <p className="mt-4 text-lg text-gray-600">
              We revolutionize job hunting with unique benefits for everyone
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Placement Guarantee</CardTitle>
                <CardDescription>
                  Get hired or get refunded. Our unique guarantee system protects your investment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Quality Candidates</CardTitle>
                <CardDescription>
                  Companies receive applications only from serious, motivated candidates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Fair Pricing</CardTitle>
                <CardDescription>
                  Transparent application fees ensure both parties are invested in success.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Verified Companies</CardTitle>
                <CardDescription>
                  All companies are verified to ensure legitimacy and quality job postings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Briefcase className="h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Wide Range of Jobs</CardTitle>
                <CardDescription>
                  From startups to enterprises, find opportunities across all industries.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-blue-600" />
                <CardTitle className="mt-4">Track Progress</CardTitle>
                <CardDescription>
                  Monitor your applications and communicate directly with employers.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">
              Simple, transparent, and effective
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold">Create Profile</h3>
              <p className="mt-2 text-gray-600">
                Sign up as a job seeker or company and complete your profile
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold">Apply or Post</h3>
              <p className="mt-2 text-gray-600">
                Job seekers apply to positions, companies post job listings with guarantees
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold">Get Hired</h3>
              <p className="mt-2 text-gray-600">
                Connect, interview, and get hired with our placement guarantee protection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Ready to Transform Your Career?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of job seekers and companies already using JobPortal Pro
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Start Your Journey Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
