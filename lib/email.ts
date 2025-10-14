import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@jobportal.com',
      to,
      subject,
      html,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export const emailTemplates = {
  welcome: (name: string) => `
    <h1>Welcome to JobPortal Pro!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for joining our platform. We're excited to have you here!</p>
  `,
  
  applicationReceived: (jobTitle: string, applicantName: string) => `
    <h1>New Application Received</h1>
    <p>You have received a new application for ${jobTitle} from ${applicantName}.</p>
    <p>Login to your dashboard to review it.</p>
  `,
  
  applicationSubmitted: (jobTitle: string) => `
    <h1>Application Submitted Successfully</h1>
    <p>Your application for ${jobTitle} has been submitted successfully.</p>
    <p>You will receive updates as your application is reviewed.</p>
  `,
  
  applicationStatusUpdate: (jobTitle: string, status: string) => `
    <h1>Application Status Update</h1>
    <p>Your application for ${jobTitle} has been updated to: <strong>${status}</strong></p>
  `,
  
  paymentReceived: (amount: number, jobTitle: string) => `
    <h1>Payment Confirmed</h1>
    <p>We have received your payment of $${(amount / 100).toFixed(2)} for the application to ${jobTitle}.</p>
    <p>Your application is now being processed.</p>
  `,
  
  refundProcessed: (amount: number) => `
    <h1>Refund Processed</h1>
    <p>A refund of $${(amount / 100).toFixed(2)} has been processed to your account.</p>
    <p>It should appear in your account within 5-10 business days.</p>
  `,
}

