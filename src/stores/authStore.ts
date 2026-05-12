import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthRole, AuthUser } from '@/services/types/auth.types'
import { localPersistStorage } from './persistStorage'

export type { AuthUser, AuthRole }

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  setTokens: (access: string, refresh: string) => void
  setUser: (user: AuthUser) => void
  clearUser: () => void
  logout: () => void
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  isStaff: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      isAdmin: () => ['Admin', 'SuperAdmin'].includes(get().user?.role ?? ''),
      isSuperAdmin: () => get().user?.role === 'SuperAdmin',
      isStaff: () => get().user?.role === 'Staff',
    }),
    {
      name: 'soldcars-auth',
      storage: localPersistStorage,
      version: 1,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
