'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Store, CheckCircle, Truck, Plus, Home, Briefcase, MapPinned, Check, Phone } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useProductStore } from '@/stores/productStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useAddressStore } from '@/stores/addressStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { formatPrice } from '@/lib/utils'
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from '@/lib/constants'
import { PostcodeLookup } from '@/components/address/PostcodeLookup'
import { SavedAddress } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const { createOrder } = useOrderStore()
  const { decrementStock } = useProductStore()
  const { fetchCustomerData } = useCustomerStore()
  const { getAddressesByUser, getPrimaryAddress } = useAddressStore()
  const { stores, fetchStores } = useVendorStore()
  const { addToast } = useToast()

  // Fetch stores on mount
  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [customerName, setCustomerName] = useState(user?.name || '')
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '')
  const [useSavedPhone, setUseSavedPhone] = useState(true)
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [newAddressSelected, setNewAddressSelected] = useState(false)
  const [newAddressLine, setNewAddressLine] = useState('')
  const [newCity, setNewCity] = useState('')
  const [newPostcode, setNewPostcode] = useState('')

  // Get saved addresses
  const savedAddresses = user ? getAddressesByUser(user.id) : []
  const primaryAddress = user ? getPrimaryAddress(user.id) : undefined

  // Set primary address as default when component mounts
  useEffect(() => {
    if (primaryAddress && !selectedAddressId && !useNewAddress) {
      setSelectedAddressId(primaryAddress.id)
      setAddress(`${primaryAddress.fullAddress}, ${primaryAddress.city} ${primaryAddress.postcode}`)
    }
  }, [primaryAddress, selectedAddressId, useNewAddress])

  // Set saved phone number as default when component mounts
  useEffect(() => {
    if (user?.phone && useSavedPhone) {
      setCustomerPhone(user.phone)
    }
  }, [user?.phone, useSavedPhone])

  const handleAddressSelect = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id)
    setUseNewAddress(false)
    setAddress(`${addr.fullAddress}, ${addr.city} ${addr.postcode}`)
  }

  const handleUseNewAddress = () => {
    setSelectedAddressId(null)
    setUseNewAddress(true)
    setAddress('')
    setNewAddressSelected(false)
  }

  const handleNewAddressSelect = (addr: { line1: string; city: string; postcode: string }) => {
    setNewAddressLine(addr.line1)
    setNewCity(addr.city)
    setNewPostcode(addr.postcode)
    setAddress(`${addr.line1}, ${addr.city} ${addr.postcode}`)
    setNewAddressSelected(true)
  }

  const handleManualEntry = () => {
    setNewAddressLine('')
    setNewCity('')
    setNewPostcode('')
    setAddress('')
    setNewAddressSelected(true)
  }

  // Update address string when individual fields change
  const updateAddressFromFields = () => {
    if (newAddressLine && newCity && newPostcode) {
      setAddress(`${newAddressLine}, ${newCity} ${newPostcode}`)
    }
  }

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return Home
      case 'Work':
        return Briefcase
      default:
        return MapPinned
    }
  }

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
    const order = await createOrder(
      items,
      user?.id || 'guest',
      customerName,
      customerPhone,
      orderType,
      orderType === 'delivery' ? address : undefined,
      notes || undefined
    )

    if (!order) {
      addToast('Failed to create order. Please try again.', 'error')
      setIsProcessing(false)
      return
    }

    // Decrement stock for all items
    items.forEach((item) => {
      decrementStock(item.productId, item.quantity)
    })

    // Record purchases for customer history (if authenticated)
    // Note: The order API also records purchases, so we'll refresh customer data after order
    if (user && user.role === 'customer') {
      // Refresh customer data to get the purchases recorded by the order API
      await fetchCustomerData(user.id)
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
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. Your order number is:
          </p>
          <p className="text-2xl font-mono font-bold text-primary mb-8">{orderId}</p>

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
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Truck className={`h-6 w-6 mx-auto mb-2 ${orderType === 'delivery' ? 'text-primary' : 'text-gray-400'}`} />
              <p className="font-medium">Delivery</p>
              <p className="text-sm text-gray-500">To your door</p>
            </button>
            <button
              onClick={() => setOrderType('pickup')}
              className={`p-4 rounded-xl border-2 transition-all ${
                orderType === 'pickup'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Store className={`h-6 w-6 mx-auto mb-2 ${orderType === 'pickup' ? 'text-primary' : 'text-gray-400'}`} />
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
            
            {/* Phone Number Section */}
            {isAuthenticated && user?.phone && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseSavedPhone(!useSavedPhone)
                      if (!useSavedPhone) {
                        setCustomerPhone(user.phone || '')
                      } else {
                        setCustomerPhone('')
                      }
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    {useSavedPhone ? 'Use different number' : 'Use saved number'}
                  </button>
                </div>
                
                {useSavedPhone ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 font-medium">{user.phone}</span>
                      <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Saved
                      </span>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="tel"
                    placeholder="07123 456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    icon={<Phone className="h-5 w-5" />}
                    required
                  />
                )}
              </div>
            )}
            
            {(!isAuthenticated || !user?.phone) && (
              <Input
                label="Phone Number"
                type="tel"
                placeholder="07123 456789"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                icon={<Phone className="h-5 w-5" />}
                required
              />
            )}
          </div>
        </Card>

        {/* Delivery Address or Pickup Location */}
        {orderType === 'delivery' ? (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Delivery Address</h2>
              {isAuthenticated && (
                <Link
                  href="/account/addresses"
                  className="text-sm text-primary font-medium hover:underline"
                >
                  Manage Addresses
                </Link>
              )}
            </div>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2 mb-4">
                {savedAddresses.map((addr) => {
                  const LabelIcon = getLabelIcon(addr.label)
                  const isSelected = selectedAddressId === addr.id && !useNewAddress
                  return (
                    <button
                      key={addr.id}
                      onClick={() => handleAddressSelect(addr)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-primary/10' : 'bg-gray-100'
                        }`}
                      >
                        <LabelIcon
                          className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-gray-500'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{addr.label}</span>
                          {addr.isPrimary && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{addr.fullAddress}</p>
                        <p className="text-xs text-gray-500">
                          {addr.city}, {addr.postcode}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  )
                })}

                {/* Use different address option */}
                <button
                  onClick={handleUseNewAddress}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    useNewAddress
                      ? 'border-primary bg-primary/5'
                      : 'border-dashed border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      useNewAddress ? 'bg-primary/10' : 'bg-gray-100'
                    }`}
                  >
                    <Plus className={`h-4 w-4 ${useNewAddress ? 'text-primary' : 'text-gray-500'}`} />
                  </div>
                  <span className={`font-medium ${useNewAddress ? 'text-primary' : 'text-gray-600'}`}>
                    Use a different address
                  </span>
                </button>
              </div>
            )}

            {/* Postcode lookup - shown when no saved addresses or using new address */}
            {(savedAddresses.length === 0 || useNewAddress) && (
              <div className="space-y-4">
                {!newAddressSelected && (
                  <PostcodeLookup
                    onAddressSelect={handleNewAddressSelect}
                    onManualEntry={handleManualEntry}
                  />
                )}

                {/* Editable address fields */}
                {newAddressSelected && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">Delivery Address</p>
                      <button
                        type="button"
                        onClick={() => {
                          setNewAddressSelected(false)
                          setNewAddressLine('')
                          setNewCity('')
                          setNewPostcode('')
                          setAddress('')
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        Change Postcode
                      </button>
                    </div>
                    <Input
                      label="Street Address"
                      placeholder="123 Main Street, Flat 4B"
                      value={newAddressLine}
                      onChange={(e) => {
                        setNewAddressLine(e.target.value)
                        if (e.target.value && newCity && newPostcode) {
                          setAddress(`${e.target.value}, ${newCity} ${newPostcode}`)
                        }
                      }}
                      icon={<MapPin className="h-5 w-5" />}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        placeholder="London"
                        value={newCity}
                        onChange={(e) => {
                          setNewCity(e.target.value)
                          if (newAddressLine && e.target.value && newPostcode) {
                            setAddress(`${newAddressLine}, ${e.target.value} ${newPostcode}`)
                          }
                        }}
                      />
                      <Input
                        label="Postcode"
                        placeholder="SW1A 1AA"
                        value={newPostcode}
                        onChange={(e) => {
                          setNewPostcode(e.target.value.toUpperCase())
                          if (newAddressLine && newCity && e.target.value) {
                            setAddress(`${newAddressLine}, ${newCity} ${e.target.value.toUpperCase()}`)
                          }
                        }}
                        className="uppercase"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Pickup Location</h2>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <Store className="h-5 w-5 text-primary mt-0.5" />
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
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
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
                <span className="text-primary font-medium">FREE</span>
              ) : (
                <span>{formatPrice(deliveryFee)}</span>
              )}
            </div>
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)}</span>
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
