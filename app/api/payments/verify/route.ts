import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyRazorpaySignature } from "@/lib/razorpay"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Payment gateway not configured" }, { status: 503 })
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (!isValid) {
      // Find payment by order ID and mark as failed
      const payment = await prisma.payment.findFirst({
        where: { razorpayOrderId: orderId },
      })
      
      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
        })
      }
      
      return NextResponse.json({ error: "Signature verification failed" }, { status: 400 })
    }

    // Find payment by order ID
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: orderId },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Get order details from Razorpay notes
    const razorpayOrder = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
      },
    })
    
    const orderData = await razorpayOrder.json()
    const { jobId, jobSeekerId, coverLetter } = orderData.notes

    // Create the application only after successful payment verification
    const application = await prisma.application.create({
      data: {
        jobId,
        jobSeekerId,
        coverLetter: coverLetter || "",
        status: "SUBMITTED",
      },
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
    })

    // Update payment with real application ID
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        applicationId: application.id,
        status: "COMPLETED",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    })

    // Create guarantee record
    const guaranteeExpiresAt = new Date()
    guaranteeExpiresAt.setDate(guaranteeExpiresAt.getDate() + application.job.guaranteePeriod)

    await prisma.guarantee.create({
      data: {
        applicationId: application.id,
        terms: application.job.guaranteeTerms,
        expiresAt: guaranteeExpiresAt,
      },
    })

    // Send payment confirmation email to job seeker
    await sendEmail({
      to: application.jobSeeker.user.email,
      subject: "Payment Confirmed - JobPortal Pro",
      html: emailTemplates.paymentReceived(updatedPayment.amount, application.job.title),
    })

    // Send notification email to company
    await sendEmail({
      to: application.job.company.user.email,
      subject: "New Application with Payment - JobPortal Pro",
      html: emailTemplates.applicationReceived(
        application.job.title,
        application.jobSeeker.user.name || "A job seeker"
      ),
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Payment verify error:", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}


