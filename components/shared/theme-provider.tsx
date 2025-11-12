"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type Theme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  isReady: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "ittihad-theme"

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const applyThemeClass = (theme: Theme) => {
  if (typeof document === "undefined") return

  const root = document.documentElement
  const nextIsDark = theme === "dark"

  root.classList.toggle("dark", nextIsDark)
  // Ensure native UI (inputs, scrollbars, etc.) adapt to the active theme
  root.style.colorScheme = nextIsDark ? "dark" : "light"
}

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") return "light"

  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
  if (stored === "dark" || stored === "light") {
    return stored
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
  return mediaQuery.matches ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [isReady, setIsReady] = useState(false)

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
    applyThemeClass(next)
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark"
    setTheme(next)
  }, [setTheme, theme])

  useEffect(() => {
    const initial = getPreferredTheme()
    setThemeState(initial)
    applyThemeClass(initial)
    setIsReady(true)

    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (event: MediaQueryListEvent) => {
      // Respect explicit user choice stored in localStorage
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === "dark" || stored === "light") {
        return
      }
      const nextTheme = event.matches ? "dark" : "light"
      setThemeState(nextTheme)
      applyThemeClass(nextTheme)
    }

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    const legacyListener = (event: MediaQueryListEvent) => handleChange(event)
    mediaQuery.addListener(legacyListener)
    return () => mediaQuery.removeListener(legacyListener)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isReady,
      setTheme,
      toggleTheme,
    }),
    [isReady, setTheme, theme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}


