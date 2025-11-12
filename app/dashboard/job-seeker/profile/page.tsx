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
  const [currentlyEmployed, setCurrentlyEmployed] = useState<boolean | undefined>(undefined)
  const [gender, setGender] = useState<string>("")
  const [qualificationStatus, setQualificationStatus] = useState<"QUALIFIED" | "NON_QUALIFIED" | "">("")
  const [isFresher, setIsFresher] = useState<boolean | undefined>(undefined)
  const [maritalStatus, setMaritalStatus] = useState<"MARRIED" | "UNMARRIED" | "">("")
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    if (session?.user.role !== "JOB_SEEKER") {
      router.push("/dashboard")
    }
  }, [session, router])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" })
        const data = await res.json()
        if (res.ok) {
          setCategories((data?.categories || []).map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch (e) {
        // ignore, leave categories empty
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

  // Fetch existing profile data
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user) return
      
      try {
        const response = await fetch("/api/profile/job-seeker", { cache: "no-store" })
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
          setSkills(profileData.skills?.join(", ") || "")
          setCurrentlyEmployed(typeof profileData.currentlyEmployed === "boolean" ? profileData.currentlyEmployed : undefined)
          setGender(profileData.gender || "")
          setQualificationStatus(
            profileData.qualificationStatus === "QUALIFIED" || profileData.qualificationStatus === "NON_QUALIFIED"
              ? profileData.qualificationStatus
              : ""
          )
          setIsFresher(typeof profileData.isFresher === "boolean" ? profileData.isFresher : undefined)
          setMaritalStatus(
            profileData.maritalStatus === "MARRIED" || profileData.maritalStatus === "UNMARRIED"
              ? profileData.maritalStatus
              : ""
          )
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

      const getStringValue = (key: string) => {
        const value = formData.get(key)
        if (typeof value !== "string") return undefined
        const trimmed = value.trim()
        return trimmed.length ? trimmed : undefined
      }

      // Prepare profile data
      const profileData = {
        firstName: getStringValue("firstName"),
        lastName: getStringValue("lastName"),
        motherName: getStringValue("motherName"),
        fatherName: getStringValue("fatherName"),
        dateOfBirth: getStringValue("dateOfBirth"),
        nationality: getStringValue("nationality"),
        qualificationStatus: qualificationStatus || undefined,
        isFresher: typeof isFresher === "boolean" ? isFresher : undefined,
        jobCategory: getStringValue("jobCategory"),
        phone: getStringValue("phone"),
        alternatePhone: getStringValue("alternatePhone"),
        contactEmail: getStringValue("contactEmail"),
        state: getStringValue("state"),
        district: getStringValue("district"),
        village: getStringValue("village"),
        maritalStatus: maritalStatus || undefined,
        skills: skills.split(",").map(s => s.trim()).filter(Boolean),
        experience: parseInt(formData.get("experience") as string) || 0,
        education: getStringValue("education"),
        bio: getStringValue("bio"),
        currentlyEmployed: typeof currentlyEmployed === "boolean" ? currentlyEmployed : undefined,
        gender: gender || undefined,
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  defaultValue={profile?.firstName || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  defaultValue={profile?.lastName || ""}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name</Label>
                <Input
                  id="motherName"
                  name="motherName"
                  placeholder="Mother's Name"
                  defaultValue={profile?.motherName || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  placeholder="Father's Name"
                  defaultValue={profile?.fatherName || ""}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  defaultValue={profile?.dateOfBirth || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  placeholder="Nationality"
                  defaultValue={profile?.nationality || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobCategory">Job Category</Label>
                {loadingCategories ? (
                  <div className="flex h-10 w-full items-center rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="space-y-2">
                    <div className="flex h-10 w-full items-center rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-600">
                      No categories available
                    </div>
                    <p className="text-xs text-yellow-600">
                      Categories will appear here once they are created by administrators.
                    </p>
                    <Input
                      id="jobCategory"
                      name="jobCategory"
                      placeholder="Enter category manually"
                      defaultValue={profile?.jobCategory || ""}
                      disabled={loading}
                    />
                  </div>
                ) : (
                  <select
                    id="jobCategory"
                    name="jobCategory"
                    required
                    disabled={loading}
                    defaultValue={profile?.jobCategory || ""}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  defaultValue={profile?.phone || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Family Mobile Number</Label>
                <Input
                  id="alternatePhone"
                  name="alternatePhone"
                  type="tel"
                  placeholder="+1 (555) 765-4321"
                  defaultValue={profile?.alternatePhone || ""}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Gmail ID</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                placeholder="example@gmail.com"
                defaultValue={profile?.contactEmail || ""}
                disabled={loading}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="state">State Name</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  defaultValue={profile?.state || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District Name</Label>
                <Input
                  id="district"
                  name="district"
                  placeholder="District"
                  defaultValue={profile?.district || ""}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="village">Permanent Address</Label>
                <Input
                  id="village"
                  name="village"
                  placeholder="Permanent Address"
                  defaultValue={profile?.village || ""}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Are you currently employed?</Label>
                <div className="rounded-lg border p-3 bg-white">
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        currentlyEmployed === true
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="currentlyEmployed"
                        className="sr-only"
                        checked={currentlyEmployed === true}
                        onChange={() => setCurrentlyEmployed(true)}
                        disabled={loading}
                      />
                      Yes, I am employed
                    </label>
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        currentlyEmployed === false
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="currentlyEmployed"
                        className="sr-only"
                        checked={currentlyEmployed === false}
                        onChange={() => setCurrentlyEmployed(false)}
                        disabled={loading}
                      />
                      No, I am not employed
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="rounded-lg border p-3 bg-white">
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        gender === "Male"
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        className="sr-only"
                        checked={gender === "Male"}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={loading}
                      />
                      Male
                    </label>
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        gender === "Female"
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        className="sr-only"
                        checked={gender === "Female"}
                        onChange={(e) => setGender(e.target.value)}
                        disabled={loading}
                      />
                      Female
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Qualification Status</Label>
                <div className="rounded-lg border p-3 bg-white">
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        qualificationStatus === "QUALIFIED"
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="qualificationStatus"
                        className="sr-only"
                        checked={qualificationStatus === "QUALIFIED"}
                        onChange={() => setQualificationStatus("QUALIFIED")}
                        disabled={loading}
                      />
                      Qualified
                    </label>
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        qualificationStatus === "NON_QUALIFIED"
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="qualificationStatus"
                        className="sr-only"
                        checked={qualificationStatus === "NON_QUALIFIED"}
                        onChange={() => setQualificationStatus("NON_QUALIFIED")}
                        disabled={loading}
                      />
                      Non Qualified
                    </label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <div className="rounded-lg border p-3 bg-white">
                  <div className="flex gap-3">
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        isFresher === true
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="experienceLevel"
                        className="sr-only"
                        checked={isFresher === true}
                        onChange={() => setIsFresher(true)}
                        disabled={loading}
                      />
                      Fresher
                    </label>
                    <label
                      className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                        isFresher === false
                          ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="experienceLevel"
                        className="sr-only"
                        checked={isFresher === false}
                        onChange={() => setIsFresher(false)}
                        disabled={loading}
                      />
                      Experienced
                    </label>
                  </div>
                </div>
              </div>
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Marital Status</Label>
              <div className="rounded-lg border p-3 bg-white">
                <div className="flex gap-3">
                  <label
                    className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                      maritalStatus === "MARRIED"
                        ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="maritalStatus"
                      className="sr-only"
                      checked={maritalStatus === "MARRIED"}
                      onChange={() => setMaritalStatus("MARRIED")}
                      disabled={loading}
                    />
                    Married
                  </label>
                  <label
                    className={`flex-1 cursor-pointer select-none rounded-md border px-4 py-2 text-sm transition-all ${
                      maritalStatus === "UNMARRIED"
                        ? "border-[var(--brand-400)] bg-[var(--brand-50)] text-[var(--brand-700)] ring-2 ring-[var(--brand-200)]"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="maritalStatus"
                      className="sr-only"
                      checked={maritalStatus === "UNMARRIED"}
                      onChange={() => setMaritalStatus("UNMARRIED")}
                      disabled={loading}
                    />
                    Unmarried
                  </label>
                </div>
              </div>
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
                required
              />
              <p className="text-sm text-gray-500">Separate skills with commas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                name="education"
                placeholder="e.g. BS in Computer Science, Stanford University"
                defaultValue={profile?.education || ""}
                disabled={loading}
                required
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
                required
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
                {loading ? "Saving..." : "Update Profile"}
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

