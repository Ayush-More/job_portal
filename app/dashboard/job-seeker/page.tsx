import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Briefcase, FileText, DollarSign } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function JobSeekerDashboard() {
  const session = await auth()

  if (!session?.user || session.user.role !== "JOB_SEEKER") {
    redirect("/login")
  }

  const jobSeeker = await prisma.jobSeeker.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      applications: {
        include: {
          job: {
            include: {
              company: {
                select: {
                  companyName: true,
                  logo: true,
                },
              },
            },
          },
          payment: true,
        },
        orderBy: { appliedAt: "desc" },
        take: 10,
      },
    },
  })

  if (!jobSeeker) {
    redirect("/login")
  }

  const statusColors = {
    SUBMITTED: "secondary",
    UNDER_REVIEW: "default",
    INTERVIEW_SCHEDULED: "default",
    ACCEPTED: "success",
    REJECTED: "destructive",
  } as const

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {jobSeeker.user.name}!</h1>
        <p className="text-gray-600">Manage your applications and profile</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobSeeker.applications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobSeeker.applications.filter(a => 
                ["SUBMITTED", "UNDER_REVIEW", "INTERVIEW_SCHEDULED"].includes(a.status)
              ).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                jobSeeker.applications
                  .filter(a => a.payment?.status === "COMPLETED")
                  .reduce((sum, a) => sum + (a.payment?.amount || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track the status of your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {jobSeeker.applications.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven&apos;t applied to any jobs yet</p>
                  <Link href="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobSeeker.applications.map((application) => (
                    <div
                      key={application.id}
                      className="flex items-start justify-between border-b pb-4 last:border-0"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{application.job.title}</h3>
                        <p className="text-sm text-gray-600">
                          {application.job.company.companyName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Applied {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={statusColors[application.status]}>
                          {application.status.replace("_", " ")}
                        </Badge>
                        {application.payment && (
                          <span className="text-sm text-gray-600">
                            {formatCurrency(application.payment.amount)}
                          </span>
                        )}
                      </div>
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
              <Link href="/jobs">
                <Button className="w-full" variant="default">
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/dashboard/job-seeker/profile">
                <Button className="w-full" variant="outline">
                  Edit Profile
                </Button>
              </Link>
              <Link href="/dashboard/job-seeker/applications">
                <Button className="w-full" variant="outline">
                  View All Applications
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Resume</span>
                  <span className={jobSeeker.resume ? "text-green-600" : "text-gray-400"}>
                    {jobSeeker.resume ? "✓" : "○"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Skills</span>
                  <span className={jobSeeker.skills.length > 0 ? "text-green-600" : "text-gray-400"}>
                    {jobSeeker.skills.length > 0 ? "✓" : "○"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Experience</span>
                  <span className={jobSeeker.experience ? "text-green-600" : "text-gray-400"}>
                    {jobSeeker.experience ? "✓" : "○"}
                  </span>
                </div>
              </div>
              {(!jobSeeker.resume || jobSeeker.skills.length === 0 || !jobSeeker.experience) && (
                <Link href="/dashboard/job-seeker/profile">
                  <Button className="w-full mt-4" variant="outline">
                    Complete Profile
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

