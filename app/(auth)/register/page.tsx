"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [role, setRole] = useState<"JOB_SEEKER" | "COMPANY">("JOB_SEEKER")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      role,
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Registration failed")
        return
      }

      // Redirect to email verification page
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}&registered=true`)
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Choose your account type and get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>I am a</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={role === "JOB_SEEKER" ? "default" : "outline"}
                  onClick={() => setRole("JOB_SEEKER")}
                  disabled={loading}
                >
                  Job Seeker
                </Button>
                <Button
                  type="button"
                  variant={role === "COMPANY" ? "default" : "outline"}
                  onClick={() => setRole("COMPANY")}
                  disabled={loading}
                >
                  Company
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">
                {role === "COMPANY" ? "Company Name" : "Full Name"}
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder={role === "COMPANY" ? "Acme Inc." : "John Doe"}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

