import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPaymentIntent } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { applicationId } = await req.json()

    // Get application with job details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
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

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { applicationId },
    })

    if (existingPayment && existingPayment.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Payment already completed" },
        { status: 400 }
      )
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      application.job.applicationFee,
      applicationId,
      application.jobSeeker.user.email
    )

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { applicationId },
      update: {
        stripePaymentId: paymentIntent.id,
      },
      create: {
        applicationId,
        amount: application.job.applicationFee,
        stripePaymentId: paymentIntent.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id,
    })
  } catch (error: any) {
    console.error("Payment intent creation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    )
  }
}

