import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let feeConfig = await prisma.applicationFeeConfig.findFirst()

    // If no config exists, create a default one
    if (!feeConfig) {
      feeConfig = await prisma.applicationFeeConfig.create({
        data: {
          amountInCents: 1000, // Default 10 USD
        },
      })
    }

    return NextResponse.json({
      amountInCents: feeConfig.amountInCents,
      amountInDollars: (feeConfig.amountInCents / 100).toFixed(2),
    })
  } catch (error: any) {
    console.error("Error fetching application fee:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch application fee" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amountInCents } = body

    if (!amountInCents || amountInCents < 100) {
      return NextResponse.json(
        { error: "Amount must be at least $1.00 (100 cents)" },
        { status: 400 }
      )
    }

    let feeConfig = await prisma.applicationFeeConfig.findFirst()

    if (!feeConfig) {
      feeConfig = await prisma.applicationFeeConfig.create({
        data: {
          amountInCents,
          updatedBy: session.user.id,
        },
      })
    } else {
      feeConfig = await prisma.applicationFeeConfig.update({
        where: { id: feeConfig.id },
        data: {
          amountInCents,
          updatedBy: session.user.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      amountInCents: feeConfig.amountInCents,
      amountInDollars: (feeConfig.amountInCents / 100).toFixed(2),
    })
  } catch (error: any) {
    console.error("Error updating application fee:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update application fee" },
      { status: 500 }
    )
  }
}
