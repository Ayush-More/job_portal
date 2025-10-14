import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const refunds = await prisma.refund.findMany({
      include: {
        payment: {
          include: {
            application: {
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
            },
          },
        },
      },
      orderBy: { requestedAt: "desc" },
    })

    return NextResponse.json(refunds)
  } catch (error) {
    console.error("Error fetching refunds:", error)
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    )
  }
}

