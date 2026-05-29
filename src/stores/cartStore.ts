import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { idbStorage } from '@/lib/db/indexedDBStorage'

export interface CartItem {
  type: 'car' | 'accessory'
  id: number
  name: string
  price: number
  imagePath?: string
  quantity: number
}

export type CartCheckoutPayload = {
  cars: { carID: number }[]
  accessories: { accessoryID: number; quantity: number }[]
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (type: CartItem['type'], id: number) => void
  updateQuantity: (type: CartItem['type'], id: number, quantity: number) => void
  clearCart: () => void
  checkoutPayload: (items?: CartItem[]) => CartCheckoutPayload
  totalCount: () => number
  totalPrice: () => number
}

const CART_KEY_PREFIX = 'soldcars-cart'

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.type === item.type && i.id === item.id)
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.type === item.type && i.id === item.id
                ? { ...i, quantity: i.type === 'car' ? 1 : i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (type, id) =>
        set({ items: get().items.filter((i) => !(i.type === type && i.id === id)) }),
      updateQuantity: (type, id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(type, id)
          return
        }
        if (type === 'car') {
          set({
            items: get().items.map((i) =>
              i.type === type && i.id === id ? { ...i, quantity: 1 } : i
            ),
          })
          return
        }
        set({
          items: get().items.map((i) =>
            i.type === type && i.id === id ? { ...i, quantity } : i
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      checkoutPayload: (inputItems) => {
        const source = inputItems ?? get().items
        return {
          cars: source
            .filter((item) => item.type === 'car')
            .map((item) => ({ carID: item.id })),
          accessories: source
            .filter((item) => item.type === 'accessory')
            .map((item) => ({ accessoryID: item.id, quantity: item.quantity })),
        }
      },
      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: `${CART_KEY_PREFIX}-guest`,
      storage: createJSONStorage(() => idbStorage),
      // Không tự hydrate khi mount — useCartUserSync sẽ gọi switchCartUser ngay sau đó
      skipHydration: true,
      version: 1,
      partialize: (state) => ({ items: state.items }),
    }
  )
)

/**
 * Đổi sang giỏ hàng của user tương ứng trong IndexedDB.
 * Chỉ clear memory (Zustand), dữ liệu IDB của user cũ KHÔNG bị xóa.
 * Gọi khi: login, logout, hoặc switch account.
 */
export async function switchCartUser(userId: string | null): Promise<void> {
  const key = userId ? `${CART_KEY_PREFIX}-${userId}` : `${CART_KEY_PREFIX}-guest`
  // Clear in-memory trước để không leak dữ liệu user cũ
  useCartStore.setState({ items: [] })
  useCartStore.persist.setOptions({ name: key })
  await useCartStore.persist.rehydrate()
}
