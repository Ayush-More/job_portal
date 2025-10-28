import { NextResponse } from "next/server"

// Email verification disabled: return 404 for legacy calls
export async function POST() {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function PUT() {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}