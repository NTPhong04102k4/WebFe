import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useUiPreferenceStore, type AppLanguage } from '@/stores/uiStore'

interface LanguageContextValue {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useUiPreferenceStore((state) => state.language)
  const setLanguage = useUiPreferenceStore((state) => state.setLanguage)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguageContext must be used inside LanguageProvider')
  return context
}
