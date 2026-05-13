import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { localPersistStorage, sessionPersistStorage } from './persistStorage'

export type AppTheme = 'light' | 'dark' | 'system'
export type ResolvedAppTheme = 'light' | 'dark'
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

function getSystemTheme(): ResolvedAppTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): AppTheme {
  if (typeof window === 'undefined') return 'light'

  try {
    const raw = window.localStorage.getItem('soldcars-ui-preferences')
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { theme?: AppTheme } }
      if (
        parsed.state?.theme === 'light' ||
        parsed.state?.theme === 'dark' ||
        parsed.state?.theme === 'system'
      ) {
        return parsed.state.theme
      }
    }
  } catch {
    // Fall back to the operating system preference.
  }

  return 'system'
}

export function resolveAppTheme(theme: AppTheme): ResolvedAppTheme {
  return theme === 'system' ? getSystemTheme() : theme
}

export function applyAppTheme(theme: AppTheme) {
  if (typeof document === 'undefined') return

  const resolvedTheme = resolveAppTheme(theme)

  document.documentElement.dataset.theme = theme
  document.documentElement.dataset.resolvedTheme = resolvedTheme
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
}

export const useUiPreferenceStore = create<UiPreferenceState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        theme: getInitialTheme(),
        language: 'vi',
        setTheme: (theme) => set({ theme }),
        toggleTheme: () => set({ theme: resolveAppTheme(get().theme) === 'light' ? 'dark' : 'light' }),
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
)

let unsubscribeAppTheme: (() => void) | undefined
let unsubscribeSystemTheme: (() => void) | undefined

function subscribeToSystemThemeChanges() {
  if (typeof window === 'undefined') return undefined

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    if (useUiPreferenceStore.getState().theme === 'system') {
      applyAppTheme('system')
    }
  }

  if (media.addEventListener) {
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }

  media.addListener(handleChange)
  return () => media.removeListener(handleChange)
}

export function subscribeToAppTheme() {
  unsubscribeAppTheme?.()
  unsubscribeSystemTheme?.()
  applyAppTheme(useUiPreferenceStore.getState().theme)

  unsubscribeAppTheme = useUiPreferenceStore.subscribe(
    (state) => state.theme,
    (theme) => {
      applyAppTheme(theme)
    }
  )
  unsubscribeSystemTheme = subscribeToSystemThemeChanges()

  return () => {
    unsubscribeAppTheme?.()
    unsubscribeSystemTheme?.()
    unsubscribeAppTheme = undefined
    unsubscribeSystemTheme = undefined
  }
}

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
