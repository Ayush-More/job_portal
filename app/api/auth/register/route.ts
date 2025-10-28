import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations"
import { sendEmail, emailTemplates } from "@/lib/email"

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

    // Create user and profile (auto-verified)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        emailVerified: new Date(),
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

    // Optionally send a welcome email (if email is configured)
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Ittihad Placement",
        html: `<p>Hi ${user.name || "there"},</p><p>Your account has been created successfully.</p>`,
      })
    } catch (_) {}

    return NextResponse.json(
      { 
        message: "User created successfully.",
        userId: user.id
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

