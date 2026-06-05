import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { notify } from "@/components/core/Feedback/toast"
import { useAuthQuery } from '@/query/auth/useAuthQuery'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const { forgotPasswordAsync, isForgotPasswordLoading } = useAuthQuery()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      await forgotPasswordAsync({ email })
      notify.success('Mã tạm thời đã được gửi! Kiểm tra hộp thư của bạn.')
      navigate(`/auth/reset-password?email=${encodeURIComponent(email)}`)
    } catch {
      // interceptor đã xử lý error toast
    }
  }

  return (
    <div>
      <Link to="/auth/login" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
      </Link>
      <h2 className="mb-1 text-2xl font-bold text-slate-800">Quên mật khẩu</h2>
      <p className="mb-6 text-sm text-slate-500">
        Nhập email để nhận mã tạm thời đặt lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="email@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={isForgotPasswordLoading || !email}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isForgotPasswordLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Gửi mã tạm thời
        </button>
      </form>
    </div>
  )
}
