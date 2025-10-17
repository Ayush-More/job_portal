"use client"

import { useState, useTransition } from "react"
import { useToast } from "@/components/ui/toast"

type Props = {
  applicationId: string
  initialStatus: "SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "ACCEPTED" | "REJECTED"
  onUpdated?: (newStatus: Props["initialStatus"]) => void
}

export default function ApplicationActions({ applicationId, initialStatus, onUpdated }: Props) {
  const [status, setStatus] = useState<Props["initialStatus"]>(initialStatus)
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState<string>("")
  const { addToast } = useToast()

  async function updateStatus(nextStatus: Props["initialStatus"]) {
    try {
      setLoading(nextStatus)
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Failed to update status")
      }
      setStatus(nextStatus)
      onUpdated?.(nextStatus)
      addToast(`Application ${nextStatus.toLowerCase().replace('_', ' ')} successfully!`, "success")
      startTransition(() => {
        // refresh server components
        // @ts-ignore - available in Next app router
        if (typeof window !== "undefined") window.location.reload()
      })
    } catch (e) {
      addToast((e as Error).message, "error")
    } finally {
      setLoading("")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => updateStatus("ACCEPTED")}
        disabled={isPending || loading === "ACCEPTED"}
        className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "ACCEPTED" ? "Accepting..." : "Accept"}
      </button>
      <button
        type="button"
        onClick={() => updateStatus("REJECTED")}
        disabled={isPending || loading === "REJECTED"}
        className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading === "REJECTED" ? "Rejecting..." : "Reject"}
      </button>
      <button
        type="button"
        onClick={() => updateStatus("UNDER_REVIEW")}
        disabled={isPending || loading === "UNDER_REVIEW"}
        className="inline-flex items-center rounded-md bg-gray-200 px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-300 disabled:opacity-50"
      >
        {loading === "UNDER_REVIEW" ? "Updating..." : "Mark Under Review"}
      </button>
    </div>
  )
}


