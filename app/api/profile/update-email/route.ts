import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { newEmail, currentPassword } = await req.json()

    if (!newEmail || !currentPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Check if new email is already in use
    if (newEmail !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Email address is already in use" },
          { status: 400 }
        )
      }

      // Update email
      await prisma.user.update({
        where: { id: user.id },
        data: { email: newEmail }
      })

      return NextResponse.json({
        message: "Email updated successfully",
        email: newEmail
      })
    }

    return NextResponse.json(
      { error: "New email is the same as current email" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error updating email:", error)
    return NextResponse.json(
      { error: "Failed to update email" },
      { status: 500 }
    )
  }
}

