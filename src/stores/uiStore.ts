import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { localPersistStorage, sessionPersistStorage } from './persistStorage'

export type AppTheme = 'light' | 'dark'
export type AppLanguage = 'vi' | 'en'

interface UiPreferenceState {
  theme: AppTheme
  language: AppLanguage
  setTheme: (theme: AppTheme) => void
  toggleTheme: () => void
  setLanguage: (language: AppLanguage) => void
}

interface UiSessionState {
  adminSidebarCollapsed: boolean
  setAdminSidebarCollapsed: (collapsed: boolean) => void
}

export const useUiPreferenceStore = create<UiPreferenceState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'vi',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'soldcars-ui-preferences',
      storage: localPersistStorage,
      version: 1,
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
)

export const useUiSessionStore = create<UiSessionState>()(
  persist(
    (set) => ({
      adminSidebarCollapsed: false,
      setAdminSidebarCollapsed: (adminSidebarCollapsed) => set({ adminSidebarCollapsed }),
    }),
    {
      name: 'soldcars-ui-session',
      storage: sessionPersistStorage,
      version: 1,
      partialize: (state) => ({
        adminSidebarCollapsed: state.adminSidebarCollapsed,
      }),
    }
  )
)
