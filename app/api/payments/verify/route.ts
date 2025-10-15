import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, applicationId } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !applicationId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 })
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    const isValid = generatedSignature === razorpay_signature

    if (!isValid) {
      await prisma.payment.update({
        where: { applicationId },
        data: {
          status: "FAILED",
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      })
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 })
    }

    const payment = await prisma.payment.update({
      where: { applicationId },
      data: {
        status: "COMPLETED",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      include: {
        application: {
          include: {
            job: true,
          },
        },
      },
    })

    // Create guarantee record
    const guaranteeExpiresAt = new Date()
    guaranteeExpiresAt.setDate(guaranteeExpiresAt.getDate() + payment.application.job.guaranteePeriod)

    await prisma.guarantee.upsert({
      where: { applicationId },
      update: {
        terms: payment.application.job.guaranteeTerms,
        expiresAt: guaranteeExpiresAt,
      },
      create: {
        applicationId,
        terms: payment.application.job.guaranteeTerms,
        expiresAt: guaranteeExpiresAt,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Payment verify error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}


