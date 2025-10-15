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
              
              {/* Current Logo Display */}
              {profile?.logo ? (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img 
                        src={profile.logo} 
                        alt="Current company logo" 
                        className="w-24 h-24 object-contain border rounded-lg bg-white p-2 shadow-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Current Logo</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        This is your current company logo that appears on job listings and company profile.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Active
                        </span>
                        <a 
                          href={profile.logo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          View full size
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">No Logo Uploaded</h4>
                      <p className="text-sm text-yellow-700">
                        Add a company logo to make your job listings more attractive to candidates.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logo Upload Section */}
              <div className="space-y-3">
                <Label htmlFor="logo">
                  {profile?.logo ? "Update Logo" : "Upload Logo"}
                </Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  className="cursor-pointer"
                />
                <div className="text-sm text-gray-500 space-y-1">
                  <p>• Supported formats: PNG, JPG, JPEG, SVG</p>
                  <p>• Maximum file size: 10MB</p>
                  <p>• Recommended size: 200x200 pixels or larger</p>
                  <p>• Logo should be square or have a transparent background</p>
                </div>
                
                {profile?.logo && (
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                    <strong>Note:</strong> Uploading a new logo will replace your current one. 
                    The new logo will be visible immediately after saving your profile.
                  </p>
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

