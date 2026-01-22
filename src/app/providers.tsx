'use client'

import { useEffect, ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'

export function Providers({ children }: { children: ReactNode }) {
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchVendors = useVendorStore((state) => state.fetchVendors)
  const fetchStores = useVendorStore((state) => state.fetchStores)

  useEffect(() => {
    // Fetch initial data from MongoDB
    fetchProducts()
    fetchVendors()
    fetchStores()
  }, [fetchProducts, fetchVendors, fetchStores])

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
