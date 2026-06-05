import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { notify } from "@/components/core/Feedback/toast"
import { useAuthQuery } from '@/query/auth/useAuthQuery'

const schema = z
  .object({
    temporaryPassword: z.string().min(1, 'Vui lòng nhập mã tạm thời'),
    newPassword: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const { resetPasswordAsync, isResetPasswordLoading } = useAuthQuery()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormData) => {
    try {
      await resetPasswordAsync({
        email,
        temporaryPassword: values.temporaryPassword,
        newPassword: values.newPassword,
      })
      notify.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
      navigate('/auth/login')
    } catch {
      // interceptor đã xử lý error toast
    }
  }

  return (
    <div>
      <Link to="/auth/forgot-password" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </Link>
      <h2 className="mb-1 text-2xl font-bold text-slate-800">Đặt lại mật khẩu</h2>
      <p className="mb-6 text-sm text-slate-500">
        Nhập mã tạm thời đã được gửi đến <strong>{email || 'email của bạn'}</strong> và mật khẩu mới.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mã tạm thời</label>
          <input
            {...register('temporaryPassword')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Nhập mã từ email"
          />
          {errors.temporaryPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.temporaryPassword.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mật khẩu mới</label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPwd ? 'text' : 'password'}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Tối thiểu 6 ký tự"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Xác nhận mật khẩu</label>
          <input
            {...register('confirmPassword')}
            type={showPwd ? 'text' : 'password'}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Nhập lại mật khẩu mới"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isResetPasswordLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isResetPasswordLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <KeyRound className="h-4 w-4" />
          )}
          Đặt lại mật khẩu
        </button>
      </form>
    </div>
  )
}
