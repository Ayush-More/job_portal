import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jobSchema } from "@/lib/validations"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await prisma.job.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verify job belongs to company
    const job = await prisma.job.findUnique({
      where: { id },
    })

    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const body = await req.json()
    const validatedData = jobSchema.partial().parse(body)

    const updatedJob = await prisma.job.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Verify job belongs to company
    const job = await prisma.job.findUnique({
      where: { id },
    })

    if (!job || job.companyId !== company.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    await prisma.job.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Job deleted successfully" })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    )
  }
}

