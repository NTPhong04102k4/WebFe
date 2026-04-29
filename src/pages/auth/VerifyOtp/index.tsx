import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ShieldCheck, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/authStore'
import { decodeToken } from '@/utils/jwtDecode'
import { extractError } from '@/utils/errorMessage'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60

export default function VerifyOtpPage() {
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { setTokens, setUser } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(t)
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    if (next.every(Boolean)) submitOtp(next.join(''))
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = [...digits]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    if (pasted.length === OTP_LENGTH) submitOtp(pasted)
    else inputRefs.current[pasted.length]?.focus()
  }

  const submitOtp = async (code: string) => {
    if (loading) return
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({ email, otpCode: code })
      const d = res.data?.data
      if (d?.accessToken) {
        setTokens(d.accessToken, d.refreshToken)
        const decoded = decodeToken(d.accessToken)
        if (decoded) setUser({ ...decoded, fullName: d.user.fullName ?? decoded.fullName })
        toast.success('Xác thực thành công! Chào mừng bạn.')
        navigate('/', { replace: true })
      } else {
        toast.error(res.data?.message ?? 'Xác thực thất bại')
        setDigits(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      toast.error(extractError(err))
      setDigits(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return
    try {
      await authApi.resendOtp(email)
      toast.success('Đã gửi lại OTP!')
      setCountdown(RESEND_COOLDOWN)
    } catch (err) {
      toast.error(extractError(err))
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
        <ShieldCheck className="h-7 w-7 text-blue-600" />
      </div>
      <h2 className="mb-1 text-2xl font-bold text-slate-800">Xác thực OTP</h2>
      <p className="mb-2 text-sm text-slate-500">
        Mã OTP đã được gửi đến
      </p>
      <p className="mb-6 text-sm font-medium text-blue-600">{email}</p>

      {/* OTP inputs */}
      <div className="mb-6 flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            className="h-12 w-10 rounded-lg border-2 border-slate-300 text-center text-lg font-bold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 sm:w-12"
          />
        ))}
      </div>

      {loading && (
        <div className="mb-4 flex justify-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      )}

      {/* Resend */}
      <button
        onClick={handleResend}
        disabled={countdown > 0}
        className="flex items-center justify-center gap-1.5 text-sm font-medium mx-auto"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {countdown > 0 ? (
          <span className="text-slate-400">Gửi lại sau {countdown}s</span>
        ) : (
          <span className="text-blue-600 hover:underline">Gửi lại OTP</span>
        )}
      </button>

      <p className="mt-4 text-xs text-slate-400">
        Không nhận được email? Kiểm tra thư mục spam.
      </p>
    </div>
  )
}
