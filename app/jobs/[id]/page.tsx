"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, DollarSign, Briefcase, Clock, Shield, Building } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { loadStripe } from "@stripe/stripe-js"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [showApplyForm, setShowApplyForm] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [params.id])

  async function fetchJob() {
    try {
      const response = await fetch(`/api/jobs/${params.id}`)
      const data = await response.json()
      setJob(data)
    } catch (error) {
      console.error("Error fetching job:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!session || session.user.role !== "JOB_SEEKER") {
      router.push("/login")
      return
    }

    setApplying(true)

    try {
      // Create application
      const appResponse = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter,
        }),
      })

      if (!appResponse.ok) {
        const error = await appResponse.json()
        alert(error.error || "Failed to submit application")
        return
      }

      const application = await appResponse.json()

      // Create payment intent
      const paymentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
        }),
      })

      if (!paymentResponse.ok) {
        alert("Failed to initialize payment")
        return
      }

      const { clientSecret } = await paymentResponse.json()

      // Redirect to Stripe Checkout (simplified flow)
      const stripe = await stripePromise
      
      if (!stripe) {
        alert("Payment system not available")
        return
      }

      // For now, we'll show a success message
      // In production, you'd redirect to a proper checkout page
      alert("Application submitted! Please complete payment to finalize.")
      router.push("/dashboard/job-seeker")
    } catch (error) {
      console.error("Application error:", error)
      alert("Something went wrong")
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Job not found</p>
            <Link href="/jobs">
              <Button className="mt-4">Back to Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/jobs">
          <Button variant="ghost">← Back to Jobs</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {job.company.companyName}
                  </CardDescription>
                </div>
                {job.company.verified && (
                  <Badge variant="success">Verified</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="mr-2 h-5 w-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Briefcase className="mr-2 h-5 w-5" />
                  <span>{job.category}</span>
                </div>
                {job.salaryMin && job.salaryMax && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="mr-2 h-5 w-5" />
                    <span>
                      ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-2 h-5 w-5" />
                  <span>Posted {formatDate(job.createdAt)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                </div>

                {job.company.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About the Company</h3>
                    <p className="text-gray-700">{job.company.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {showApplyForm && session?.user.role === "JOB_SEEKER" && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Application</CardTitle>
                <CardDescription>
                  Add a cover letter to introduce yourself
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell the employer why you're a great fit..."
                      rows={6}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleApply}
                      disabled={applying}
                      className="flex-1"
                    >
                      {applying ? "Submitting..." : `Pay ${formatCurrency(job.applicationFee)} & Apply`}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApplyForm(false)}
                      disabled={applying}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Application Fee</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(job.applicationFee)}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm">Placement Guarantee</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {job.guaranteePeriod} days guarantee period
                    </div>
                  </div>
                </div>
              </div>

              {!session ? (
                <Link href="/login">
                  <Button className="w-full">Sign In to Apply</Button>
                </Link>
              ) : session.user.role === "JOB_SEEKER" ? (
                !showApplyForm && (
                  <Button
                    className="w-full"
                    onClick={() => setShowApplyForm(true)}
                  >
                    Apply Now
                  </Button>
                )
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Only job seekers can apply
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guarantee Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {job.guaranteeTerms}
              </p>
            </CardContent>
          </Card>

          {job.company.website && (
            <Card>
              <CardHeader>
                <CardTitle>Company Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {job.company.location && (
                  <div className="flex items-center text-sm">
                    <Building className="mr-2 h-4 w-4 text-gray-600" />
                    <span>{job.company.location}</span>
                  </div>
                )}
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline block"
                >
                  Visit Website →
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

