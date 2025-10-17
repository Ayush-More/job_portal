import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { promises as fs } from "fs"
import path from "path"

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

    // Validate file type (logos accept images; resumes/docs accept document types)
    const isLogoUpload = (type === "logo")
    const allowedDocTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    const allowedImageTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/svg+xml",
      "image/avif",
      "image/gif",
      "image/x-icon",
      "image/vnd.ms-icon",
      "image/heic",
      "image/heif",
    ]

    const inferMimeFromName = (name: string): string | undefined => {
      const lower = (name || "").toLowerCase()
      if (lower.endsWith(".png")) return "image/png"
      if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
      if (lower.endsWith(".webp")) return "image/webp"
      if (lower.endsWith(".svg")) return "image/svg+xml"
      if (lower.endsWith(".avif")) return "image/avif"
      if (lower.endsWith(".gif")) return "image/gif"
      if (lower.endsWith(".ico")) return "image/x-icon"
      if (lower.endsWith(".heic")) return "image/heic"
      if (lower.endsWith(".heif")) return "image/heif"
      if (lower.endsWith(".pdf")) return "application/pdf"
      if (lower.endsWith(".doc")) return "application/msword"
      if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      return undefined
    }

    const effectiveType = file.type || inferMimeFromName((file as any).name || "") || ""
    const allowedTypes = isLogoUpload ? allowedImageTypes : allowedDocTypes

    if (!allowedTypes.includes(effectiveType)) {
      if (isLogoUpload) {
        // Fallback: save unrecognized image locally under /public/uploads
        try {
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const uploadsDir = path.join(process.cwd(), "public", "uploads")
          await fs.mkdir(uploadsDir, { recursive: true })
          const originalName = (file as any).name || "logo"
          const safeBase = originalName.replace(/[^a-zA-Z0-9-_\.]/g, "_")
          const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeBase}`
          await fs.writeFile(path.join(uploadsDir, filename), buffer)
          return NextResponse.json({ success: true, url: `/uploads/${filename}`, public_id: null, fileName: originalName, size: file.size, storage: "local" })
        } catch (localErr) {
          return NextResponse.json({ error: "Unsupported image type." }, { status: 400 })
        }
      }
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

    // If Cloudinary not configured, store locally
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const uploadsDir = path.join(process.cwd(), "public", "uploads")
      await fs.mkdir(uploadsDir, { recursive: true })
      const originalName = (file as any).name || (isLogoUpload ? "logo" : "file")
      const safeBase = originalName.replace(/[^a-zA-Z0-9-_\.]/g, "_")
      const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeBase}`
      await fs.writeFile(path.join(uploadsDir, filename), buffer)
      return NextResponse.json({ success: true, url: `/uploads/${filename}`, public_id: null, fileName: originalName, size: file.size, storage: "local" })
    }

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file, `ittihadplacement/${type}s`)
      return NextResponse.json({ success: true, url: result.url, public_id: result.public_id, fileName: (file as any).name, size: file.size })
    } catch (uploadError: any) {
      console.error("Cloudinary upload error:", uploadError)
      // Fallback to local save when Cloudinary fails
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const uploadsDir = path.join(process.cwd(), "public", "uploads")
        await fs.mkdir(uploadsDir, { recursive: true })
        const originalName = (file as any).name || (isLogoUpload ? "logo" : "file")
        const safeBase = originalName.replace(/[^a-zA-Z0-9-_\.]/g, "_")
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}_${safeBase}`
        await fs.writeFile(path.join(uploadsDir, filename), buffer)
        return NextResponse.json({ success: true, url: `/uploads/${filename}`, public_id: null, fileName: originalName, size: file.size, storage: "local" })
      } catch (localErr) {
        return NextResponse.json({ error: "Failed to upload file." }, { status: 500 })
      }
    }

  } catch (error: any) {
    console.error("File upload error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
