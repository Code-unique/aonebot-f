'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false} // prevents switching to dark mode
      forcedTheme="light"  // forces light mode
    >
      {children}
    </NextThemesProvider>
  )
}
