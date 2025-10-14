"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      salaryMin: parseInt(formData.get("salaryMin") as string) || undefined,
      salaryMax: parseInt(formData.get("salaryMax") as string) || undefined,
      applicationFee: parseInt(formData.get("applicationFee") as string) * 100, // Convert to cents
      guaranteeTerms: formData.get("guaranteeTerms") as string,
      guaranteePeriod: parseInt(formData.get("guaranteePeriod") as string),
      postedFor: formData.get("postedFor") as string || undefined,
    }

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || "Failed to create job")
        return
      }

      router.push("/dashboard/company")
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Post a New Job</h1>
        <p className="text-gray-600">Create a job listing with placement guarantee</p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Fill in the information about the position you're hiring for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Software Engineer"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                name="category"
                placeholder="e.g. Technology, Marketing, Sales"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. San Francisco, CA or Remote"
                required
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary (USD)</Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  placeholder="50000"
                  min="0"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary (USD)</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  placeholder="100000"
                  min="0"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                rows={6}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="List the required skills, experience, and qualifications..."
                rows={5}
                required
                disabled={loading}
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Application & Guarantee Settings</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationFee">Application Fee (USD) *</Label>
                  <Input
                    id="applicationFee"
                    name="applicationFee"
                    type="number"
                    placeholder="10"
                    min="1"
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    Minimum $1.00 - This fee demonstrates candidate commitment
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guaranteePeriod">Guarantee Period (Days) *</Label>
                  <Input
                    id="guaranteePeriod"
                    name="guaranteePeriod"
                    type="number"
                    placeholder="90"
                    min="1"
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    How long the placement guarantee lasts after hire
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guaranteeTerms">Guarantee Terms *</Label>
                  <Textarea
                    id="guaranteeTerms"
                    name="guaranteeTerms"
                    placeholder="Describe the conditions for the placement guarantee and refund eligibility..."
                    rows={4}
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    Be clear about when refunds are issued
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postedFor">Posting For (Optional)</Label>
                  <Input
                    id="postedFor"
                    name="postedFor"
                    placeholder="Leave blank if posting for your own company"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500">
                    Only if you're posting on behalf of another company
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating Job..." : "Create Job Posting"}
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

