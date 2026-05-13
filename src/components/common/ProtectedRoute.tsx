import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { canAccessStaffBackend, getDefaultRouteForRoles, getUserRoles, normalizeRoles } from '@/common/utils/roles'
import { getRolesFromToken, isTokenExpired } from '@/services/decode'

interface Props {
  children: React.ReactNode
  roles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ children, roles, redirectTo = '/auth/login' }: Props) {
  const { accessToken, user, logout } = useAuthContext()
  if (!accessToken || !user || isTokenExpired(accessToken)) {
    if (accessToken && isTokenExpired(accessToken)) logout()
    return <Navigate to={redirectTo} replace />
  }

  const tokenRoles = getRolesFromToken(accessToken)
  const userRoles = tokenRoles.length > 0 ? tokenRoles : getUserRoles(user)
  const normalizedUserRoles = normalizeRoles(userRoles)

  if (!roles && canAccessStaffBackend(userRoles)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (roles) {
    const allowedRoles = normalizeRoles(roles)
    const allowed = normalizedUserRoles.some((role) => allowedRoles.includes(role))
    if (!allowed) return <Navigate to={getDefaultRouteForRoles(userRoles)} replace />
  }

  return <>{children}</>
}
