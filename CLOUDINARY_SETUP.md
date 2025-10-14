# Cloudinary Setup Guide

This guide will help you set up Cloudinary for resume file storage in your application.

## 🚀 Quick Setup (2 minutes)

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up For Free"**
3. Fill in your details and create account
4. Verify your email if required

### Step 2: Get Your Credentials

1. After logging in, you'll see your **Dashboard**
2. Look for the **"Product Environment Credentials"** section
3. Copy these three values:
   - **Cloud Name**
   - **API Key** 
   - **API Secret**

### Step 3: Update Environment Variables

Open your `.env.local` file and replace the placeholder values:

```env
# Cloudinary (Get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME="your_actual_cloud_name"
CLOUDINARY_API_KEY="your_actual_api_key"
CLOUDINARY_API_SECRET="your_actual_api_secret"
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME="dummy_cloud_123"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz123456"
```

### Step 4: Test the Setup

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Test file upload:**
   - Go to `/dashboard/job-seeker/profile`
   - Try uploading a resume file
   - Check if it works without errors

## 📁 How It Works

- **File Organization**: Files are stored in folders like `ittihadplacement/resumes/`
- **File Naming**: Cloudinary automatically generates unique filenames
- **URL Format**: `https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/ittihadplacement/resumes/filename.pdf`
- **File Size**: Up to 10MB per file (free tier)
- **Storage**: 25GB free storage, 25GB bandwidth per month

## 🎯 Features You Get

### ✅ **Automatic Features:**
- **Secure URLs**: All files get HTTPS URLs
- **Unique Filenames**: No filename conflicts
- **File Validation**: Only PDF, DOC, DOCX files allowed
- **Size Limits**: 10MB maximum file size
- **Folder Organization**: Files organized by type

### ✅ **Free Tier Includes:**
- 25GB storage
- 25GB bandwidth per month
- Image optimization (if you add images later)
- Video support (if needed)
- CDN delivery

## 🔧 Advanced Configuration (Optional)

### Custom Upload Settings

If you want to customize upload settings, edit `lib/cloudinary.ts`:

```typescript
const result = await cloudinary.uploader.upload(base64String, {
  folder: 'ittihadplacement/resumes',
  resource_type: 'auto',
  use_filename: true,
  unique_filename: true,
  overwrite: false,
  // Add custom settings here:
  transformation: [
    { quality: 'auto' },
    { format: 'auto' }
  ]
})
```

### File Deletion

To delete files when users update their resumes, you can use:

```typescript
import { deleteFromCloudinary } from '@/lib/cloudinary'

// Delete old resume before uploading new one
await deleteFromCloudinary(public_id)
```

## 🚨 Troubleshooting

### "File storage not configured"
- Make sure you've added the Cloudinary credentials to `.env.local`
- Restart your development server after adding the variables
- Check that the credentials are correct (no extra spaces)

### "Failed to upload file"
- Check your internet connection
- Verify your Cloudinary account is active
- Check the file size (must be under 10MB)
- Ensure file type is PDF, DOC, or DOCX

### "Invalid credentials"
- Double-check your Cloud Name, API Key, and API Secret
- Make sure there are no extra spaces or quotes in `.env.local`
- Verify you copied the credentials from the correct Cloudinary dashboard

## 💰 Pricing

### Free Tier (Perfect for Development):
- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: 25,000/month
- **Perfect for**: Personal projects, small applications

### Paid Plans (When You Scale):
- **Basic**: $89/month for 100GB storage, 100GB bandwidth
- **Advanced**: $249/month for 500GB storage, 500GB bandwidth
- **Enterprise**: Custom pricing for large applications

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit your API secret to version control
2. **File Validation**: Only allow specific file types
3. **Size Limits**: Enforce file size limits
4. **User Authentication**: Only authenticated users can upload files
5. **Folder Structure**: Organize files in folders to prevent conflicts

## 📞 Support

- **Cloudinary Docs**: [https://cloudinary.com/documentation](https://cloudinary.com/documentation)
- **Community Forum**: [https://support.cloudinary.com](https://support.cloudinary.com)
- **Free Tier Support**: Available via community forum

---

**Your resume upload system is now ready with enterprise-grade cloud storage!** 🎉
