"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "./theme-provider"

type ThemeToggleProps = {
  variant?: "icon" | "list"
  className?: string
}

const iconBaseStyles =
  "relative flex items-center justify-center rounded-full border border-[var(--border)]/70 bg-white/80 p-2 text-[var(--brand-600)] shadow-sm backdrop-blur transition-all duration-200 hover:shadow-lg dark:border-[var(--border)] dark:bg-[var(--surface-muted)]/80 dark:text-[var(--accent-100)]"

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, toggleTheme, isReady } = useTheme()
  const nextTheme = theme === "dark" ? "light" : "dark"

  if (variant === "list") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        disabled={!isReady}
        className={cn(
          "flex w-full items-center rounded-lg px-4 py-3 text-left text-gray-700 transition-colors hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] dark:text-gray-200 dark:hover:bg-[var(--surface-muted)] dark:hover:text-white",
          !isReady && "cursor-wait opacity-70",
          className
        )}
        aria-live="polite"
      >
        <span className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)] dark:bg-[var(--surface-muted)] dark:text-[var(--accent-100)]">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </span>
        <div className="flex flex-col">
          <span className="font-medium">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Tap to switch to {nextTheme} mode
          </span>
        </div>
      </button>
    )
  }

  return (
    <button
      type="button"
      className={cn(
        iconBaseStyles,
        !isReady && "cursor-wait pointer-events-none opacity-50",
        className
      )}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      aria-live="polite"
      disabled={!isReady}
    >
      <Sun
        className={cn(
          "h-5 w-5 rotate-0 scale-100 transition-all duration-300",
          theme === "dark" && "-rotate-90 scale-0"
        )}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300",
          theme === "dark" && "rotate-0 scale-100"
        )}
      />
      <span className="sr-only">Switch to {nextTheme} mode</span>
    </button>
  )
}


