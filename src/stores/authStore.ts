import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthRole, AuthUser } from '@/services/types/auth.types'
import { localPersistStorage } from './persistStorage'
import { decodeToken } from '@/common/utils/jwtDecode'

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

/**
 * Kiểm tra token có hợp lệ không — có chứa userUUID (NameIdentifier claim).
 * Token cũ (trước commit feat/manage revenue premium plans) không có claim này.
 */
function isTokenValid(token: string | null): boolean {
  if (!token) return false
  const decoded = decodeToken(token)
  // userUUID là Guid string — nếu rỗng nghĩa là token quá cũ
  return !!decoded?.userUUID
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
      /**
       * version 2: token cũ (version 1) thiếu UserUUID claim → tự động clear
       * Khi Zustand detect version cũ, gọi migrate() → trả về state mới
       */
      version: 2,
      migrate: (persisted: unknown, fromVersion: number) => {
        const state = persisted as Partial<AuthState> | null
        if (!state) return { accessToken: null, refreshToken: null, user: null }

        // Nếu token thiếu userUUID (cũ) → clear auth → buộc re-login
        if (!isTokenValid(state.accessToken ?? null)) {
          console.info('[Auth] Token cũ thiếu UserUUID claim — tự động logout để lấy token mới.')
          return { accessToken: null, refreshToken: null, user: null }
        }

        return state
      },
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
