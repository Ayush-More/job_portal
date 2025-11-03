import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"
import { sendEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user and profile (email not yet verified)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        emailVerified: null,
        ...(validatedData.role === "COMPANY"
          ? {
              company: {
                create: {
                  companyName: validatedData.name,
                },
              },
            }
          : {
              jobSeeker: {
                create: {},
              },
            }),
      },
    })

    // Generate and store OTP (15 min expiry) and send via email
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = new Date(Date.now() + 15 * 60 * 1000)
    await prisma.verificationToken.upsert({
      where: { identifier: user.email },
      update: { token: otp, expires },
      create: { identifier: user.email, token: otp, expires },
    })
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Your Ittihad Placement verification code",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Verify your email</h2>
        <p>Your one-time verification code is:</p>
        <div style=\"font-size:28px;font-weight:700;letter-spacing:6px\">${otp}</div>
        <p>This code will expire in 15 minutes.</p>
      </div>`,
    })

    // In development mode (when email is not configured), include OTP in response
    const isDevelopment = process.env.NODE_ENV === 'development' && !emailResult.success
    
    return NextResponse.json(
      { 
        message: emailResult.success 
          ? "User created successfully. Please verify your email with the OTP sent."
          : "User created successfully. Please verify your email with the OTP sent (check console for OTP in development mode).",
        userId: user.id,
        email: user.email,
        ...(isDevelopment && { otp }) // Include OTP in development mode only
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    )
  }
}

