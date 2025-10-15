import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, FileText, Calendar, DollarSign, Building2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function JobSeekerApplicationsPage() {
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


  const totalSpent = jobSeeker.applications
    .filter(a => a.payment?.status === "COMPLETED")
    .reduce((sum, a) => sum + (a.payment?.amount || 0), 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/job-seeker">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-gray-600">Track and manage all your job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobSeeker.applications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Application History</CardTitle>
          <CardDescription>
            View all your job applications and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobSeeker.applications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">You haven't applied to any jobs yet. Start your job search today!</p>
              <Link href="/jobs">
                <Button>Browse Available Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobSeeker.applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-start justify-between p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Company Logo */}
                    <div className="flex-shrink-0">
                      {application.job.company.logo ? (
                        <img
                          src={application.job.company.logo}
                          alt={`${application.job.company.companyName} logo`}
                          className="w-12 h-12 object-contain border rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 border rounded flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.job.title}
                          </h3>
                          <p className="text-gray-600 mb-2">
                            {application.job.company.companyName}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Applied {formatDate(application.appliedAt)}
                            </span>
                            {application.payment && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                {formatCurrency(application.payment.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge variant={statusColors[application.status]} className="ml-4">
                          {application.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {/* Job Description Preview */}
                      {application.job.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {application.job.description.substring(0, 150)}...
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4">
                        <Link href={`/jobs/${application.job.id}`}>
                          <Button variant="outline" size="sm">
                            View Job
                          </Button>
                        </Link>
                        {application.status === "ACCEPTED" && (
                          <Badge variant="success" className="text-xs">
                            🎉 Congratulations!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8 flex justify-center">
        <Link href="/jobs">
          <Button variant="outline">
            Browse More Jobs
          </Button>
        </Link>
      </div>
    </div>
  )
}
