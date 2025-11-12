import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { jobSeekerProfileSchema } from "@/lib/validations"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobSeeker = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        userId: true,
        phone: true,
        skills: true,
        experience: true,
        education: true,
        bio: true,
        resume: true,
        currentlyEmployed: true,
        gender: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!jobSeeker) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json(jobSeeker)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = jobSeekerProfileSchema.parse(body)

    // Include all fields including the new ones
    const {
      phone,
      skills,
      experience,
      education,
      bio,
      resume,
      currentlyEmployed,
      gender,
    } = validatedData as any

    const safeData: any = {
      ...(phone !== undefined ? { phone } : {}),
      ...(skills !== undefined ? { skills } : {}),
      ...(experience !== undefined ? { experience } : {}),
      ...(education !== undefined ? { education } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(resume !== undefined ? { resume } : {}),
      ...(currentlyEmployed !== undefined ? { currentlyEmployed } : {}),
      ...(gender !== undefined ? { gender } : {}),
    }

    // Check if profile exists, if not create it
    const existingProfile = await prisma.jobSeeker.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    const jobSeeker = existingProfile
      ? await prisma.jobSeeker.update({
          where: { userId: session.user.id },
          data: safeData,
          select: {
            id: true,
            userId: true,
            phone: true,
            skills: true,
            experience: true,
            education: true,
            bio: true,
            resume: true,
            currentlyEmployed: true,
            gender: true,
          },
        })
      : await prisma.jobSeeker.create({
          data: {
            userId: session.user.id,
            ...safeData,
          },
          select: {
            id: true,
            userId: true,
            phone: true,
            skills: true,
            experience: true,
            education: true,
            bio: true,
            resume: true,
            currentlyEmployed: true,
            gender: true,
          },
        })

    return NextResponse.json(jobSeeker)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    )
  }
}

