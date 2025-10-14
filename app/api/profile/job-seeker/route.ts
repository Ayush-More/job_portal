import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jobSeekerProfileSchema } from "@/lib/validations"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = jobSeekerProfileSchema.parse(body)

    const jobSeeker = await prisma.jobSeeker.update({
      where: { userId: session.user.id },
      data: validatedData,
    })

    return NextResponse.json(jobSeeker)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}

