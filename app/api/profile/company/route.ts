import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { companyProfileSchema } from "@/lib/validations"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!company) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch company profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = companyProfileSchema.parse(body)

    // Check if company profile exists, if not create it
    const existingCompany = await prisma.company.findUnique({
      where: { userId: session.user.id },
    })

    const company = existingCompany
      ? await prisma.company.update({
          where: { userId: session.user.id },
          data: validatedData,
        })
      : await prisma.company.create({
          data: {
            userId: session.user.id,
            ...validatedData,
          },
        })

    return NextResponse.json(company)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}

