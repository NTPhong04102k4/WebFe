import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  children: React.ReactNode
  roles?: string[]
  redirectTo?: string
}

export default function ProtectedRoute({ children, roles, redirectTo = '/auth/login' }: Props) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to={redirectTo} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}
