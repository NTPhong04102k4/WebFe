import type { ReactNode } from 'react'
import { AuthProvider } from './AuthContext'
import { LanguageProvider } from './LanguageContext'
import { ThemeProvider } from './ThemeContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
