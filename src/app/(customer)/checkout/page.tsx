'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Store, CheckCircle, Truck } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useProductStore } from '@/stores/productStore'
import { useCustomerStore } from '@/stores/customerStore'
import { stores } from '@/data/stores'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { formatPrice } from '@/lib/utils'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/constants'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { createOrder } = useOrderStore()
  const { decrementStock } = useProductStore()
  const { recordPurchase } = useCustomerStore()
  const { addToast } = useToast()

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = orderType === 'delivery' && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0
  const total = subtotal + deliveryFee

  // Get store info for pickup
  const firstItem = items[0]
  const pickupStore = firstItem ? stores.find((s) => s.id === firstItem.storeId) : null

  const handleSubmitOrder = async () => {
    if (!customerName || !customerPhone) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    if (orderType === 'delivery' && !address) {
      addToast('Please enter your delivery address', 'error')
      return
    }

    setIsProcessing(true)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create order
    const order = createOrder(
      items,
      user?.id || 'guest',
      customerName,
      customerPhone,
      orderType,
      orderType === 'delivery' ? address : undefined,
      notes || undefined
    )

    // Decrement stock for all items
    items.forEach((item) => {
      decrementStock(item.productId, item.quantity)
    })

    // Record purchases for customer history (if authenticated)
    if (user && user.role === 'customer') {
      const productIds = items.map((item) => item.productId)
      recordPurchase(productIds)
    }

    // Clear cart
    clearCart()

    setOrderId(order.id)
    setOrderComplete(true)
    setIsProcessing(false)

    addToast('Order placed successfully!', 'success')
  }

  // Order Complete Screen
  if (orderComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-forest rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. Your order number is:
          </p>
          <p className="text-2xl font-mono font-bold text-terracotta mb-8">{orderId}</p>

          <Card className="p-4 mb-8 text-left">
            <h3 className="font-medium text-gray-900 mb-2">What&apos;s Next?</h3>
            <p className="text-sm text-gray-600">
              {orderType === 'delivery'
                ? 'Your order will be delivered to your address. We\'ll send you updates via SMS.'
                : `Your order will be ready for pickup at ${pickupStore?.name}. We'll notify you when it's ready.`}
            </p>
          </Card>

          <Link href="/">
            <Button size="lg" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Order Type */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Delivery Method</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setOrderType('delivery')}
              className={`p-4 rounded-xl border-2 transition-all ${
                orderType === 'delivery'
                  ? 'border-terracotta bg-terracotta/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Truck className={`h-6 w-6 mx-auto mb-2 ${orderType === 'delivery' ? 'text-terracotta' : 'text-gray-400'}`} />
              <p className="font-medium">Delivery</p>
              <p className="text-sm text-gray-500">To your door</p>
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className={`p-4 rounded-xl border-2 transition-all ${
                orderType === 'pickup'
                  ? 'border-terracotta bg-terracotta/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Store className={`h-6 w-6 mx-auto mb-2 ${orderType === 'pickup' ? 'text-terracotta' : 'text-gray-400'}`} />
              <p className="font-medium">Pickup</p>
              <p className="text-sm text-gray-500">Collect in store</p>
            </button>
          </div>
        </Card>

        {/* Contact Details */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Contact Details</h2>
          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="07123 456789"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Delivery Address or Pickup Location */}
        {orderType === 'delivery' ? (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Delivery Address</h2>
            <Input
              label="Address"
              placeholder="Enter your full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              icon={<MapPin className="h-5 w-5" />}
            />
          </Card>
        ) : (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Pickup Location</h2>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Store className="h-5 w-5 text-terracotta mt-0.5" />
              <div>
                <p className="font-medium">{pickupStore?.name}</p>
                <p className="text-sm text-gray-600">
                  {pickupStore?.address}, {pickupStore?.city} {pickupStore?.postcode}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Order Notes */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
          <textarea
            placeholder="Any special instructions?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent resize-none"
            rows={3}
          />
        </Card>

        {/* Order Summary */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              {deliveryFee === 0 ? (
                <span className="text-forest font-medium">FREE</span>
              ) : (
                <span>{formatPrice(deliveryFee)}</span>
              )}
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-terracotta">{formatPrice(total)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:hidden z-[60]">
        <Button
          onClick={handleSubmitOrder}
          isLoading={isProcessing}
          className="w-full"
          size="lg"
        >
          Place Order - {formatPrice(total)}
        </Button>
      </div>

      {/* Desktop Button */}
      <div className="hidden md:block max-w-3xl mx-auto px-4 pb-8">
        <Button
          onClick={handleSubmitOrder}
          isLoading={isProcessing}
          className="w-full"
          size="lg"
        >
          Place Order - {formatPrice(total)}
        </Button>
      </div>
    </div>
  )
}
