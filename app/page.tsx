import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Shield, DollarSign, Users, Briefcase, TrendingUp, ArrowRight, Zap, Heart, Star, Sparkles, Rocket } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-200)] rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-200)] rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 right-10 w-72 h-72 bg-gradient-to-br from-[var(--secondary-500)] to-[var(--secondary-200)] rounded-full blur-3xl opacity-15" style={{ animation: 'float 5s ease-in-out infinite', animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--brand-100)] to-[var(--accent-100)] border border-[var(--brand-300)]">
              <Zap className="h-4 w-4 text-[var(--brand-600)]" />
              <span className="text-sm font-semibold text-[var(--brand-700)]">Revolutionizing Job Search 🚀</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-[var(--heading)]">
                Find Your
                <br />
                <span className="bg-gradient-vibrant">Dream Job</span>
                <br />
                with Confidence
            </h1>
              
              <p className="mx-auto max-w-3xl text-lg md:text-xl text-[var(--muted)] leading-relaxed">
                Experience the revolutionary job portal where serious candidates meet quality employers. Apply with our unique placement guarantee system and get hired with certainty.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
              <Link href="/register">
                <Button size="lg" className="group rounded-[var(--radius-lg)] px-8 py-6 text-base font-semibold bg-gradient-to-r from-[var(--brand-600)] to-[var(--secondary-500)] text-white">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="rounded-[var(--radius-lg)] px-8 py-6 text-base font-semibold border-2 border-[var(--brand-300)] text-[var(--brand-600)]">
                  Browse Jobs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--brand-600)]">10K+</div>
                <p className="text-sm text-[var(--muted)] mt-2">Active Jobs</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--secondary-600)]">50K+</div>
                <p className="text-sm text-[var(--muted)] mt-2">Job Seekers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[var(--accent-600)]">5K+</div>
                <p className="text-sm text-[var(--muted)] mt-2">Companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--brand-50)] to-[var(--accent-50)]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--heading)]">Why Choose JobPortal Pro?</h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              We revolutionize job hunting with unique benefits designed for your success
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Placement Guarantee",
                description: "Get hired or get refunded. Our unique guarantee system protects your investment.",
                color: "from-[var(--brand-600)] to-[var(--brand-500)]",
                delay: "stagger-1"
              },
              {
                icon: Users,
                title: "Quality Candidates",
                description: "Companies receive applications only from serious, motivated candidates.",
                color: "from-[var(--accent-600)] to-[var(--accent-500)]",
                delay: "stagger-2"
              },
              {
                icon: DollarSign,
                title: "Fair Pricing",
                description: "Transparent application fees ensure both parties are invested in success.",
                color: "from-[var(--secondary-600)] to-[var(--secondary-500)]",
                delay: "stagger-3"
              },
              {
                icon: CheckCircle,
                title: "Verified Companies",
                description: "All companies are verified to ensure legitimacy and quality job postings.",
                color: "from-[var(--brand-600)] to-[var(--brand-500)]",
                delay: "stagger-4"
              },
              {
                icon: Briefcase,
                title: "Wide Range of Jobs",
                description: "From startups to enterprises, find opportunities across all industries.",
                color: "from-[var(--accent-600)] to-[var(--accent-500)]",
                delay: "stagger-5"
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                description: "Monitor your applications and communicate directly with employers.",
                color: "from-[var(--secondary-600)] to-[var(--secondary-500)]",
                delay: "stagger-6"
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className={`animate-slide-up ${feature.delay} group hover:shadow-2xl hover:shadow-[rgba(168,85,247,0.3)] transition-all duration-300 overflow-hidden`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <CardHeader className="relative">
                    <div className={`inline-flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-[var(--heading)]">{feature.title}</CardTitle>
                    <CardDescription className="text-[var(--muted)]">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 space-y-4 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-black text-[var(--heading)]">How It Works</h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
              Simple, transparent, and effective process to land your dream job
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3 relative">
            {/* Connection lines - hidden on mobile */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand-200)] via-[var(--accent-200)] to-[var(--secondary-200)]" style={{ width: 'calc(100% - 60px)', left: '30px' }}></div>

            {[
              {
                number: 1,
                title: "Create Profile",
                description: "Sign up as a job seeker or company and complete your profile with all necessary details",
                icon: "👤"
              },
              {
                number: 2,
                title: "Apply or Post",
                description: "Job seekers apply to positions, companies post listings with our placement guarantees",
                icon: "📋"
              },
              {
                number: 3,
                title: "Get Hired",
                description: "Connect, interview, and get hired with our placement guarantee protection in place",
                icon: "🎉"
              },
            ].map((step) => (
              <div key={step.number} className={`text-center relative animate-slide-up stagger-${step.number}`}>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[var(--secondary-500)] text-4xl font-bold text-white mb-6 relative z-10 shadow-lg shadow-[rgba(168,85,247,0.3)] group hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-[var(--heading)] mb-3">{step.title}</h3>
                <p className="text-[var(--muted)] text-lg leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Completely Redesigned */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[var(--brand-50)] via-white to-[var(--secondary-50)]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--brand-100)] to-[var(--secondary-100)] border border-[var(--brand-300)] mb-6">
              <Heart className="h-4 w-4 text-[var(--secondary-500)]" />
              <span className="text-sm font-semibold text-[var(--brand-700)]">Why Job Seekers Love Us</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[var(--heading)]">
              Built for Your Success
            </h2>
            <p className="text-lg text-[var(--muted)] max-w-3xl mx-auto mt-4">
              We've created a platform that genuinely cares about your career growth and professional development
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Side - Features List */}
            <div className="space-y-6 animate-slide-in-left">
              {[
                { icon: Shield, title: "Money-Back Guarantee", description: "Get hired within 90 days or we refund your fees" },
                { icon: Sparkles, title: "Verified Opportunities", description: "Every job listing is verified for authenticity" },
                { icon: Users, title: "Direct Communication", description: "Talk directly with hiring managers" },
                { icon: Rocket, title: "Career Support", description: "Expert guidance throughout your job search" },
                { icon: Star, title: "Transparent Pricing", description: "No hidden fees - exactly what you see" },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx} className="animate-slide-up stagger-1 flex gap-4 group">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand-600)] to-[var(--secondary-600)] text-white group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--heading)] group-hover:text-[var(--brand-600)] transition-colors duration-200">
                        {item.title}
                      </h3>
                      <p className="text-[var(--muted)] text-sm">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Side - Statistics Cards */}
            <div className="space-y-6 animate-slide-in-right">
              {/* Main Success Card */}
              <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--brand-600)] via-[var(--secondary-500)] to-[var(--brand-600)] p-8 text-white shadow-2xl shadow-[rgba(168,85,247,0.3)]">
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-black mb-3">10K+</div>
                  <h3 className="text-2xl font-bold mb-2">Successful Placements</h3>
                  <p className="text-white/90">Real people getting hired at amazing companies every day</p>
                </div>
              </div>

              {/* Two Column Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--accent-100)] to-white p-6 border-2 border-[var(--accent-300)] text-center hover:shadow-lg hover:shadow-[rgba(6,182,212,0.2)] transition-all duration-300">
                  <div className="text-4xl font-black text-[var(--accent-600)] mb-2">95%</div>
                  <p className="text-sm font-semibold text-[var(--heading)]">Satisfaction Rate</p>
                </div>
                <div className="rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--secondary-100)] to-white p-6 border-2 border-[var(--secondary-300)] text-center hover:shadow-lg hover:shadow-[rgba(236,72,153,0.2)] transition-all duration-300">
                  <div className="text-4xl font-black text-[var(--secondary-600)] mb-2">24h</div>
                  <p className="text-sm font-semibold text-[var(--heading)]">Average Response</p>
                </div>
            </div>

              {/* CTA Card */}
              <div className="rounded-[var(--radius-lg)] border-2 border-[var(--brand-300)] bg-white p-6 text-center">
                <p className="text-[var(--muted)] text-sm mb-4">Ready to transform your career?</p>
                <Link href="/register" className="inline-block w-full">
                  <Button className="w-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--secondary-500)] text-white rounded-[var(--radius-md)]">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-600)] via-[var(--secondary-500)] to-[var(--brand-600)]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(0,0,0,0.1)]"></div>
          <div className="absolute top-0 right-0 -z-10 blur-3xl">
            <div className="h-96 w-96 bg-[var(--accent-500)] opacity-20 rounded-full"></div>
          </div>
        </div>

        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-black text-white">
            Ready to Transform Your Career?
          </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of job seekers and companies already using JobPortal Pro. Start your journey to success today.
          </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
            <Link href="/register">
              <Button size="lg" className="rounded-[var(--radius-lg)] px-8 py-6 text-base font-semibold bg-white text-[var(--brand-600)] hover:bg-[var(--brand-50)] hover:shadow-xl hover:shadow-[rgba(0,0,0,0.2)]">
                Start Your Journey Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="rounded-[var(--radius-lg)] px-8 py-6 text-base font-semibold border-2 border-white text-[var(--brand-600)] ">
                Explore Opportunities
              </Button>
            </Link>
          </div>

          <p className="text-white/75 text-sm">
            No credit card required • Free to join • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}
