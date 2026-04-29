import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  type: 'car' | 'accessory'
  id: number
  name: string
  price: number
  imagePath?: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (type: CartItem['type'], id: number) => void
  updateQuantity: (type: CartItem['type'], id: number, quantity: number) => void
  clearCart: () => void
  totalCount: () => number
  totalPrice: () => number
}

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
                ? { ...i, quantity: i.quantity + 1 }
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
        set({
          items: get().items.map((i) =>
            i.type === type && i.id === id ? { ...i, quantity } : i
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'soldcars-cart' }
  )
)
