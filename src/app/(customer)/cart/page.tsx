'use client'

import Link from 'next/link'
import { ShoppingBag, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, MIN_ORDER_AMOUNT } from '@/lib/constants'

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCartStore()
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = subtotal + deliveryFee
  const isBelowMinimum = subtotal < MIN_ORDER_AMOUNT

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Browse our stores and add items to get started</p>
          <Link href="/">
            <Button size="lg">Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <Card key={item.productId} className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.unit}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 rounded-lg hover:bg-white transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold text-primary">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <Card className="p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="text-forest font-medium">FREE</span>
              ) : (
                <span>{formatPrice(deliveryFee)}</span>
              )}
            </div>

            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <p className="text-sm text-primary">
                Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery
              </p>
            )}

            <div className="border-t border-gray-100 pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Minimum Order Warning */}
        {isBelowMinimum && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 text-sm">
              Minimum order amount is {formatPrice(MIN_ORDER_AMOUNT)}. Please add{' '}
              {formatPrice(MIN_ORDER_AMOUNT - subtotal)} more to proceed.
            </p>
          </div>
        )}

        {/* Checkout Button */}
        <Link href="/checkout">
          <Button
            className="w-full"
            size="lg"
            disabled={isBelowMinimum}
          >
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  )
}
