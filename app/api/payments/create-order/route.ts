import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { razorpay } from "@/lib/razorpay"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { jobId, coverLetter } = await req.json()
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 })
    }

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Get job seeker details
    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: "Job seeker profile not found" }, { status: 404 })
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_jobSeekerId: {
          jobId,
          jobSeekerId: jobSeeker.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this job" }, { status: 400 })
    }

    // Fetch global application fee set by admin
    let feeConfig = await prisma.applicationFeeConfig.findFirst()
    if (!feeConfig) {
      feeConfig = await prisma.applicationFeeConfig.create({
        data: {
          amountInCents: 1000, // Default 10 USD
        },
      })
    }

    const amountInCents = feeConfig.amountInCents

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 })
    }

    // Create a temporary payment record (will be linked to application after payment success)
    const payment = await prisma.payment.create({
      data: {
        applicationId: null, // Will be set after successful payment
        amount: amountInCents,
        currency: "INR",
        status: "PENDING",
      },
    })

    const order = await razorpay.orders.create({
      amount: amountInCents,
      currency: "INR",
      receipt: payment.id,
      notes: { 
        jobId,
        jobSeekerId: jobSeeker.id,
        coverLetter: coverLetter || "",
        paymentId: payment.id,
      },
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: { razorpayOrderId: order.id },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      name: job.title,
      description: `Application fee for ${job.title}`,
      prefill: {
        name: jobSeeker.user.name || "",
        email: jobSeeker.user.email,
      },
    })
  } catch (error: any) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}


