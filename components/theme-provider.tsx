'use client'

import * as React from 'react'
import { ThemeProvider as CustomThemeProvider } from '../src/components/theme-provider'

export function ThemeProvider({ children, ...props }: { children: React.ReactNode }) {
  return <CustomThemeProvider defaultTheme="light" storageKey="vite-ui-theme">{children}</CustomThemeProvider>
}