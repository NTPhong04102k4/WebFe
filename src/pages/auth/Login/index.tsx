import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/authStore'
import { decodeToken } from '@/utils/jwtDecode'
import { extractError } from '@/utils/errorMessage'

const schema = z.object({
  usernameOrPhoneOrEmail: z.string().min(1, 'Vui lòng nhập tài khoản'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    setLoading(true)
    try {
      const { data } = await authApi.login(values)
      setTokens(data.access_token, data.refresh_token)
      const decoded = decodeToken(data.access_token)
      if (decoded) setUser(decoded)
      toast.success('Đăng nhập thành công!')
      const role = decoded?.role ?? 'Customer'
      if (role === 'Admin' || role === 'SuperAdmin' || role === 'Staff') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      toast.error(extractError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'https://web-7012.onrender.com'
    const popup = window.open(
      `${baseUrl}/auth/login/${provider}`,
      'oauth-popup',
      'width=500,height=600'
    )
    const handler = (e: MessageEvent) => {
      if (e.data?.access_token) {
        setTokens(e.data.access_token, e.data.refresh_token)
        const decoded = decodeToken(e.data.access_token)
        if (decoded) setUser(decoded)
        toast.success('Đăng nhập thành công!')
        navigate('/', { replace: true })
        window.removeEventListener('message', handler)
        popup?.close()
      }
    }
    window.addEventListener('message', handler)
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold text-slate-800">Đăng nhập</h2>
      <p className="mb-6 text-sm text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/auth/register" className="font-medium text-blue-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Tài khoản / Email / SĐT
          </label>
          <input
            {...register('usernameOrPhoneOrEmail')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Nhập tài khoản, email hoặc số điện thoại"
          />
          {errors.usernameOrPhoneOrEmail && (
            <p className="mt-1 text-xs text-red-500">{errors.usernameOrPhoneOrEmail.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPwd ? 'text' : 'password'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Nhập mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link to="/auth/forgot-password" className="text-xs text-blue-600 hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          Đăng nhập
        </button>
      </form>

      {/* Social */}
      <div className="mt-6">
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs text-slate-400">
            <span className="bg-white px-2">hoặc đăng nhập bằng</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        Là quản trị viên?{' '}
        <Link to="/auth/admin/login" className="text-blue-600 hover:underline">
          Đăng nhập Admin
        </Link>
      </p>
    </div>
  )
}
