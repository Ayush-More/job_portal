import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { messageSchema } from "@/lib/validations"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const applicationId = searchParams.get("applicationId")

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID required" },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { applicationId, content } = body
    const validatedData = messageSchema.parse({ content })

    let senderId: string
    let senderType: string

    if (session.user.role === "JOB_SEEKER") {
      const jobSeeker = await prisma.jobSeeker.findUnique({
        where: { userId: session.user.id },
      })
      senderId = jobSeeker!.id
      senderType = "JOB_SEEKER"
    } else if (session.user.role === "COMPANY") {
      const company = await prisma.company.findUnique({
        where: { userId: session.user.id },
      })
      senderId = company!.id
      senderType = "COMPANY"
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const message = await prisma.message.create({
      data: {
        applicationId,
        senderId,
        senderType,
        content: validatedData.content,
      },
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error: any) {
    console.error("Error creating message:", error)
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    )
  }
}

