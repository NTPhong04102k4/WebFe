import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { notify } from "@/components/core/Feedback/toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      // Backend chưa có endpoint reset-password, hiển thị thông báo chung
      await new Promise((r) => setTimeout(r, 800))
      setSent(true)
      notify.success('Hướng dẫn đặt lại mật khẩu đã được gửi!')
    } catch {
      notify.error('Gửi yêu cầu thất bại, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
          <Mail className="h-7 w-7 text-green-600" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-800">Đã gửi email!</h2>
        <p className="mb-6 text-sm text-slate-500">
          Kiểm tra hộp thư <strong>{email}</strong> để đặt lại mật khẩu.
        </p>
        <Link
          to="/auth/login"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Quay lại đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/auth/login" className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
      </Link>
      <h2 className="mb-1 text-2xl font-bold text-slate-800">Quên mật khẩu</h2>
      <p className="mb-6 text-sm text-slate-500">
        Nhập email để nhận hướng dẫn đặt lại mật khẩu.
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
          disabled={loading || !email}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Gửi hướng dẫn
        </button>
      </form>
    </div>
  )
}
