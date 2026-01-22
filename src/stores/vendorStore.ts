import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Vendor, StoreLocation } from '@/types'
import { vendors as initialVendors } from '@/data/users'
import { stores as initialStores } from '@/data/stores'
import { generateId } from '@/lib/utils'

interface VendorState {
  vendors: Vendor[]
  stores: StoreLocation[]

  // Vendor operations
  createVendor: (name: string, contactEmail: string) => Vendor
  updateVendor: (vendorId: string, updates: Partial<Omit<Vendor, 'id' | 'createdAt'>>) => void
  getVendorById: (vendorId: string) => Vendor | undefined
  goLive: (vendorId: string) => boolean
  canGoLive: (vendorId: string) => { canGoLive: boolean; missing: string[] }

  // Store operations
  createStore: (vendorId: string, store: Omit<StoreLocation, 'id' | 'vendorId' | 'isActive'>) => StoreLocation
  updateStore: (storeId: string, updates: Partial<Omit<StoreLocation, 'id' | 'vendorId'>>) => void
  deleteStore: (storeId: string) => void
  getStoresByVendor: (vendorId: string) => StoreLocation[]

  // Get all live vendors (for customer view)
  getLiveVendors: () => Vendor[]
  getLiveStores: () => StoreLocation[]
}

export const useVendorStore = create<VendorState>()(
  persist(
    (set, get) => ({
      vendors: initialVendors,
      stores: initialStores,

      createVendor: (name, contactEmail) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const newVendor: Vendor = {
          id: `vendor-${generateId()}`,
          name,
          slug,
          description: '',
          storeIds: [],
          contactEmail,
          contactPhone: '',
          isLive: false,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          vendors: [...state.vendors, newVendor],
        }))

        return newVendor
      },

      updateVendor: (vendorId, updates) => {
        set((state) => ({
          vendors: state.vendors.map((vendor) =>
            vendor.id === vendorId ? { ...vendor, ...updates } : vendor
          ),
        }))
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

        // Check if vendor has any products (we'll check this via productStore)
        // For now, just check stores

        return {
          canGoLive: missing.length === 0,
          missing,
        }
      },

      goLive: (vendorId) => {
        const { canGoLive, missing } = get().canGoLive(vendorId)
        if (!canGoLive) return false

        set((state) => ({
          vendors: state.vendors.map((vendor) =>
            vendor.id === vendorId ? { ...vendor, isLive: true } : vendor
          ),
        }))

        return true
      },

      createStore: (vendorId, storeData) => {
        const newStore: StoreLocation = {
          ...storeData,
          id: `store-${generateId()}`,
          vendorId,
          isActive: true,
        }

        set((state) => ({
          stores: [...state.stores, newStore],
          vendors: state.vendors.map((vendor) =>
            vendor.id === vendorId
              ? { ...vendor, storeIds: [...vendor.storeIds, newStore.id] }
              : vendor
          ),
        }))

        return newStore
      },

      updateStore: (storeId, updates) => {
        set((state) => ({
          stores: state.stores.map((store) =>
            store.id === storeId ? { ...store, ...updates } : store
          ),
        }))
      },

      deleteStore: (storeId) => {
        const store = get().stores.find((s) => s.id === storeId)
        if (!store) return

        set((state) => ({
          stores: state.stores.filter((s) => s.id !== storeId),
          vendors: state.vendors.map((vendor) =>
            vendor.id === store.vendorId
              ? { ...vendor, storeIds: vendor.storeIds.filter((id) => id !== storeId) }
              : vendor
          ),
        }))
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
    }
  )
)
