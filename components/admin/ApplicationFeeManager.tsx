"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "@/components/ui/loader"
import { useToast } from "@/components/ui/toast"
import { DollarSign } from "lucide-react"

export default function ApplicationFeeManager() {
  const [fee, setFee] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    fetchCurrentFee()
  }, [])

  async function fetchCurrentFee() {
    try {
      const response = await fetch("/api/admin/application-fee")
      if (response.ok) {
        const data = await response.json()
        setFee(data.amountInCents)
      } else {
        addToast("Failed to fetch current fee", "error")
      }
    } catch (error) {
      addToast("Error fetching fee", "error")
    } finally {
      setFetching(false)
    }
  }

  async function handleUpdateFee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/application-fee", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInCents: fee }),
      })

      if (response.ok) {
        addToast("Application fee updated successfully!", "success")
      } else {
        const error = await response.json()
        addToast(error.error || "Failed to update fee", "error")
      }
    } catch (error) {
      addToast("Error updating fee", "error")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Application Fee Management
          </CardTitle>
          <CardDescription>
            Set the global application fee for all job postings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Application Fee Management
        </CardTitle>
        <CardDescription>
          Set the global application fee for all job postings. This fee applies to all jobs and goes directly to the admin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <Loader fullScreen />}
        <form onSubmit={handleUpdateFee} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fee">Application Fee (USD)</Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">$</span>
              <Input
                id="fee"
                type="number"
                min="1"
                step="0.01"
                value={(fee / 100).toFixed(2)}
                onChange={(e) => setFee(Math.round(parseFloat(e.target.value) * 100))}
                disabled={loading}
                className="text-lg font-semibold"
              />
            </div>
            <p className="text-sm text-gray-500">
              Minimum fee: $1.00. This amount will be charged to job seekers when they apply to any job.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading || fee < 100}>
              {loading ? "Updating..." : "Update Fee"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={fetchCurrentFee}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Current Fee Information</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Amount:</strong> ${(fee / 100).toFixed(2)} USD</p>
            <p><strong>Applies to:</strong> All job postings</p>
            <p><strong>Revenue goes to:</strong> Admin</p>
            <p><strong>Companies:</strong> No financial involvement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
