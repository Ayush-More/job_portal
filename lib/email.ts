import nodemailer from 'nodemailer'

// Create Gmail SMTP transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const transporter = createTransporter()

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  // If no SMTP credentials are configured, log the email and return success (for development)
  if (!transporter) {
    console.log('📧 Email would be sent (SMTP not configured):')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`HTML: ${html.substring(0, 100)}...`)
    return { success: true, data: null }
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER, // Gmail will use the authenticated user
      to,
      subject,
      html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('📧 Email sent successfully:', info.messageId)
    
    return { success: true, data: info }
  } catch (error) {
    console.error('📧 Email send error:', error)
    return { success: false, error }
  }
}

export const emailTemplates = {
  welcome: (name: string) => `
    <h1>Welcome to JobPortal Pro!</h1>
    <p>Hi ${name},</p>
    <p>Thank you for joining our platform. We're excited to have you here!</p>
  `,
  
  verifyEmail: (name: string, verificationUrl: string) => `
    <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
      <h1 style="color: #333; text-align: center;">Verify Your Email Address</h1>
      <p>Hi ${name},</p>
      <p>Thank you for registering with JobPortal Pro! To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email Address</a>
      </div>
      
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      
      <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
      
      <p>If you didn't create an account with JobPortal Pro, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="color: #666; font-size: 12px; text-align: center;">
        This email was sent from JobPortal Pro. Please do not reply to this email.
      </p>
    </div>
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

