import crypto from "crypto"
import { prisma } from "./prisma"
import { sendEmail, emailTemplates } from "./email"

export async function generateVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.verificationToken.upsert({
    where: { identifier: email },
    update: { token, expires },
    create: { identifier: email, token, expires },
  })

  return token
}

export async function sendVerificationEmail(email: string, name: string): Promise<void> {
  const token = await generateVerificationToken(email)
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  await sendEmail({
    to: email,
    subject: "Verify your email address - JobPortal Pro",
    html: emailTemplates.verifyEmail(name, verificationUrl),
  })
}

export async function verifyEmailToken(token: string, email: string): Promise<boolean> {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier: email },
  })

  if (!verificationToken || verificationToken.token !== token) {
    return false
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier: email },
    })
    return false
  }

  // Mark email as verified
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  })

  // Delete the verification token
  await prisma.verificationToken.delete({
    where: { identifier: email },
  })

  return true
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error("User not found")
  }

  if (user.emailVerified) {
    throw new Error("Email already verified")
  }

  await sendVerificationEmail(email, user.name || "there")
}