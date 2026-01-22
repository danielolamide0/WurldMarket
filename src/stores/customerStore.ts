import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PurchaseRecord {
  productId: string
  purchasedAt: string
  quantity: number
}

interface CustomerState {
  userId: string | null
  favourites: string[]
  regulars: string[] // Vendor IDs user frequently shops at
  purchaseHistory: PurchaseRecord[]
  isLoading: boolean

  // Actions
  setUserId: (userId: string | null) => void
  fetchCustomerData: (userId: string) => Promise<void>
  addToFavourites: (productId: string) => Promise<void>
  removeFromFavourites: (productId: string) => Promise<void>
  toggleFavourite: (productId: string) => Promise<void>
  isFavourite: (productId: string) => boolean
  addToRegulars: (vendorId: string) => Promise<void>
  removeFromRegulars: (vendorId: string) => Promise<void>
  isRegular: (vendorId: string) => boolean
  recordPurchase: (productId: string, quantity?: number) => Promise<void>
  getPreviouslyPurchased: () => string[]
  getRegulars: () => string[]
  clearCustomerData: () => void
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      userId: null,
      favourites: [],
      regulars: [],
      purchaseHistory: [],
      isLoading: false,

      setUserId: (userId: string | null) => {
        const currentUserId = get().userId
        
        // If userId is changing (and not just logging out), clear old data
        if (currentUserId && userId && currentUserId !== userId) {
          // User is switching - clear old data first and clear localStorage
          set({ favourites: [], regulars: [], purchaseHistory: [] })
          // Clear localStorage for the old user
          if (typeof window !== 'undefined') {
            localStorage.removeItem('wurldbasket-customer')
          }
        }
        
        set({ userId })
        
        // If logging out, clear all data
        if (!userId) {
          set({ favourites: [], regulars: [], purchaseHistory: [] })
          // Clear localStorage on logout
          if (typeof window !== 'undefined') {
            localStorage.removeItem('wurldbasket-customer')
          }
        }
      },

      fetchCustomerData: async (userId: string) => {
        set({ isLoading: true, userId })
        try {
          const response = await fetch(`/api/customer-data?userId=${userId}`)
          const data = await response.json()

          if (response.ok && data.customerData) {
            set({
              favourites: data.customerData.favorites || [],
              regulars: data.customerData.regulars || [],
              purchaseHistory: data.customerData.purchaseHistory || [],
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      addToFavourites: async (productId: string) => {
        const { userId, favourites } = get()
        if (!userId || favourites.includes(productId)) return

        // Optimistically update
        set((state) => ({ favourites: [...state.favourites, productId] }))

        try {
          const response = await fetch('/api/customer-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'addFavorite', productId }),
          })

          if (response.ok) {
            // Refresh data from server to ensure sync
            await get().fetchCustomerData(userId)
          } else {
            // Revert on error
            set((state) => ({ favourites: state.favourites.filter((id) => id !== productId) }))
          }
        } catch {
          // Revert on error
          set((state) => ({ favourites: state.favourites.filter((id) => id !== productId) }))
        }
      },

      removeFromFavourites: async (productId: string) => {
        const { userId, favourites } = get()
        if (!userId) return

        const originalFavourites = [...favourites]
        // Optimistically update
        set((state) => ({ favourites: state.favourites.filter((id) => id !== productId) }))

        try {
          await fetch('/api/customer-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'removeFavorite', productId }),
          })
        } catch {
          // Revert on error
          set({ favourites: originalFavourites })
        }
      },

      toggleFavourite: async (productId: string) => {
        const { favourites } = get()
        if (favourites.includes(productId)) {
          await get().removeFromFavourites(productId)
        } else {
          await get().addToFavourites(productId)
        }
      },

      isFavourite: (productId: string) => {
        return get().favourites.includes(productId)
      },

      addToRegulars: async (vendorId: string) => {
        const { userId, regulars } = get()
        if (!userId || regulars.includes(vendorId)) return

        // Optimistically update
        set((state) => ({ regulars: [...state.regulars, vendorId] }))

        try {
          await fetch('/api/customer-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'addRegular', vendorId }),
          })
        } catch {
          // Revert on error
          set((state) => ({ regulars: state.regulars.filter((id) => id !== vendorId) }))
        }
      },

      removeFromRegulars: async (vendorId: string) => {
        const { userId, regulars } = get()
        if (!userId) return

        const originalRegulars = [...regulars]
        // Optimistically update
        set((state) => ({ regulars: state.regulars.filter((id) => id !== vendorId) }))

        try {
          await fetch('/api/customer-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'removeRegular', vendorId }),
          })
        } catch {
          // Revert on error
          set({ regulars: originalRegulars })
        }
      },

      isRegular: (vendorId: string) => {
        return get().regulars.includes(vendorId)
      },

      recordPurchase: async (productId: string, quantity = 1) => {
        const { userId } = get()
        if (!userId) return

        const newRecord = { productId, purchasedAt: new Date().toISOString(), quantity }
        // Optimistically update
        set((state) => ({ purchaseHistory: [...state.purchaseHistory, newRecord] }))

        try {
          const response = await fetch('/api/customer-data', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'recordPurchase', productId, quantity }),
          })

          if (response.ok) {
            // Refresh data from server to ensure sync
            await get().fetchCustomerData(userId)
          } else {
            // Revert on error
            set((state) => ({
              purchaseHistory: state.purchaseHistory.filter(
                (r) => !(r.productId === productId && r.purchasedAt === newRecord.purchasedAt)
              ),
            }))
          }
        } catch {
          // Revert on error
          set((state) => ({
            purchaseHistory: state.purchaseHistory.filter(
              (r) => !(r.productId === productId && r.purchasedAt === newRecord.purchasedAt)
            ),
          }))
        }
      },

      getPreviouslyPurchased: () => {
        // Return unique product IDs, sorted by most recent purchase
        const history = get().purchaseHistory
        const uniqueProducts = new Map<string, string>()

        history.forEach((record) => {
          const existing = uniqueProducts.get(record.productId)
          if (!existing || new Date(record.purchasedAt) > new Date(existing)) {
            uniqueProducts.set(record.productId, record.purchasedAt)
          }
        })

        return Array.from(uniqueProducts.entries())
          .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
          .map(([productId]) => productId)
      },

      getRegulars: () => {
        // Return product IDs that have been ordered more than twice
        const history = get().purchaseHistory
        const productCounts = new Map<string, number>()

        // Count how many times each product has been purchased
        history.forEach((record) => {
          const currentCount = productCounts.get(record.productId) || 0
          productCounts.set(record.productId, currentCount + record.quantity)
        })

        // Return product IDs that have been purchased more than twice
        return Array.from(productCounts.entries())
          .filter(([_, count]) => count > 2)
          .map(([productId]) => productId)
      },

      clearCustomerData: () => {
        set({ userId: null, favourites: [], regulars: [], purchaseHistory: [] })
      },
    }),
    {
      name: 'wurldbasket-customer',
      partialize: (state) => ({
        userId: state.userId,
        favourites: state.favourites,
        regulars: state.regulars,
        purchaseHistory: state.purchaseHistory,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          // When rehydrating, validate userId matches current logged-in user
          if (state && typeof window !== 'undefined') {
            try {
              const authData = localStorage.getItem('wurldbasket-auth')
              if (authData) {
                const auth = JSON.parse(authData)
                const currentUserId = auth.state?.user?.id
                // If userId doesn't match, clear the data
                if (currentUserId && state.userId && state.userId !== currentUserId) {
                  state.userId = null
                  state.favourites = []
                  state.regulars = []
                  state.purchaseHistory = []
                }
              } else if (state.userId) {
                // No auth data but customer data exists - clear it
                state.userId = null
                state.favourites = []
                state.regulars = []
                state.purchaseHistory = []
              }
            } catch {
              // If parsing fails, clear customer data to be safe
              if (state) {
                state.userId = null
                state.favourites = []
                state.regulars = []
                state.purchaseHistory = []
              }
            }
          }
        }
      },
    }
  )
)
