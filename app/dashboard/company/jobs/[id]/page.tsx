import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export default async function CompanyJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "COMPANY") {
    redirect("/login")
  }

  const { id } = await params

  let job: any = null
  try {
    job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        applications: {
          include: {
            jobSeeker: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
            payment: true,
          },
          orderBy: { appliedAt: "desc" },
        },
      },
    })
  } catch (e) {
    job = null
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Job not available</h1>
        <p className="text-gray-600">We couldn&apos;t load this job right now. Please try again shortly.</p>
        <div className="mt-4">
          <Link href="/dashboard/company">
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Ensure the job belongs to the current company user
  const company = await prisma.company.findUnique({ where: { id: job.companyId } })
  if (!company || company.userId !== session.user.id) {
    redirect("/dashboard/company")
  }

  const statusVariant = job.status === "ACTIVE" ? "success" : job.status === "PAUSED" ? "secondary" : "outline"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[var(--brand-600)] font-bold">{job.title}</h1>
          <p className="text-gray-600">{job.company.companyName} • {job.location}</p>
        </div>
        <Badge variant={statusVariant as any}>{job.status}</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Job Overview</CardTitle>
          <CardDescription>Posted {formatDate(job.createdAt)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium">{job.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Application Fee</div>
              <div className="font-medium">${(job.applicationFee / 100).toFixed(2)}</div>
            </div>
            {job.salaryMin !== null && job.salaryMax !== null && (
              <div className="sm:col-span-2">
                <div className="text-sm text-gray-500">Salary Range</div>
                <div className="font-medium">${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}</div>
              </div>
            )}
            <div className="sm:col-span-2">
              <div className="text-sm text-gray-500">Guarantee Period</div>
              <div className="font-medium">{job.guaranteePeriod} day(s)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-800">{job.description}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-800">{job.requirements}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guarantee Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-gray-800">{job.guaranteeTerms}</div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applications ({job.applications.length})</CardTitle>
              <CardDescription>Recent applicants for this job</CardDescription>
            </CardHeader>
            <CardContent>
              {job.applications.length === 0 ? (
                <p className="text-sm text-gray-500">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {job.applications.slice(0, 10).map((app: any) => (
                    <div key={app.id} className="text-sm">
                      <p className="font-medium">{app.jobSeeker.user.name}</p>
                      <p className="text-gray-600 text-xs">{app.jobSeeker.user.email}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href={`/dashboard/company/applications/${job.id}`}>
                  <Button variant="outline" className="w-full">View all applications</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* <div className="flex gap-3">
            <Link href="/dashboard/company">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  )
}
