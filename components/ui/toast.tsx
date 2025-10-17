"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

type ToastType = "success" | "error" | "info"

type Toast = {
  id: string
  message: string
  type: ToastType
}

type ToastContextValue = {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const value = useMemo(() => ({ addToast }), [addToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within a ToastProvider")
  return ctx
}

function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed right-4 top-4 z-[100] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md border px-4 py-3 text-sm shadow-md ${
            t.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : t.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
