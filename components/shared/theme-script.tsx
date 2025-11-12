"use client"

import Script from "next/script"

const STORAGE_KEY = "ittihad-theme"

const inlineScript = `
(() => {
  try {
    const root = document.documentElement;
    const stored = localStorage.getItem('${STORAGE_KEY}');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored === 'dark' || stored === 'light'
      ? stored
      : (prefersDark ? 'dark' : 'light');

    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
  } catch (error) {
    // Fail silently to avoid blocking first paint
  }
})();
`

export function ThemeScript() {
  return (
    <Script id="ittihad-theme-script" strategy="beforeInteractive">
      {inlineScript}
    </Script>
  )
}


