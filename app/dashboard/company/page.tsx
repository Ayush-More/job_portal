import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, Users, DollarSign, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function CompanyDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "COMPANY") {
    redirect("/login")
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      jobs: {
        include: {
          applications: {
            include: {
              payment: true,
              jobSeeker: {
                include: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!company) {
    redirect("/login")
  }

  const totalApplications = company.jobs.reduce((sum, job) => sum + job.applications.length, 0)
  const activeJobs = company.jobs.filter(j => j.status === "ACTIVE").length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {company.companyName}!</h1>
        <p className="text-gray-600">Manage your job postings and applications</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.jobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Eye className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {company.jobs
                .reduce((sum, job) => {
                  return sum + job.applications.filter(a => a.payment?.status === "COMPLETED").length * (job.applicationFee / 100)
                }, 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Job Postings</CardTitle>
                <CardDescription>Manage your active and past job listings</CardDescription>
              </div>
              <Link href="/dashboard/company/jobs/new">
                <Button>Post New Job</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {company.jobs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven&apos;t posted any jobs yet</p>
                  <Link href="/dashboard/company/jobs/new">
                    <Button>Create Your First Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {company.jobs.slice(0, 5).map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{job.title}</h3>
                          <Badge
                            variant={
                              job.status === "ACTIVE"
                                ? "success"
                                : job.status === "PAUSED"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{job.location}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Posted {formatDate(job.createdAt)} • {job.applications.length} applications
                        </p>
                      </div>
                      <Link href={`/dashboard/company/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/dashboard/company/jobs/new">
                <Button className="w-full" variant="default">
                  Post New Job
                </Button>
              </Link>
              <Link href="/dashboard/company/applications">
                <Button className="w-full" variant="outline">
                  View Applications
                </Button>
              </Link>
              <Link href="/dashboard/company/profile">
                <Button className="w-full" variant="outline">
                  Edit Company Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {totalApplications === 0 ? (
                <p className="text-sm text-gray-500">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {company.jobs
                    .flatMap((job) =>
                      job.applications.map((app) => ({ ...app, jobTitle: job.title }))
                    )
                    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                    .slice(0, 5)
                    .map((app) => (
                      <div key={app.id} className="text-sm">
                        <p className="font-medium">{app.jobSeeker.user.name}</p>
                        <p className="text-gray-600 text-xs">{app.jobTitle}</p>
                        <p className="text-gray-500 text-xs">{formatDate(app.appliedAt)}</p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

