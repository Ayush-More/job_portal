import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public endpoint: returns active categories only
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, description: true },
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


