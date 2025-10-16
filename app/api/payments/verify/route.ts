import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/razorpay"
import { sendEmail, emailTemplates } from "@/lib/email"

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

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

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
            job: {
              include: {
                company: {
                  include: {
                    user: true,
                  },
                },
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

    // Send payment confirmation email to job seeker
    await sendEmail({
      to: payment.application.jobSeeker.user.email,
      subject: "Payment Confirmed - JobPortal Pro",
      html: emailTemplates.paymentReceived(payment.amount, payment.application.job.title),
    })

    // Send notification email to company
    await sendEmail({
      to: payment.application.job.company.user.email,
      subject: "New Application with Payment - JobPortal Pro",
      html: emailTemplates.applicationReceived(
        payment.application.job.title,
        payment.application.jobSeeker.user.name || "A job seeker"
      ),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Payment verify error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}


