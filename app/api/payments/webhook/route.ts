import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    )
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        
        // Update payment status
        const payment = await prisma.payment.update({
          where: { stripePaymentId: paymentIntent.id },
          data: {
            status: "COMPLETED",
            receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
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

        // Create guarantee
        const guaranteeExpiresAt = new Date()
        guaranteeExpiresAt.setDate(
          guaranteeExpiresAt.getDate() + payment.application.job.guaranteePeriod
        )

        await prisma.guarantee.create({
          data: {
            applicationId: payment.applicationId,
            terms: payment.application.job.guaranteeTerms,
            expiresAt: guaranteeExpiresAt,
          },
        })

        // Send confirmation emails
        await sendEmail({
          to: payment.application.jobSeeker.user.email,
          subject: "Payment Confirmed",
          html: emailTemplates.paymentReceived(
            payment.amount,
            payment.application.job.title
          ),
        })

        await sendEmail({
          to: payment.application.job.company.user.email,
          subject: "New Application Received",
          html: emailTemplates.applicationReceived(
            payment.application.job.title,
            payment.application.jobSeeker.user.name || "A candidate"
          ),
        })

        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        
        await prisma.payment.update({
          where: { stripePaymentId: failedPayment.id },
          data: { status: "FAILED" },
        })
        
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

