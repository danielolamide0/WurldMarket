import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean
  userId: string | null
  isLoading: boolean
  setUserId: (userId: string | null) => void
  fetchCart: (userId: string) => Promise<void>
  syncCart: () => Promise<void>
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemQuantity: (productId: string) => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      userId: null,
      isLoading: false,

      setUserId: (userId: string | null) => {
        const currentUserId = get().userId

        // If user is switching accounts, clear cart and fetch new user's cart
        if (currentUserId && userId && currentUserId !== userId) {
          set({ items: [], userId })
          if (userId) {
            get().fetchCart(userId)
          }
          return
        }

        set({ userId })

        // If logging out, clear cart
        if (!userId) {
          set({ items: [] })
        } else if (!currentUserId) {
          // If logging in, fetch cart from DB
          get().fetchCart(userId)
        }
      },

      fetchCart: async (userId: string) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`/api/cart?userId=${userId}`)
          const data = await response.json()

          if (response.ok && data.cart) {
            set({
              items: data.cart.items || [],
              userId,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      syncCart: async () => {
        const { userId, items } = get()
        if (!userId) return

        try {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items }),
          })
        } catch {
          // Silently fail - localStorage will serve as backup
        }
      },

      addItem: (item: CartItem) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId)

          let newItems: CartItem[]
          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + item.quantity, item.stock)
            newItems = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: newQuantity }
                : i
            )
          } else {
            newItems = [...state.items, item]
          }

          return { items: newItems }
        })

        // Sync to database after state update
        setTimeout(() => get().syncCart(), 0)
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))

        // Sync to database after state update
        setTimeout(() => get().syncCart(), 0)
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            }
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.min(quantity, i.stock) }
                : i
            ),
          }
        })

        // Sync to database after state update
        setTimeout(() => get().syncCart(), 0)
      },

      clearCart: () => {
        const { userId } = get()
        set({ items: [] })

        // Clear in database
        if (userId) {
          fetch(`/api/cart?userId=${userId}`, { method: 'DELETE' }).catch(() => {})
        }
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find((i) => i.productId === productId)
        return item?.quantity || 0
      },
    }),
    {
      name: 'wurldbasket-cart',
      partialize: (state) => ({ items: state.items, userId: state.userId }),
    }
  )
)
