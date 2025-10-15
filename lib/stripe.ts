import Stripe from 'stripe'

// Only initialize Stripe if API key is available
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    })
  : null

export async function createPaymentIntent(
  amount: number,
  applicationId: string,
  customerEmail: string
) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      applicationId,
    },
    receipt_email: customerEmail,
  })

  return paymentIntent
}

export async function createRefund(paymentIntentId: string, amount?: number) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.')
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  })

  return refund
}

