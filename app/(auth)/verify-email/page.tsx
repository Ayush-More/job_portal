"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"

function VerifyEmailContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const e = params.get("email")
    const o = params.get("otp")
    if (e) setEmail(decodeURIComponent(e))
    if (o) {
      setOtp(decodeURIComponent(o))
      setMessage("Development mode: OTP pre-filled. Use this code to verify your email.")
    }
  }, [params])

  const verify = async () => {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage("Email verified! You can now sign in.")
        setTimeout(() => router.push("/login"), 800)
      } else {
        setMessage(data.error || "Invalid code")
      }
    } catch {
      setMessage("Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setResending(true)
    setMessage("")
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) setMessage("A new code has been sent.")
      else setMessage(data.error || "Failed to resend")
    } catch {
      setMessage("Failed to resend")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verify your email</CardTitle>
            <CardDescription className="text-center">Enter the 6-digit code sent to your email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <div className={`rounded-md p-3 text-sm ${
                message.includes("Development mode") 
                  ? "bg-yellow-50 text-yellow-800 border border-yellow-200" 
                  : message.includes("verified") 
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
              }`}>
                {message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification code</Label>
              <Input id="otp" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={otp} onChange={(e)=>setOtp(e.target.value.replace(/[^0-9]/g, ''))} placeholder="123456" />
            </div>
            <Button className="w-full" disabled={loading || otp.length!==6 || !email} onClick={verify}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
            <Button variant="outline" className="w-full" disabled={resending || !email} onClick={resend}>
              {resending ? "Sending..." : "Resend Code"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader fullScreen />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
