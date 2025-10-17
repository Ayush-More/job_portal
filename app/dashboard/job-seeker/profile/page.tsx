"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { Loader } from "@/components/ui/loader"

export default function JobSeekerProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState("")

  useEffect(() => {
    if (session?.user.role !== "JOB_SEEKER") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Fetch existing profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) return
      
      try {
        const response = await fetch("/api/profile/job-seeker")
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
          setSkills(profileData.skills?.join(", ") || "")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setFetching(false)
      }
    }

    if (session?.user.role === "JOB_SEEKER") {
      fetchProfile()
    }
  }, [session])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const resumeFile = formData.get("resume") as File

      // Prepare profile data
      const profileData = {
        phone: formData.get("phone") as string,
        location: formData.get("location") as string,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        experience: parseInt(formData.get("experience") as string) || 0,
        education: formData.get("education") as string,
        bio: formData.get("bio") as string,
      }

      let resumeUrl = profile?.resume // Keep existing resume if no new one uploaded

      // Handle resume upload if a file is selected
      if (resumeFile && resumeFile.size > 0) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", resumeFile)
        uploadFormData.append("type", "resume")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          resumeUrl = uploadData.url
        } else {
          addToast("Failed to upload resume. Profile saved without resume.", "error")
        }
      }

      // Update profile with resume URL
      const finalData = {
        ...profileData,
        resume: resumeUrl,
      }

      const response = await fetch("/api/profile/job-seeker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      })

      if (response.ok) {
        addToast("Profile updated successfully!", "success")
        router.push("/dashboard/job-seeker")
      } else {
        const error = await response.json()
        addToast(error.error || "Failed to update profile", "error")
      }
    } catch (error) {
      console.error("Profile update error:", error)
      addToast("Something went wrong", "error")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Job Seeker Profile</h1>
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
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      {loading && <Loader fullScreen />}
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl text-[var(--brand-600)] font-bold">My Profile</h1>
          <p className="text-gray-600">Update your professional information</p>
        </div>

        <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Keep your profile up to date to attract better opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                defaultValue={profile?.phone || ""}
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
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                name="skills"
                placeholder="JavaScript, React, Node.js, Python"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                disabled={loading}
              />
              <p className="text-sm text-gray-500">Separate skills with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                name="experience"
                type="number"
                min="0"
                placeholder="5"
                defaultValue={profile?.experience || ""}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                name="education"
                placeholder="e.g. BS in Computer Science, Stanford University"
                defaultValue={profile?.education || ""}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                rows={5}
                defaultValue={profile?.bio || ""}
                disabled={loading}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Resume</h3>
              <div className="space-y-2">
                <Label htmlFor="resume">Upload Resume</Label>
                <Input
                  id="resume"
                  name="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  PDF, DOC, or DOCX format (max 5MB)
                </p>
                {profile?.resume && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      ✅ Current resume: <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="underline">View Resume</a>
                    </p>
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
    </div>
  )
}

