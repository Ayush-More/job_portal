import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
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

    let application
    let updatedPayment

    try {
      const transactionResult = await prisma.$transaction(async (tx) => {
        const jobRecord = await tx.job.findUnique({
          where: { id: jobId },
          select: { id: true, positions: true },
        })

        if (!jobRecord) {
          throw new Error("JOB_NOT_FOUND")
        }

        if (jobRecord.positions !== null) {
          try {
            await tx.job.update({
              where: {
                id: jobId,
                positions: {
                  gt: 0,
                },
              },
              data: {
                positions: {
                  decrement: 1,
                },
              },
            })
          } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
              throw new Error("NO_POSITIONS")
            }
            throw err
          }
        }

        const createdApplication = await tx.application.create({
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

        const paymentRecord = await tx.payment.update({
          where: { id: payment.id },
          data: {
            applicationId: createdApplication.id,
            status: "COMPLETED",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
          },
        })

        const guaranteeExpiresAt = new Date()
        guaranteeExpiresAt.setDate(guaranteeExpiresAt.getDate() + createdApplication.job.guaranteePeriod)

        await tx.guarantee.create({
          data: {
            applicationId: createdApplication.id,
            terms: createdApplication.job.guaranteeTerms,
            expiresAt: guaranteeExpiresAt,
          },
        })

        return {
          application: createdApplication,
          payment: paymentRecord,
        }
      })

      application = transactionResult.application
      updatedPayment = transactionResult.payment
    } catch (transactionError: any) {
      if (transactionError?.message === "JOB_NOT_FOUND") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
          },
        })
        return NextResponse.json({ error: "Job no longer exists" }, { status: 404 })
      }

      if (transactionError?.message === "NO_POSITIONS") {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
          },
        })
        return NextResponse.json(
          { error: "No positions available for this job" },
          { status: 400 }
        )
      }

      throw transactionError
    }

    // Send payment confirmation email to job seeker
    await sendEmail({
      to: application.jobSeeker.user.email,
      subject: "Payment Confirmed - Ittihad Placement",
      html: emailTemplates.paymentReceived(updatedPayment.amount, application.job.title),
    })

    // Send notification email to company
    await sendEmail({
      to: application.job.company.user.email,
      subject: "New Application with Payment - Ittihad Placement",
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


