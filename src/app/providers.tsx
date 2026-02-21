'use client'

import { useEffect, useState, ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/toast'
import { SplashScreen } from '@/components/layout/SplashScreen'
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt'
import { AuthActivityTracker } from '@/components/AuthActivityTracker'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'

export function Providers({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [hasShownSplash, setHasShownSplash] = useState(false)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchVendors = useVendorStore((state) => state.fetchVendors)
  const fetchStores = useVendorStore((state) => state.fetchStores)

  useEffect(() => {
    // Check if splash has been shown this session
    const splashShown = sessionStorage.getItem('splashShown')
    if (splashShown) {
      setShowSplash(false)
      setHasShownSplash(true)
    }
  }, [])

  useEffect(() => {
    // Fetch initial data from MongoDB
    fetchProducts()
    fetchVendors()
    fetchStores()
  }, [fetchProducts, fetchVendors, fetchStores])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setHasShownSplash(true)
    sessionStorage.setItem('splashShown', 'true')
  }

  return (
    <ToastProvider>
      <AuthActivityTracker />
      {showSplash && !hasShownSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      {children}
      <LocationPermissionPrompt />
    </ToastProvider>
  )
}
