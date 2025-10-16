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
          "inline-flex items-center justify-center rounded-[var(--radius-sm)] text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--brand-600)] text-white hover:bg-[var(--brand-700)]": variant === "default",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "border border-[var(--color-border)] bg-[var(--surface)] hover:bg-[color:rgba(15,23,42,0.03)]": variant === "outline",
            "bg-[color:rgba(15,23,42,0.04)] text-[var(--heading)] hover:bg-[color:rgba(15,23,42,0.08)]": variant === "secondary",
            "hover:bg-[color:rgba(15,23,42,0.06)]": variant === "ghost",
            "text-[var(--brand-600)] underline-offset-4 hover:underline": variant === "link",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
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

