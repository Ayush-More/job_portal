"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function CompanyProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (session?.user.role !== "COMPANY") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch existing profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) return
      
      try {
        const response = await fetch("/api/profile/company")
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error fetching company profile:", error)
      } finally {
        setFetching(false)
      }
    }

    if (session?.user.role === "COMPANY") {
      fetchProfile()
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const logoFile = formData.get("logo") as File

      // Prepare profile data
      const profileData = {
        companyName: formData.get("companyName") as string,
        description: formData.get("description") as string,
        industry: formData.get("industry") as string,
        website: formData.get("website") as string,
        location: formData.get("location") as string,
        size: formData.get("size") as string,
      }

      let logoUrl = profile?.logo // Keep existing logo if no new one uploaded

      // Handle logo upload if a file is selected
      if (logoFile && logoFile.size > 0) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", logoFile)
        uploadFormData.append("type", "logo")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          logoUrl = uploadData.url
        } else {
          alert("Failed to upload logo. Profile saved without logo.")
        }
      }

      // Update profile with logo URL
      const finalData = {
        ...profileData,
        logo: logoUrl,
      }

      const response = await fetch("/api/profile/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      })

      if (response.ok) {
        alert("Profile updated successfully!")
        router.push("/dashboard/company")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      alert("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
        <Card className="max-w-3xl animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Company Profile</h1>
        <p className="text-gray-600">Update your company information</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Keep your company profile updated to attract top talent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Acme Inc."
                defaultValue={profile?.companyName || ""}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                name="industry"
                placeholder="e.g. Technology, Healthcare, Finance"
                defaultValue={profile?.industry || ""}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. San Francisco, CA"
                defaultValue={profile?.location || ""}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Company Size</Label>
              <Input
                id="size"
                name="size"
                placeholder="e.g. 1-10, 11-50, 51-200, 201-500, 500+"
                defaultValue={profile?.size || ""}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                placeholder="https://www.example.com"
                defaultValue={profile?.website || ""}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell job seekers about your company, mission, culture, and what makes you unique..."
                rows={6}
                defaultValue={profile?.description || ""}
                disabled={loading}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Company Logo</h3>
              <div className="space-y-2">
                <Label htmlFor="logo">Upload Logo</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  PNG, JPG, or SVG format (max 10MB)
                </p>
                {profile?.logo && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600 mb-2">
                      ✅ Current logo:
                    </p>
                    <img 
                      src={profile.logo} 
                      alt="Company logo" 
                      className="w-20 h-20 object-contain border rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

