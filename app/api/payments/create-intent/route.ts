import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPaymentIntent } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "JOB_SEEKER") {
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

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === "sk_test_placeholder") {
      // For development without Stripe configured, create a mock payment
      const payment = await prisma.payment.upsert({
        where: { applicationId },
        update: {
          status: "COMPLETED", // Mark as completed for development
        },
        create: {
          applicationId,
          amount: 1000, // Default application fee in cents (10 USD)
          status: "COMPLETED", // Mark as completed for development
        },
      })

      // Create guarantee for development
      const guaranteeExpiresAt = new Date()
      guaranteeExpiresAt.setDate(
        guaranteeExpiresAt.getDate() + application.job.guaranteePeriod
      )

      await prisma.guarantee.upsert({
        where: { applicationId },
        update: {
          terms: application.job.guaranteeTerms,
          expiresAt: guaranteeExpiresAt,
        },
        create: {
          applicationId,
          terms: application.job.guaranteeTerms,
          expiresAt: guaranteeExpiresAt,
        },
      })

      return NextResponse.json({
        clientSecret: "mock_client_secret_for_development",
        paymentId: payment.id,
        mockPayment: true,
        message: "Payment completed (Stripe not configured - development mode)"
      })
    }

    // Get global application fee
    let feeConfig = await prisma.applicationFeeConfig.findFirst()
    if (!feeConfig) {
      feeConfig = await prisma.applicationFeeConfig.create({
        data: {
          amountInCents: 1000, // Default 10 USD
        },
      })
    }

    // Create payment intent with real Stripe
    const paymentIntent = await createPaymentIntent(
      feeConfig.amountInCents,
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
        amount: feeConfig.amountInCents,
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

