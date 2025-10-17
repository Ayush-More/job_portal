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
import Script from "next/script"
import Link from "next/link"
import { useToast } from "@/components/ui/toast"
import { Loader } from "@/components/ui/loader"

// Razorpay script will be injected via <Script>

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applicationFee, setApplicationFee] = useState<number>(1000) // Default 10 USD
  const [hasApplied, setHasApplied] = useState<boolean>(false)

  useEffect(() => {
    fetchJob()
    fetchApplicationFee()
    if (session?.user?.role === "JOB_SEEKER") {
      checkApplicationStatus()
    }
  }, [params.id, session?.user?.id])

  async function fetchApplicationFee() {
    try {
      const response = await fetch("/api/application-fee")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched application fee:", data.amountInCents)
        setApplicationFee(data.amountInCents)
      } else {
        console.error("Failed to fetch application fee:", response.status)
      }
    } catch (error) {
      console.error("Error fetching application fee:", error)
    }
  }

  async function checkApplicationStatus() {
    if (!session?.user?.id || !params.id) return
    
    try {
      const response = await fetch("/api/applications")
      if (response.ok) {
        const data = await response.json()
        // Check if user has applied to this specific job
        const hasAppliedToThisJob = data.some((app: any) => app.job.id === params.id)
        setHasApplied(hasAppliedToThisJob)
      }
    } catch (error) {
      console.error("Error checking application status:", error)
    }
  }

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
      // Create Razorpay order first (without creating application)
      const paymentResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          coverLetter,
        }),
      })

      if (!paymentResponse.ok) {
        addToast("Failed to initialize payment", "error")
        return
      }

      const orderData = await paymentResponse.json()

      // @ts-ignore
      if (typeof window === "undefined" || !window.Razorpay) {
        addToast("Payment system not available", "error")
        return
      }

      // @ts-ignore
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Job Application Fee",
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: orderData.prefill,
        method: {
          netbanking: true,
          wallet: true,
          upi: true,
          card: true,
          emi: true,
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (!verifyRes.ok) {
              const err = await verifyRes.json().catch(() => ({}))
              throw new Error(err.error || "Payment verification failed")
            }

            addToast("Application submitted and payment completed!", "success")
            setHasApplied(true)
            setShowApplyForm(false)
            router.push("/dashboard/job-seeker")
          } catch (e) {
            addToast((e as Error).message, "error")
          }
        },
        theme: { color: "#2563eb" },
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Application error:", error)
      addToast("Something went wrong", "error")
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
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      {applying && <Loader fullScreen />}
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
              <div 
                className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowApplyForm(false)}
              >
                <Card 
                  className="w-full max-w-md max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
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
                          {applying ? "Submitting..." : `Pay $${(applicationFee / 100).toFixed(2)} & Apply`}
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
              </div>
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
                     ${(applicationFee / 100).toFixed(2)}
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
                  hasApplied ? (
                    <div className="text-center">
                      <div className="inline-flex items-center px-4 py-2 rounded-md bg-green-100 text-green-800 text-sm font-medium">
                        ✓ Application Submitted
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        You have already applied to this job
                      </p>
                    </div>
                  ) : !showApplyForm ? (
                    <Button
                      className="w-full"
                      onClick={() => setShowApplyForm(true)}
                    >
                      Apply Now
                    </Button>
                  ) : null
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
    </>
  )
}

