'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Clock, ChevronRight, Utensils, ShoppingBag, Sparkles, Heart, Wheat, Flame, Snowflake, Leaf, Cookie, Coffee, Carrot, Salad, Apple, Beef, Fish, Droplet, Droplets, ChefHat, Package, Egg, Home, WheatOff, Circle } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'
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

// Icon mapping for categories
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Wheat,
  Flame,
  Snowflake,
  Leaf,
  Cookie,
  Coffee,
  Carrot,
  Salad,
  Apple,
  Beef,
  Fish,
  Droplet,
  Droplets,
  Utensils,
  ChefHat,
  Package,
  Egg,
  Home,
  Sparkles,
  WheatOff,
  Bean: Circle,
}

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
  const { getPrimaryAddress, fetchAddresses, addresses } = useAddressStore()

  // Get user's primary address for proximity sorting (reactive to address store changes)
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
    // Get primary address directly from addresses array (reactive to changes)
    const currentPrimaryAddress = user 
      ? addresses.find(addr => addr.userId === user.id && addr.isPrimary)
      : undefined
    
    // Debug logging to check what's happening
    if (user && isAuthenticated && stores.length > 0) {
      console.log('🔍 Sorting Debug:')
      console.log('Primary Address:', currentPrimaryAddress)
      console.log('Primary Address has coordinates:', !!currentPrimaryAddress?.coordinates)
      if (currentPrimaryAddress?.coordinates) {
        console.log('Primary Address coords:', currentPrimaryAddress.coordinates)
      }
      console.log('Stores:', stores.map(s => ({ 
        name: s.name, 
        hasCoords: !!s.coordinates,
        coords: s.coordinates 
      })))
    }
    
    if (!currentPrimaryAddress?.coordinates || !stores.length) {
      if (user && isAuthenticated) {
        console.log('⚠️ Cannot sort: No primary address coordinates or no stores')
      }
      return stores
    }

    const { lat: userLat, lng: userLng } = currentPrimaryAddress.coordinates

    // Filter stores that have coordinates before sorting
    const storesWithCoords = stores.filter(store => 
      store.coordinates && 
      typeof store.coordinates.lat === 'number' && 
      typeof store.coordinates.lng === 'number'
    )

    const storesWithoutCoords = stores.filter(store => 
      !store.coordinates || 
      typeof store.coordinates.lat !== 'number' || 
      typeof store.coordinates.lng !== 'number'
    )

    // Sort stores with coordinates by distance
    const sorted = [...storesWithCoords].sort((a, b) => {
      const distA = calculateDistance(userLat, userLng, a.coordinates.lat, a.coordinates.lng)
      const distB = calculateDistance(userLat, userLng, b.coordinates.lat, b.coordinates.lng)
      if (user && isAuthenticated) {
        console.log(`📏 ${a.name}: ${distA.toFixed(2)} miles, ${b.name}: ${distB.toFixed(2)} miles`)
      }
      return distA - distB
    })

    if (user && isAuthenticated && sorted.length > 0) {
      console.log('✅ Sorted order:', sorted.map(s => ({
        name: s.name,
        distance: calculateDistance(userLat, userLng, s.coordinates.lat, s.coordinates.lng).toFixed(2) + ' miles'
      })))
    }

    // Append stores without coordinates at the end
    return [...sorted, ...storesWithoutCoords]
  }, [stores, addresses, user?.id, isAuthenticated])

  return (
    <div className="min-h-screen bg-white">
      {/* Categories Row - Compact */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => {
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-1 min-w-[80px] flex-shrink-0"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden hover:bg-gray-200 transition-colors">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap text-center leading-tight">{cat.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Find Your Flavour - Compact */}
      <section className="py-3">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-base font-bold text-gray-900 mb-2">Find your flavour</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide md:justify-between">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine.id}
                href={cuisine.href}
                className="flex flex-col items-center gap-1 min-w-[60px] md:min-w-0 md:flex-1 md:max-w-[120px]"
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
            <Link
              href="/stores"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">STORE FINDER</span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 md:justify-between">
            {sortedStores.slice(0, 6).map((store) => (
              <Link
                key={store.id}
                href={`/stores/${store.id}`}
                className="flex-shrink-0 w-20 md:flex-1 md:max-w-[140px]"
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

      {/* Popular offers ending soon - Horizontally scrollable */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-bold text-primary mb-1">Popular offers ending soon</h2>
          <p className="text-sm text-gray-500 mb-3">Don&apos;t miss the chance to shop our trusted sellers</p>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {featuredProducts.slice(0, 6).map((product) => {
              const store = sortedStores.find(s => s.id === product.storeId)
              const originalPrice = (product.price * 1.25).toFixed(2)
              const offerEndDate = new Date()
              offerEndDate.setDate(offerEndDate.getDate() + 7)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-44 bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  {/* Store badge */}
                  <div className="px-2 py-1 bg-gray-100 text-xs text-gray-600">
                    {store?.name ? `${store.name}-` : 'Marketplace-'}
                  </div>

                  {/* Product image */}
                  <div className="h-28 bg-white flex items-center justify-center p-2">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Product info */}
                  <div className="p-2">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2 h-8">{product.name}</p>
                    <p className="text-[10px] text-gray-500 mb-2">Sold by {store?.name || 'Marketplace seller'}</p>

                    {/* Offer banner */}
                    <div className="bg-yellow-400 text-xs font-semibold text-gray-900 px-2 py-1 rounded mb-1">
                      Was £{originalPrice} Now £{product.price.toFixed(2)}
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">
                      Offer valid until {offerEndDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>

                    {/* Price and Add button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">£{product.price.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500">£{product.price.toFixed(2)}/each</p>
                      </div>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" className="text-xs px-3 py-1">Add</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

    </div>
  )
}
