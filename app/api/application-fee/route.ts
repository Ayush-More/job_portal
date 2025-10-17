import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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
