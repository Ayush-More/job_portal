import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 focus:ring-offset-[var(--ring-offset)]",
        {
          "border-transparent bg-[var(--brand-600)] text-white": variant === "default",
          "border-transparent bg-[color:rgba(15,23,42,0.06)] text-[var(--heading)]": variant === "secondary",
          "border-transparent bg-red-600 text-white": variant === "destructive",
          "border-transparent bg-green-600 text-white": variant === "success",
          "text-[var(--heading)] border-[var(--color-border)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

