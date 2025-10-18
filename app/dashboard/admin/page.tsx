import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, DollarSign, FileText, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getStats() {
  // Use direct database query for SSR instead of fetch
  const { prisma } = await import("@/lib/prisma")
  
  const [
    totalUsers,
    totalCompanies,
    totalJobSeekers,
    totalJobs,
    activeJobs,
    totalApplications,
    totalPayments,
    completedPayments,
    totalRefunds,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.company.count(),
    prisma.jobSeeker.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.application.count(),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "COMPLETED" } }),
    prisma.refund.count(),
  ])

  // Calculate revenue
  const payments = await prisma.payment.findMany({
    where: { status: "COMPLETED" },
    select: { amount: true },
  })

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  return {
    users: {
      total: totalUsers,
      companies: totalCompanies,
      jobSeekers: totalJobSeekers,
    },
    jobs: {
      total: totalJobs,
      active: activeJobs,
    },
    applications: {
      total: totalApplications,
    },
    payments: {
      total: totalPayments,
      completed: completedPayments,
    },
    refunds: {
      total: totalRefunds,
    },
    revenue: {
      total: totalRevenue,
      formatted: `$${(totalRevenue / 100).toFixed(2)}`,
    },
  }
}

export default async function AdminDashboard() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const stats = await getStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-[var(--brand-600)] font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users?.total || 0}</div>
            <p className="text-xs text-gray-500">
              {stats.users?.companies || 0} companies, {stats.users?.jobSeekers || 0} job seekers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Posted</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.jobs?.total || 0}</div>
            <p className="text-xs text-gray-500">{stats.jobs?.active || 0} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applications?.total || 0}</div>
            <p className="text-xs text-gray-500">
              {stats.payments?.completed || 0} paid
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenue?.formatted || "$0.00"}</div>
            <p className="text-xs text-gray-500">Total platform revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Management</CardTitle>
            <CardDescription>Quick access to admin functions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/dashboard/admin/users">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/dashboard/admin/jobs">
                <Button className="w-full" variant="outline">
                  <Briefcase className="mr-2 h-4 w-4" />
                  Manage Jobs
                </Button>
              </Link>
              <Link href="/dashboard/admin/refunds">
                <Button className="w-full" variant="outline">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Handle Refunds
                </Button>
              </Link>
              <Link href="/dashboard/admin/analytics">
                <Button className="w-full" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Activity feed coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

