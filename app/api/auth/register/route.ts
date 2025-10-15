import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"
import { sendEmail, emailTemplates } from "@/lib/email"
import { sendVerificationEmail } from "@/lib/email-verification"

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

    // Create user and profile (email not verified initially)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        emailVerified: null, // Email not verified initially
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

    // Send verification email instead of welcome email
    await sendVerificationEmail(user.email, user.name || "there")

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.", 
        userId: user.id,
        emailSent: true
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

