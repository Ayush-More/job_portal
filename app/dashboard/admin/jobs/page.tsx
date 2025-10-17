import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime, formatCurrency } from "@/lib/utils"
import { Briefcase, MapPin, DollarSign, Calendar } from "lucide-react"
import ApplicationFeeManager from "@/components/admin/ApplicationFeeManager"

async function getJobs() {
  const { prisma } = await import("@/lib/prisma")
  
  return await prisma.job.findMany({
    include: {
      company: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function JobsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const jobs = await getJobs()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800"
      case "CLOSED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-[var(--brand-600)] font-bold">Job Management</h1>
        <p className="text-gray-600">Manage all job postings and application fees</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ApplicationFeeManager />
        </div>
        
        <div className="lg:col-span-2">
          <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <CardDescription>
            Total {jobs.length} jobs posted on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-4 w-4" />
                        <span>{job.category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>Fee: Set by Admin</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posted: {formatDateTime(job.createdAt)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Company:</strong> {job.company.user.name}
                        {job.postedFor && (
                          <span className="text-gray-500"> (posted for {job.postedFor})</span>
                        )}
                      </div>
                      <div>
                        <strong>Applications:</strong> {job._count.applications}
                      </div>
                      <div>
                        <strong>Guarantee:</strong> {job.guaranteePeriod} days
                      </div>
                    </div>

                    <div className="mt-3">
                      <strong>Description:</strong>
                      <p className="text-gray-700 mt-1 line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
