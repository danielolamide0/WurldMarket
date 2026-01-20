'use client'

import { useEffect, ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { useProductStore } from '@/stores/productStore'

export function Providers({ children }: { children: ReactNode }) {
  const initializeProducts = useProductStore((state) => state.initializeProducts)

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}
