import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import AppRouter from '@/router'
import { useAuthStore } from '@/stores/authStore'
import { useCartUserSync } from '@/hooks/useCartUserSync'

export default function App() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  useCartUserSync()

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: string }>).detail
      logout()
      const loginPath = detail.path?.startsWith('/admin') ? '/auth/admin/login' : '/auth/login'
      navigate(loginPath, { replace: true })
    }
    window.addEventListener('auth:unauthorized', handler)
    return () => window.removeEventListener('auth:unauthorized', handler)
  }, [logout, navigate])

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" />
    </>
  )
}
