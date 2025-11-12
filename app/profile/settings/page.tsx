"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { Loader } from "@/components/ui/loader"
import { Mail, Lock, User } from "lucide-react"

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { addToast } = useToast()
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  async function handleEmailUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingEmail(true)

    try {
      const formData = new FormData(e.currentTarget)
      const newEmail = formData.get("newEmail") as string
      const currentPassword = formData.get("currentPasswordEmail") as string

      const response = await fetch("/api/profile/update-email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, currentPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        addToast("Email updated successfully! Please sign in again.", "success")
        // Sign out and redirect to login
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } else {
        addToast(data.error || "Failed to update email", "error")
      }
    } catch (error) {
      console.error("Email update error:", error)
      addToast("Something went wrong", "error")
    } finally {
      setLoadingEmail(false)
    }
  }

  async function handlePasswordUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoadingPassword(true)

    try {
      const formData = new FormData(e.currentTarget)
      const currentPassword = formData.get("currentPassword") as string
      const newPassword = formData.get("newPassword") as string
      const confirmPassword = formData.get("confirmPassword") as string

      if (newPassword !== confirmPassword) {
        addToast("New passwords do not match", "error")
        setLoadingPassword(false)
        return
      }

      if (newPassword.length < 6) {
        addToast("Password must be at least 6 characters long", "error")
        setLoadingPassword(false)
        return
      }

      const response = await fetch("/api/profile/update-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        addToast("Password updated successfully!", "success")
        // Clear form
        e.currentTarget.reset()
      } else {
        addToast(data.error || "Failed to update password", "error")
      }
    } catch (error) {
      console.error("Password update error:", error)
      addToast("Something went wrong", "error")
    } finally {
      setLoadingPassword(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Button onClick={() => router.push("/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      {(loadingEmail || loadingPassword) && <Loader fullScreen />}
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl text-[var(--brand-600)] font-bold flex items-center gap-2">
            <User className="h-8 w-8" />
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your account settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-1">
          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                View your current account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-gray-600">Name</Label>
                  <p className="text-lg font-medium">{session.user.name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Current Email</Label>
                  <p className="text-lg font-medium">{session.user.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Role</Label>
                  <p className="text-lg font-medium capitalize">
                    {session.user.role.toLowerCase().replace("_", " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Update Email Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Update Email Address
              </CardTitle>
              <CardDescription>
                Change the email address associated with your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail">New Email Address</Label>
                  <Input
                    id="newEmail"
                    name="newEmail"
                    type="email"
                    placeholder="newemail@example.com"
                    required
                    disabled={loadingEmail}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentPasswordEmail">Current Password</Label>
                  <Input
                    id="currentPasswordEmail"
                    name="currentPasswordEmail"
                    type="password"
                    placeholder="Enter your current password"
                    required
                    disabled={loadingEmail}
                  />
                  <p className="text-sm text-gray-500">
                    Confirm your current password to update your email
                  </p>
                </div>
                <Button type="submit" disabled={loadingEmail}>
                  {loadingEmail ? "Updating..." : "Update Email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Update Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Update Password
              </CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    required
                    disabled={loadingPassword}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    required
                    disabled={loadingPassword}
                    minLength={6}
                  />
                  <p className="text-sm text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    disabled={loadingPassword}
                    minLength={6}
                  />
                </div>
                <Button type="submit" disabled={loadingPassword}>
                  {loadingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

