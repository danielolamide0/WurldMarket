import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PurchaseRecord {
  productId: string
  purchaseCount: number
  lastPurchased: string
}

interface CustomerState {
  favourites: string[] // Product IDs
  purchaseHistory: PurchaseRecord[]

  // Actions
  addToFavourites: (productId: string) => void
  removeFromFavourites: (productId: string) => void
  toggleFavourite: (productId: string) => void
  isFavourite: (productId: string) => boolean
  recordPurchase: (productIds: string[]) => void
  getRegulars: () => string[] // Products bought 2+ times
  getPreviouslyPurchased: () => string[] // All purchased product IDs
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      favourites: [],
      purchaseHistory: [],

      addToFavourites: (productId: string) => {
        set((state) => ({
          favourites: state.favourites.includes(productId)
            ? state.favourites
            : [...state.favourites, productId],
        }))
      },

      removeFromFavourites: (productId: string) => {
        set((state) => ({
          favourites: state.favourites.filter((id) => id !== productId),
        }))
      },

      toggleFavourite: (productId: string) => {
        const { favourites } = get()
        if (favourites.includes(productId)) {
          set({ favourites: favourites.filter((id) => id !== productId) })
        } else {
          set({ favourites: [...favourites, productId] })
        }
      },

      isFavourite: (productId: string) => {
        return get().favourites.includes(productId)
      },

      recordPurchase: (productIds: string[]) => {
        set((state) => {
          const newHistory = [...state.purchaseHistory]
          const now = new Date().toISOString()

          productIds.forEach((productId) => {
            const existing = newHistory.find((r) => r.productId === productId)
            if (existing) {
              existing.purchaseCount += 1
              existing.lastPurchased = now
            } else {
              newHistory.push({
                productId,
                purchaseCount: 1,
                lastPurchased: now,
              })
            }
          })

          return { purchaseHistory: newHistory }
        })
      },

      getRegulars: () => {
        // Products purchased 2 or more times
        return get()
          .purchaseHistory.filter((r) => r.purchaseCount >= 2)
          .sort((a, b) => b.purchaseCount - a.purchaseCount)
          .map((r) => r.productId)
      },

      getPreviouslyPurchased: () => {
        // All purchased products, sorted by most recent
        return get()
          .purchaseHistory.sort(
            (a, b) =>
              new Date(b.lastPurchased).getTime() -
              new Date(a.lastPurchased).getTime()
          )
          .map((r) => r.productId)
      },
    }),
    {
      name: 'wurldbasket-customer',
    }
  )
)
