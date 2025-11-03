import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

function generateSixDigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const token = await prisma.verificationToken.findUnique({ where: { identifier: email } })
    if (!token) {
      return NextResponse.json({ error: "OTP not found. Please request a new one." }, { status: 400 })
    }

    if (token.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { identifier: email } })
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 })
    }

    if (token.token !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } })
    await prisma.verificationToken.delete({ where: { identifier: email } })

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (e) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    const otp = generateSixDigitOtp()
    const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    await prisma.verificationToken.upsert({
      where: { identifier: email },
      update: { token: otp, expires },
      create: { identifier: email, token: otp, expires },
    })

    // Send email with OTP (simple template)
    await sendEmail({
      to: email,
      subject: "Your Ittihad Placement verification code",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Verify your email</h2>
        <p>Your one-time verification code is:</p>
        <div style="font-size:28px;font-weight:700;letter-spacing:6px">${otp}</div>
        <p>This code will expire in 15 minutes.</p>
      </div>`,
    })

    return NextResponse.json({ message: "OTP sent" })
  } catch (e) {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}