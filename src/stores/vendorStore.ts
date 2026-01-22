import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Vendor, StoreLocation } from '@/types'

interface VendorState {
  vendors: Vendor[]
  stores: StoreLocation[]
  isLoading: boolean

  // Fetch operations
  fetchVendors: () => Promise<void>
  fetchStores: (vendorId?: string) => Promise<void>

  // Vendor operations
  createVendor: (name: string, contactEmail: string) => Promise<Vendor | null>
  updateVendor: (vendorId: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>) => Promise<void>
  getVendorById: (vendorId: string) => Vendor | undefined
  goLive: (vendorId: string) => Promise<boolean>
  canGoLive: (vendorId: string) => { canGoLive: boolean; missing: string[] }

  // Store operations
  createStore: (vendorId: string, store: Omit<StoreLocation, 'id' | 'vendorId' | 'isActive'>) => Promise<StoreLocation | null>
  updateStore: (storeId: string, updates: Partial<Omit<StoreLocation, 'id' | 'vendorId'>>) => Promise<void>
  deleteStore: (storeId: string) => Promise<void>
  getStoresByVendor: (vendorId: string) => StoreLocation[]

  // Get all live vendors (for customer view)
  getLiveVendors: () => Vendor[]
  getLiveStores: () => StoreLocation[]
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set, get) => ({
      vendors: [],
      stores: [],
      isLoading: false,

      fetchVendors: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch('/api/vendors')
          const data = await response.json()

          if (response.ok) {
            set({ vendors: data.vendors || [], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      fetchStores: async (vendorId?: string) => {
        set({ isLoading: true })
        try {
          const url = vendorId ? `/api/stores?vendorId=${vendorId}` : '/api/stores'
          const response = await fetch(url)
          const data = await response.json()

          if (response.ok) {
            set({ stores: data.stores || [], isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      createVendor: async (name, contactEmail) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        try {
          const response = await fetch('/api/vendors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, slug, contactEmail }),
          })

          const data = await response.json()

          if (response.ok) {
            set((state) => ({
              vendors: [...state.vendors, data.vendor],
            }))
            return data.vendor
          }
          return null
        } catch {
          return null
        }
      },

      updateVendor: async (vendorId, updates) => {
        const originalVendors = get().vendors
        // Optimistically update
        set((state) => ({
          vendors: state.vendors.map((vendor) =>
            vendor.id === vendorId ? { ...vendor, ...updates } : vendor
          ),
        }))

        try {
          const response = await fetch('/api/vendors', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: vendorId, ...updates }),
          })

          if (!response.ok) {
            set({ vendors: originalVendors })
          }
        } catch {
          set({ vendors: originalVendors })
        }
      },

      getVendorById: (vendorId) => {
        return get().vendors.find((v) => v.id === vendorId)
      },

      canGoLive: (vendorId) => {
        const vendor = get().vendors.find((v) => v.id === vendorId)
        const vendorStores = get().stores.filter((s) => s.vendorId === vendorId)
        const missing: string[] = []

        if (!vendor) return { canGoLive: false, missing: ['Vendor not found'] }

        if (!vendor.description) missing.push('Business description')
        if (!vendor.contactPhone) missing.push('Contact phone number')
        if (vendorStores.length === 0) missing.push('At least one store location')

        return {
          canGoLive: missing.length === 0,
          missing,
        }
      },

      goLive: async (vendorId) => {
        const { canGoLive } = get().canGoLive(vendorId)
        if (!canGoLive) return false

        await get().updateVendor(vendorId, { isLive: true })
        return true
      },

      createStore: async (vendorId, storeData) => {
        try {
          const response = await fetch('/api/stores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...storeData, vendorId }),
          })

          const data = await response.json()

          if (response.ok) {
            const newStore = data.store
            set((state) => ({
              stores: [...state.stores, newStore],
              vendors: state.vendors.map((vendor) =>
                vendor.id === vendorId
                  ? { ...vendor, storeIds: [...(vendor.storeIds || []), newStore.id] }
                  : vendor
              ),
            }))
            return newStore
          }
          return null
        } catch {
          return null
        }
      },

      updateStore: async (storeId, updates) => {
        const originalStores = get().stores
        // Optimistically update
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? { ...store, ...updates } : store
          ),
        }))

        try {
          const response = await fetch('/api/stores', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: storeId, ...updates }),
          })

          if (!response.ok) {
            set({ stores: originalStores })
          }
        } catch {
          set({ stores: originalStores })
        }
      },

      deleteStore: async (storeId) => {
        const store = get().stores.find((s) => s.id === storeId)
        if (!store) return

        const originalStores = get().stores
        const originalVendors = get().vendors

        // Optimistically update
        set((state) => ({
          stores: state.stores.filter((s) => s.id !== storeId),
          vendors: state.vendors.map((vendor) =>
            vendor.id === store.vendorId
              ? { ...vendor, storeIds: (vendor.storeIds || []).filter((id) => id !== storeId) }
              : vendor
          ),
        }))

        try {
          const response = await fetch(`/api/stores?id=${storeId}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            set({ stores: originalStores, vendors: originalVendors })
          }
        } catch {
          set({ stores: originalStores, vendors: originalVendors })
        }
      },

      getStoresByVendor: (vendorId) => {
        return get().stores.filter((store) => store.vendorId === vendorId)
      },

      getLiveVendors: () => {
        return get().vendors.filter((vendor) => vendor.isLive)
      },

      getLiveStores: () => {
        const liveVendorIds = get().vendors.filter((v) => v.isLive).map((v) => v.id)
        return get().stores.filter((store) => liveVendorIds.includes(store.vendorId) && store.isActive)
      },
    }),
    {
      name: 'wurldbasket-vendors',
      version: 2,
    }
  )
)
