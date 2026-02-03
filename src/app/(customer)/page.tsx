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
      {/* Quick Categories Row */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Categories</h2>
            <Link href="/stores" className="text-primary text-sm font-medium flex items-center gap-1">
              Show all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="flex flex-col items-center gap-2 min-w-[70px]"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl hover:bg-gray-200 transition-colors">
                  {cat.icon}
                </div>
                <span className="text-xs text-gray-600 whitespace-nowrap">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Find Your Flavour */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Find your flavour</h2>
            <Link href="/stores" className="text-primary text-sm font-medium flex items-center gap-1">
              Show all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine.id}
                href={cuisine.href}
                className="flex flex-col items-center gap-2 min-w-[80px]"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 hover:border-primary transition-colors">
                  <img
                    src={cuisine.image}
                    alt={cuisine.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-700 font-medium">{cuisine.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Section for Logged-in Users */}
      {isAuthenticated && user?.role === 'customer' && (
        <section className="py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            {/* Greeting Card */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Hello {user.name.split(' ')[0]}
              </h2>
              <p className="text-gray-500 mb-4">Ready to start shopping?</p>
              <div className="flex gap-3">
                <Link href="/checkout" className="flex-1">
                  <Button className="w-full">Book a slot</Button>
                </Link>
                <Link href="/orders" className="flex-1">
                  <Button variant="outline" className="w-full">My orders</Button>
                </Link>
              </div>
            </Card>

            {/* Your Regulars */}
            {regularsCount > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Your Regulars</h3>
                    <p className="text-sm text-gray-500">
                      {regularsCount} items {favouritesCount > 0 && `(${favouritesCount} on offer)`}
                    </p>
                  </div>
                </div>
                {regularProducts.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {regularProducts.map((product) => (
                      <Link key={product.id} href={`/products/${product.id}`}>
                        <div className="bg-gray-100 rounded-xl p-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link href="/regulars">
                  <Button className="w-full bg-primary hover:bg-primary-dark">
                    Shop regulars
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Shops in Your Area */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Shops in your area</h2>
            <Link href="/stores" className="text-primary text-sm font-medium flex items-center gap-1">
              Show all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {sortedStores.slice(0, 6).map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="flex-shrink-0 w-28"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-3 hover:shadow-md transition-shadow">
                  <div className="w-full h-16 bg-gray-100 rounded-xl mb-2 overflow-hidden flex items-center justify-center">
                    {store.image ? (
                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{store.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    10-20 mins
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
