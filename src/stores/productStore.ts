import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types'
import { products as initialProducts } from '@/data/products'
import { generateId } from '@/lib/utils'

interface ProductState {
  products: Product[]
  isLoading: boolean
  initializeProducts: () => void
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product
  updateProduct: (id: string, updates: Partial<Product>) => void
  deleteProduct: (id: string) => void
  decrementStock: (id: string, quantity: number) => void
  getProductById: (id: string) => Product | undefined
  getProductsByStore: (storeId: string) => Product[]
  getProductsByVendor: (vendorId: string) => Product[]
  getProductsByCategory: (category: string) => Product[]
  getLowStockProducts: (vendorId: string, threshold?: number) => Product[]
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,

      initializeProducts: () => {
        const currentProducts = get().products
        // Always initialize if store is empty and we have initial products
        // This ensures products are loaded even if localStorage was cleared or corrupted
        if (currentProducts.length === 0 && initialProducts.length > 0) {
          set({ products: [...initialProducts] })
        }
      },

      addProduct: (productData) => {
        const now = new Date().toISOString()
        const newProduct: Product = {
          ...productData,
          id: `prod-${generateId()}`,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          products: [...state.products, newProduct],
        }))

        return newProduct
      },

      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }))
      },

      decrementStock: (id, quantity) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, stock: Math.max(0, p.stock - quantity), updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      getProductById: (id) => {
        return get().products.find((p) => p.id === id)
      },

      getProductsByStore: (storeId) => {
        return get().products.filter((p) => p.storeId === storeId && p.isActive)
      },

      getProductsByVendor: (vendorId) => {
        return get().products.filter((p) => p.vendorId === vendorId)
      },

      getProductsByCategory: (category) => {
        return get().products.filter((p) => p.category === category && p.isActive)
      },

      getLowStockProducts: (vendorId, threshold = 10) => {
        return get().products.filter(
          (p) => p.vendorId === vendorId && p.stock <= threshold && p.isActive
        )
      },
    }),
    {
      name: 'wurldbasket-products',
      version: 1,
      onRehydrateStorage: () => (state) => {
        // After rehydration, ensure products are initialized if empty
        if (state && state.products.length === 0 && initialProducts.length > 0) {
          state.products = [...initialProducts]
        }
      },
    }
  )
)
