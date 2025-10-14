import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, User, Mail, Phone, MapPin, FileText, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function CompanyApplicationsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "COMPANY") {
    redirect("/login")
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
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
            orderBy: { appliedAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!company) {
    redirect("/login")
  }

  // Flatten all applications from all jobs
  const allApplications = company.jobs.flatMap(job =>
    job.applications.map(app => ({
      ...app,
      jobTitle: job.title,
      jobId: job.id,
    }))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "secondary"
      case "UNDER_REVIEW":
        return "default"
      case "INTERVIEW_SCHEDULED":
        return "default"
      case "ACCEPTED":
        return "success"
      case "REJECTED":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <p className="text-gray-600">Review and manage applications for your job postings</p>
      </div>

      {allApplications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">No applications received yet</p>
            <Link href="/dashboard/company/jobs/new">
              <Button>Post Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {allApplications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {application.jobSeeker.user.name || "Anonymous"}
                      </h3>
                      <Badge variant={getStatusColor(application.status)}>
                        {application.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-600">{application.jobTitle}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {formatDate(application.appliedAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {application.jobSeeker.experience || 0} years experience
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/company/applications/${application.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{application.jobSeeker.user.email}</span>
                    </div>
                    {application.jobSeeker.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{application.jobSeeker.phone}</span>
                      </div>
                    )}
                    {application.jobSeeker.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{application.jobSeeker.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {application.jobSeeker.skills && application.jobSeeker.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {application.jobSeeker.skills.slice(0, 5).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {application.jobSeeker.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{application.jobSeeker.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    {application.jobSeeker.resume && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <a
                          href={application.jobSeeker.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {application.coverLetter && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-2">Cover Letter:</p>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {application.coverLetter}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Payment Status:</span>
                    <Badge
                      variant={
                        application.payment?.status === "COMPLETED"
                          ? "success"
                          : application.payment?.status === "FAILED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {application.payment?.status || "PENDING"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Application ID: {application.id.slice(-8)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
