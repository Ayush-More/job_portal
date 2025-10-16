import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-md)] text-sm font-semibold shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 hover-scale",
          {
            "bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-500)] text-white hover:from-[var(--brand-700)] hover:to-[var(--brand-600)] hover:shadow-lg hover:shadow-[rgba(168,85,247,0.4)] active:scale-95": variant === "default",
            "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/40 active:scale-95": variant === "destructive",
            "border-2 border-[var(--brand-300)] bg-[var(--surface)] text-[var(--brand-600)] hover:bg-[var(--brand-50)] hover:border-[var(--brand-400)] hover:shadow-md hover:shadow-[rgba(168,85,247,0.2)]": variant === "outline",
            "bg-gradient-to-r from-[var(--accent-100)] to-[var(--brand-50)] text-[var(--brand-700)] hover:from-[var(--accent-50)] hover:to-[var(--brand-100)] hover:shadow-md hover:text-[var(--brand-800)]": variant === "secondary",
            "text-[var(--brand-600)] hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] hover:shadow-sm": variant === "ghost",
            "text-[var(--brand-600)] underline-offset-4 hover:underline hover:text-[var(--brand-700)]": variant === "link",
          },
          {
            "h-10 px-5 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-12 rounded-lg px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

