import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { TrendingUp, Users, Briefcase, DollarSign, FileText } from "lucide-react"

async function getAnalytics() {
  const { prisma } = await import("@/lib/prisma")
  
  // Get data for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    recentUsers,
    recentJobs,
    recentApplications,
    recentPayments,
    monthlyRevenue,
    totalRevenue,
    userGrowth,
    jobGrowth,
  ] = await Promise.all([
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.job.count({
      where: { createdAt: { gte: thirtyDaysAgo } }
    }),
    prisma.application.count({
      where: { appliedAt: { gte: thirtyDaysAgo } }
    }),
    prisma.payment.count({
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        status: "COMPLETED"
      }
    }),
    prisma.payment.aggregate({
      where: { 
        createdAt: { gte: thirtyDaysAgo },
        status: "COMPLETED"
      },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true }
    }),
    prisma.user.count({
      where: { 
        createdAt: { 
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo
        }
      }
    }),
    prisma.job.count({
      where: { 
        createdAt: { 
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: thirtyDaysAgo
        }
      }
    }),
  ])

  // Get top companies by job count
  const topCompanies = await prisma.company.findMany({
    include: {
      user: true,
      _count: {
        select: {
          jobs: true,
        },
      },
    },
    orderBy: {
      jobs: {
        _count: "desc",
      },
    },
    take: 5,
  })

  // Get recent activity
  const recentActivity = await prisma.user.findMany({
    include: {
      company: true,
      jobSeeker: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  return {
    recentUsers,
    recentJobs,
    recentApplications,
    recentPayments,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    totalRevenue: totalRevenue._sum.amount || 0,
    userGrowth,
    jobGrowth,
    topCompanies,
    recentActivity,
  }
}

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const analytics = await getAnalytics()

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const userGrowthPercent = calculateGrowth(analytics.recentUsers, analytics.userGrowth)
  const jobGrowthPercent = calculateGrowth(analytics.recentJobs, analytics.jobGrowth)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-[var(--brand-600)] font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Platform performance and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentUsers}</div>
            <p className={`text-xs ${userGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {userGrowthPercent > 0 ? '+' : ''}{userGrowthPercent}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Jobs (30d)</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentJobs}</div>
            <p className={`text-xs ${jobGrowthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {jobGrowthPercent > 0 ? '+' : ''}{jobGrowthPercent}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications (30d)</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentApplications}</div>
            <p className="text-xs text-gray-500">
              {analytics.recentPayments} with payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.monthlyRevenue)}</div>
            <p className="text-xs text-gray-500">
              Total: {formatCurrency(analytics.totalRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Companies */}
        <Card>
          <CardHeader>
            <CardTitle>Top Companies</CardTitle>
            <CardDescription>Companies with most job postings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCompanies.map((company, index) => (
                <div key={company.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{company.user.name}</p>
                      <p className="text-sm text-gray-500">{company.companyName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{company._count.jobs}</p>
                    <p className="text-sm text-gray-500">jobs</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name || "No Name"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDateTime(user.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
