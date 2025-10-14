import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get counts
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

    const stats = {
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

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    )
  }
}

