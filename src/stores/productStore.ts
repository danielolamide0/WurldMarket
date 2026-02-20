import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CuisineType } from '@/types'

interface ProductState {
  products: Product[]
  isLoading: boolean
  fetchProducts: (params?: { storeId?: string; vendorId?: string; category?: string; cuisine?: string }) => Promise<void>
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product | null>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  decrementStock: (id: string, quantity: number) => Promise<void>
  getProductById: (id: string) => Product | undefined
  getProductsByStore: (storeId: string) => Product[]
  getProductsByVendor: (vendorId: string) => Product[]
  getProductsByCategory: (category: string) => Product[]
  getProductsByCuisine: (cuisine: CuisineType) => Product[]
  getLowStockProducts: (vendorId: string, threshold?: number) => Product[]
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      isLoading: false,

      fetchProducts: async (params) => {
        set({ isLoading: true })
        try {
          const searchParams = new URLSearchParams()
          if (params?.storeId) searchParams.set('storeId', params.storeId)
          if (params?.vendorId) searchParams.set('vendorId', params.vendorId)
          if (params?.category) searchParams.set('category', params.category)
          if (params?.cuisine) searchParams.set('cuisine', params.cuisine)

          const url = `/api/products${searchParams.toString() ? `?${searchParams}` : ''}`
          const response = await fetch(url)
          const data = await response.json()

          if (response.ok) {
            const newProducts = data.products || []
        const currentProducts = get().products
            
            // Merge products: use Map to deduplicate by ID, keeping the latest version
            const productMap = new Map<string, Product>()
            
            // Add existing products to map
            currentProducts.forEach((product) => {
              productMap.set(product.id, product)
            })
            
            // Update/add new products (newer data takes precedence)
            newProducts.forEach((product: Product) => {
              productMap.set(product.id, product)
            })
            
            // Convert back to array
            const mergedProducts = Array.from(productMap.values())
            
            set({ products: mergedProducts, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      addProduct: async (productData) => {
        try {
          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          })

          const data = await response.json()

          if (response.ok) {
            const newProduct = data.product
        set((state) => ({
          products: [...state.products, newProduct],
        }))
        return newProduct
          }
          return null
        } catch {
          return null
        }
      },

      updateProduct: async (id, updates) => {
        // Optimistically update
        const originalProducts = get().products
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }))

        try {
          const response = await fetch('/api/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
          })

          if (!response.ok) {
            // Revert on error
            set({ products: originalProducts })
          }
        } catch {
          // Revert on error
          set({ products: originalProducts })
        }
      },

      deleteProduct: async (id) => {
        const originalProducts = get().products
        // Optimistically update
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }))

        try {
          const response = await fetch(`/api/products?id=${id}`, {
            method: 'DELETE',
          })

          if (!response.ok) {
            // Revert on error
            set({ products: originalProducts })
          }
        } catch {
          // Revert on error
          set({ products: originalProducts })
        }
      },

      decrementStock: async (id, quantity) => {
        const product = get().products.find((p) => p.id === id)
        if (!product) return

        const newStock = Math.max(0, product.stock - quantity)
        await get().updateProduct(id, { stock: newStock })
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

      getProductsByCuisine: (cuisine) => {
        return get().products.filter((p) => p.cuisines?.includes(cuisine) && p.isActive)
      },

      getLowStockProducts: (vendorId, threshold = 10) => {
        return get().products.filter(
          (p) => p.vendorId === vendorId && p.stock <= threshold && p.isActive
        )
      },
    }),
    {
      name: 'wurldbasket-products',
      version: 2,
    }
  )
)
