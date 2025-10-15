import { NextResponse } from "next/server"
import { verifyEmailToken, resendVerificationEmail } from "@/lib/email-verification"
import { sendEmail, emailTemplates } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const { token, email } = await req.json()

    if (!token || !email) {
      return NextResponse.json(
        { error: "Token and email are required" },
        { status: 400 }
      )
    }

    const isValid = await verifyEmailToken(token, email)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      )
    }

    // Send welcome email after successful verification
    await sendEmail({
      to: email,
      subject: "Welcome to JobPortal Pro - Email Verified!",
      html: emailTemplates.welcome("there"),
    })

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    await resendVerificationEmail(email)

    return NextResponse.json(
      { message: "Verification email sent successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}