import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createRefund } from "@/lib/stripe"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status, adminNotes } = body

    const refund = await prisma.refund.findUnique({
      where: { id: params.id },
      include: {
        payment: {
          include: {
            application: {
              include: {
                jobSeeker: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 })
    }

    let stripeRefundId = refund.stripeRefundId

    // If approving, process the refund through Stripe
    if (status === "APPROVED" && refund.payment.stripePaymentId) {
      const stripeRefund = await createRefund(
        refund.payment.stripePaymentId,
        refund.amount
      )
      stripeRefundId = stripeRefund.id
    }

    const updatedRefund = await prisma.refund.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes,
        ...(stripeRefundId && { stripeRefundId }),
        ...(status === "PROCESSED" && { processedAt: new Date() }),
      },
    })

    // Update payment status if refund is processed
    if (status === "PROCESSED") {
      await prisma.payment.update({
        where: { id: refund.paymentId },
        data: { status: "REFUNDED" },
      })

      // Send email notification
      await sendEmail({
        to: refund.payment.application.jobSeeker.user.email,
        subject: "Refund Processed",
        html: emailTemplates.refundProcessed(refund.amount),
      })
    }

    return NextResponse.json(updatedRefund)
  } catch (error: any) {
    console.error("Error updating refund:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update refund" },
      { status: 500 }
    )
  }
}

