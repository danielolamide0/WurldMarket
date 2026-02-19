'use client'

import { ShoppingCart } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'

export function FloatingCart() {
  const { isAuthenticated } = useAuthStore()
  const { items, openCart } = useCartStore()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Only show for non-authenticated users
  if (isAuthenticated) {
    return null
  }

  return (
    <button
      onClick={openCart}
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all hover:scale-105 md:bottom-6"
    >
      <div className="relative">
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-cream text-primary text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </div>
      {totalItems > 0 && (
        <span className="font-semibold">
          £{totalPrice.toFixed(2)}
        </span>
      )}
    </button>
  )
}
