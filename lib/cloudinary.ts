import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Helper function to upload files
export async function uploadToCloudinary(
  file: File,
  folder: string = 'ittihadplacement/resumes'
): Promise<{ url: string; public_id: string }> {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.')
  }

  // Convert file to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Convert buffer to base64 string for Cloudinary upload
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'auto', // Automatically detect file type
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    })

    return {
      url: result.secure_url,
      public_id: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

// Helper function to delete files from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file from Cloudinary')
  }
}
