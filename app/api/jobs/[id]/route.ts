import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jobSchema } from "@/lib/validations"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: {
            companyName: true,
            description: true,
            logo: true,
            location: true,
            website: true,
            verified: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verify job belongs to company
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    })

    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = jobSchema.partial().parse(body)

    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(updatedJob)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update job" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verify job belongs to company
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    })

    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    await prisma.job.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Job deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    )
  }
}

