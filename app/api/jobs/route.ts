import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jobSchema } from "@/lib/validations"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const minSalary = searchParams.get("minSalary")
    const maxFee = searchParams.get("maxFee")
    const search = searchParams.get("search")

    const jobs = await prisma.job.findMany({
      where: {
        status: "ACTIVE",
        ...(category && { category }),
        ...(location && { location: { contains: location, mode: "insensitive" } }),
        ...(minSalary && { salaryMin: { gte: parseInt(minSalary) } }),
        ...(maxFee && { applicationFee: { lte: parseInt(maxFee) } }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        company: {
          select: {
            companyName: true,
            logo: true,
            location: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session || session.user?.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = jobSchema.parse(body)

    // Get company
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        ...validatedData,
      },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error: any) {
    console.error("Error creating job:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create job" },
      { status: 500 }
    )
  }
}

