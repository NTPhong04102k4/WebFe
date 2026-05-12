import { createContext, useContext, type ReactNode } from 'react'
import { useAuthStore, type AuthRole, type AuthUser } from '@/stores/authStore'

interface AuthContextValue {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  hasRole: (roles: AuthRole[]) => boolean
  isAdmin: () => boolean
  isSuperAdmin: () => boolean
  isStaff: () => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const user = useAuthStore((state) => state.user)
  const isAdmin = useAuthStore((state) => state.isAdmin)
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin)
  const isStaff = useAuthStore((state) => state.isStaff)
  const logout = useAuthStore((state) => state.logout)

  const value: AuthContextValue = {
    accessToken,
    refreshToken,
    user,
    isAuthenticated: Boolean(accessToken && user),
    hasRole: (roles) => Boolean(user?.role && roles.includes(user.role)),
    isAdmin,
    isSuperAdmin,
    isStaff,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used inside AuthProvider')
  return context
}
