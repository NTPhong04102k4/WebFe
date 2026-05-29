import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { switchCartUser } from '@/stores/cartStore'

/**
 * Mount một lần ở App root.
 * Khi user thay đổi (login / logout / switch account), tự động:
 *   1. Clear cart khỏi memory
 *   2. Load đúng giỏ hàng của user đó từ IndexedDB
 *
 * Dữ liệu IndexedDB của user cũ không bị xóa — họ quay lại vẫn còn đủ.
 */
export function useCartUserSync() {
  const user = useAuthStore((s) => s.user)
  // userUUID là định danh ổn định; fallback sang id nếu token cũ chưa có UUID
  const userId = user?.userUUID ?? (user ? `id-${user.id}` : null)

  const prevUserId = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    // undefined = chưa init lần nào; null = guest
    if (prevUserId.current === userId) return
    prevUserId.current = userId
    switchCartUser(userId)
  }, [userId])
}
