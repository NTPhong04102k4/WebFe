import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useUiPreferenceStore, type AppTheme } from '@/stores/uiStore'

interface ThemeContextValue {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useUiPreferenceStore((state) => state.theme)
  const setTheme = useUiPreferenceStore((state) => state.setTheme)
  const toggleTheme = useUiPreferenceStore((state) => state.toggleTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeContext must be used inside ThemeProvider')
  return context
}
