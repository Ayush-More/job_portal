import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Clock,
  DollarSign
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

interface ApplicationDetailPageProps {
  params: {
    id: string
  }
}

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const session = await auth()

  if (!session?.user || session.user.role !== "COMPANY") {
    redirect("/login")
  }

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      job: {
        include: {
          company: {
            include: {
              user: true,
            },
          },
        },
      },
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
      payment: true,
      guarantee: true,
      messages: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!application) {
    redirect("/dashboard/company/applications")
  }

  // Check if the application belongs to the current company
  if (application.job.company.userId !== session.user.id) {
    redirect("/dashboard/company/applications")
  }

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
      <div className="mb-6">
        <Link href="/dashboard/company/applications">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Application Details</h1>
        <p className="text-gray-600">Review application for {application.job.title}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Candidate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    {application.jobSeeker.user.name || "Anonymous"}
                  </h3>
                  <p className="text-gray-600">{application.jobSeeker.user.email}</p>
                </div>
                <Badge variant={getStatusColor(application.status)}>
                  {application.status.replace("_", " ")}
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {application.jobSeeker.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{application.jobSeeker.phone}</span>
                  </div>
                )}
                {application.jobSeeker.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{application.jobSeeker.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {application.jobSeeker.experience || 0} years experience
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    Applied {formatDate(application.appliedAt)}
                  </span>
                </div>
              </div>

              {application.jobSeeker.bio && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Professional Bio</h4>
                  <p className="text-sm text-gray-600">{application.jobSeeker.bio}</p>
                </div>
              )}

              {application.jobSeeker.skills && application.jobSeeker.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {application.jobSeeker.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {application.jobSeeker.education && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Education</h4>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{application.jobSeeker.education}</span>
                  </div>
                </div>
              )}

              {application.jobSeeker.resume && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Resume</h4>
                  <a
                    href={application.jobSeeker.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    View Resume
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Letter */}
          {application.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">
                  {application.coverLetter}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          {application.messages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>
                  Communication history for this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {application.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.senderType === "COMPANY"
                          ? "bg-blue-50 ml-8"
                          : "bg-gray-50 mr-8"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {message.senderType === "COMPANY" ? "You" : application.jobSeeker.user.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">{application.job.title}</h4>
                <p className="text-sm text-gray-600">{application.job.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  Application Fee: Set by Admin
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
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
              {application.payment?.amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(application.payment.amount)}
                  </span>
                </div>
              )}
              {application.payment?.receiptUrl && (
                <div>
                  <a
                    href={application.payment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Receipt
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guarantee Information */}
          {application.guarantee && (
            <Card>
              <CardHeader>
                <CardTitle>Guarantee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={application.guarantee.fulfilled ? "success" : "secondary"}>
                    {application.guarantee.fulfilled ? "Fulfilled" : "Active"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expires:</span>
                  <span className="text-sm">
                    {formatDate(application.guarantee.expiresAt)}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Terms:</h4>
                  <p className="text-xs text-gray-600">
                    {application.guarantee.terms}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
