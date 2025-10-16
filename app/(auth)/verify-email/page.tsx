"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Mail, AlertCircle } from "lucide-react"

function VerifyEmailClient() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resend">("loading")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const token = searchParams.get("token")
  const emailParam = searchParams.get("email")
  const registered = searchParams.get("registered") === "true"

  useEffect(() => {
    if (token && emailParam) {
      verifyEmail(token, decodeURIComponent(emailParam))
    } else if (registered && emailParam) {
      // User just registered, show success message and resend option
      setStatus("resend")
      setEmail(decodeURIComponent(emailParam))
      setMessage("Registration successful! Please check your email for a verification link. If you don't see it, you can resend it below.")
    } else {
      setStatus("resend")
      setMessage("Please enter your email to resend verification link")
    }
  }, [token, emailParam, registered])

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Email verified successfully! You can now log in to your account.")
      } else {
        setStatus("error")
        setMessage(data.error || "Verification failed")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred during verification")
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setMessage("Please enter your email address")
      return
    }

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Verification email sent! Please check your inbox.")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to resend verification email")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while resending verification email")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              {status === "success" && <CheckCircle className="h-6 w-6 text-green-600" />}
              {status === "error" && <XCircle className="h-6 w-6 text-red-600" />}
              {status === "loading" && <Mail className="h-6 w-6 text-blue-600" />}
              {status === "resend" && <AlertCircle className="h-6 w-6 text-yellow-600" />}
            </div>
            <CardTitle className="mt-2">
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
              {status === "loading" && "Verifying Email..."}
              {status === "resend" && "Resend Verification"}
            </CardTitle>
            <CardDescription>
              {status === "success" && "Your email has been successfully verified"}
              {status === "error" && "There was an issue verifying your email"}
              {status === "loading" && "Please wait while we verify your email"}
              {status === "resend" && "Enter your email to receive a new verification link"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <div className={`p-4 rounded-md ${
                status === "success" ? "bg-green-50 text-green-700" :
                status === "error" ? "bg-red-50 text-red-700" :
                "bg-blue-50 text-blue-700"
              }`}>
                {message}
              </div>
            )}

            {status === "resend" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={resendVerification}
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setStatus("resend")
                    setMessage("")
                    setEmail(emailParam || "")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                <Button
                  onClick={() => router.push("/register")}
                  variant="ghost"
                  className="w-full"
                >
                  Back to Registration
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center py-24">
        <div className="text-sm text-[var(--color-muted)]">Loading…</div>
      </div>
    }>
      <VerifyEmailClient />
    </Suspense>
  )
}