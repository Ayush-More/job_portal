import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const name = (body?.name || "").trim()
    const description = (body?.description || "").trim() || null

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: { name, description },
    })

    return NextResponse.json({ category })
  } catch (error: any) {
    // Unique constraint handling
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      )
    }
    console.error("Error creating category:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create category" },
      { status: 500 }
    )
  }
}


