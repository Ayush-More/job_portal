import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, and DOCX files are allowed." },
        { status: 400 }
      )
    }

    // Validate file size (10MB max for Cloudinary free tier)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        { error: "File storage not configured. Please contact administrator." },
        { status: 503 }
      )
    }

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, `ittihadplacement/${type}s`)

      return NextResponse.json({
        success: true,
        url: result.url,
        public_id: result.public_id,
        fileName: file.name,
        size: file.size,
      })

    } catch (uploadError: any) {
      console.error("Cloudinary upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file. Please try again." },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
