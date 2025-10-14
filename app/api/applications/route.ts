import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { applicationSchema } from "@/lib/validations"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let applications

    if (session.user.role === "JOB_SEEKER") {
      const jobSeeker = await prisma.jobSeeker.findUnique({
        where: { userId: session.user.id },
      })

      applications = await prisma.application.findMany({
        where: { jobSeekerId: jobSeeker?.id },
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
      })
    } else if (session.user.role === "COMPANY") {
      const company = await prisma.company.findUnique({
        where: { userId: session.user.id },
      })

      applications = await prisma.application.findMany({
        where: {
          job: {
            companyId: company?.id,
          },
        },
        include: {
          job: true,
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
        },
        orderBy: { appliedAt: "desc" },
      })
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { jobId, ...applicationData } = body
    const validatedData = applicationSchema.parse(applicationData)

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!jobSeeker) {
      return NextResponse.json(
        { error: "Job seeker profile not found" },
        { status: 404 }
      )
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_jobSeekerId: {
          jobId,
          jobSeekerId: jobSeeker.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 400 }
      )
    }

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId,
        jobSeekerId: jobSeeker.id,
        ...validatedData,
      },
      include: {
        job: true,
      },
    })

    // Note: Payment is created via separate payment endpoint

    return NextResponse.json(application, { status: 201 })
  } catch (error: any) {
    console.error("Error creating application:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create application" },
      { status: 500 }
    )
  }
}

