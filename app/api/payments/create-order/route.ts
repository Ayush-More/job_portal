import { NextResponse } from "next/server"
import Razorpay from "razorpay"
import crypto from "crypto"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { applicationId } = await req.json()
    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required" }, { status: 400 })
    }

    // Load application and amount
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        jobSeeker: { include: { user: true } },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    const amountInPaise = application.job.applicationFee // already in cents; INR paise assumed

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 })
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    // Create or update payment record to PENDING
    const payment = await prisma.payment.upsert({
      where: { applicationId },
      update: { status: "PENDING", currency: "INR" },
      create: {
        applicationId,
        amount: amountInPaise,
        currency: "INR",
        status: "PENDING",
      },
    })

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: payment.id,
      notes: { applicationId },
    })

    await prisma.payment.update({
      where: { applicationId },
      data: { razorpayOrderId: order.id },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      applicationId,
      name: application.job.title,
      description: `Application fee for ${application.job.title}`,
      prefill: {
        name: application.jobSeeker.user.name || "",
        email: application.jobSeeker.user.email,
      },
    })
  } catch (error: any) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}


