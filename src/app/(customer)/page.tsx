'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Clock, ChevronRight, Utensils, ShoppingBag, Sparkles, Heart } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useAddressStore } from '@/stores/addressStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateDistance } from '@/lib/utils'

// Quick category icons for top row
const QUICK_CATEGORIES = [
  { id: 'restaurants', name: 'Restaurants', icon: '🍽️', href: '/stores' },
  { id: 'groceries', name: 'Groceries', icon: '🛒', href: '/stores' },
  { id: 'health', name: 'Health & Beauty', icon: '💊', href: '/category/household-essentials' },
  { id: 'alcohol', name: 'Alcohol', icon: '🍷', href: '/category/drinks-beverages' },
  { id: 'specials', name: 'Specials', icon: '⭐', href: '/stores' },
]

// Find your flavour - Cuisine types
const CUISINES = [
  { id: 'nigerian', name: 'Nigerian', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=nigerian' },
  { id: 'indian', name: 'Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200', href: '/search?q=indian' },
  { id: 'chinese', name: 'Chinese', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200', href: '/search?q=chinese' },
  { id: 'ghanaian', name: 'Ghanaian', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=ghanaian' },
  { id: 'caribbean', name: 'Caribbean', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200', href: '/search?q=caribbean' },
  { id: 'african', name: 'African', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=african' },
]

export default function HomePage() {
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const featuredProducts = products.filter((p) => p.isActive).slice(0, 8)
  const { user, isAuthenticated } = useAuthStore()
  const { getOrdersByCustomer } = useOrderStore()
  const { favourites, getRegulars, userId, setUserId, fetchCustomerData, purchaseHistory } = useCustomerStore()
  const stores = useVendorStore((state) => state.stores)
  const fetchStores = useVendorStore((state) => state.fetchStores)
  const { getPrimaryAddress, fetchAddresses } = useAddressStore()

  // Get user's primary address for proximity sorting
  const primaryAddress = user ? getPrimaryAddress(user.id) : undefined

  // Fetch data on mount
  useEffect(() => {
    fetchProducts({})
    fetchStores()
  }, [fetchProducts, fetchStores])

  // Fetch addresses when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAddresses(user.id)
    }
  }, [isAuthenticated, user?.id, fetchAddresses])

  // Sync customerStore when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role === 'customer') {
      if (userId !== user.id) {
        setUserId(user.id)
        fetchCustomerData(user.id)
      } else if (userId === user.id) {
        fetchCustomerData(user.id)
      }
    } else if (!isAuthenticated) {
      setUserId(null)
    }
  }, [isAuthenticated, user?.id, user?.role, userId, setUserId, fetchCustomerData])

  const customerOrders = user ? getOrdersByCustomer(user.id) : []
  const regulars = getRegulars()
  const regularsCount = regulars.length
  const favouritesCount = favourites.length

  // Get regular products (frequently purchased)
  const regularProducts = products.filter(p =>
    purchaseHistory.some(ph => ph.productId === p.id)
  ).slice(0, 4)

  // Sort stores by proximity to user's primary address
  const sortedStores = useMemo(() => {
    if (!primaryAddress?.coordinates) {
      return stores
    }

    const { lat: userLat, lng: userLng } = primaryAddress.coordinates

    return [...stores].sort((a, b) => {
      const distA = calculateDistance(userLat, userLng, a.coordinates.lat, a.coordinates.lng)
      const distB = calculateDistance(userLat, userLng, b.coordinates.lat, b.coordinates.lng)
      return distA - distB
    })
  }, [stores, primaryAddress?.coordinates])

  return (
    <div className="min-h-screen bg-white">
      {/* Quick Categories Row - Compact */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl hover:bg-gray-200 transition-colors">
                  {cat.icon}
                </div>
                <span className="text-[10px] text-gray-600 whitespace-nowrap text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Find Your Flavour - Compact */}
      <section className="py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-gray-900">Find your flavour</h2>
            <Link href="/stores" className="text-primary text-sm font-medium">
              Show all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine.id}
                href={cuisine.href}
                className="flex flex-col items-center gap-1 min-w-[60px]"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 hover:border-primary transition-colors">
                  <img
                    src={cuisine.image}
                    alt={cuisine.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-700 font-medium">{cuisine.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hello Card - Right after Find your flavour */}
      {isAuthenticated && user?.role === 'customer' && (
        <section className="py-3">
          <div className="max-w-7xl mx-auto px-4">
            <Card className="p-4 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">
                Hello {user.name.split(' ')[0]}
              </h2>
              <p className="text-gray-500 text-sm mb-3">Ready to start shopping?</p>
              <div className="flex gap-2">
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full py-2 text-sm">Book a slot</Button>
                </Link>
                <Link href="/orders" className="flex-1">
                  <Button variant="outline" className="w-full py-2 text-sm">My orders</Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Shops in Your Area - Compact */}
      <section className="py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-gray-900">Shops in your area</h2>
            <Link href="/stores" className="text-primary text-sm font-medium">
              Show all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {sortedStores.slice(0, 6).map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="flex-shrink-0 w-20"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl mb-1 overflow-hidden flex items-center justify-center">
                    {store.image ? (
                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-900 truncate w-full text-center">{store.name}</p>
                  <p className="text-[10px] text-gray-500">10-20 mins</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Your Regulars - Only show if user has regulars, below the fold */}
      {isAuthenticated && user?.role === 'customer' && regularsCount > 0 && (
        <section className="py-4 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">Your Regulars</h3>
                  <p className="text-xs text-gray-500">
                    {regularsCount} items {favouritesCount > 0 && `(${favouritesCount} on offer)`}
                  </p>
                </div>
              </div>
              {regularProducts.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {regularProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-14 object-cover"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <Link href="/regulars">
                <Button className="w-full py-2 text-sm">
                  Shop regulars
                </Button>
              </Link>
            </Card>
          </div>
        </section>
      )}

      {/* Popular Products */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Popular Products</h2>
            <Link href="/stores" className="text-primary text-sm font-medium flex items-center gap-1">
              Show all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Hero Banner (for guests) */}
      {!isAuthenticated && (
        <section className="py-8 bg-primary">
          <div className="max-w-7xl mx-auto px-4">
            <Badge className="bg-white/20 text-white mb-3">Now Serving Leeds & Southampton</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Flavours of the World,<br />Delivered to You
            </h2>
            <p className="text-white/80 mb-6 max-w-md">
              Shop authentic international groceries from local stores near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/stores">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100">
                  <MapPin className="h-5 w-5 mr-2" />
                  Find Stores Near You
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
