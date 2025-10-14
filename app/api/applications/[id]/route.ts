import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    // Get application with job details
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        jobSeeker: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      )
    }

    // Verify company owns this job
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    })

    if (application.job.companyId !== company?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: { status },
    })

    // Send email notification
    await sendEmail({
      to: application.jobSeeker.user.email,
      subject: "Application Status Update",
      html: emailTemplates.applicationStatusUpdate(
        application.job.title,
        status
      ),
    })

    return NextResponse.json(updatedApplication)
  } catch (error: any) {
    console.error("Error updating application:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update application" },
      { status: 500 }
    )
  }
}

