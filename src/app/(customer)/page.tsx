'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Clock, ChevronRight, ChevronLeft, Utensils, ShoppingBag, Sparkles, Heart, Wheat, Flame, Snowflake, Leaf, Cookie, Coffee, Carrot, Salad, Apple, Beef, Fish, Droplet, Droplets, ChefHat, Package, Egg, Home, WheatOff, Circle } from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'
import { useProductStore } from '@/stores/productStore'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useAddressStore } from '@/stores/addressStore'
import { useCartStore } from '@/stores/cartStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateDistance, calculateDeliveryTime } from '@/lib/utils'
import { OrbitingGlobe } from '@/components/home/OrbitingGlobe'

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
  const { setUserId: setCartUserId, userId: cartUserId } = useCartStore()

  // Get user's primary address for proximity sorting (reactive to address store changes)
  const primaryAddress = user ? getPrimaryAddress(user.id) : undefined

  // Refs for scrollable sections
  const categoriesRef = useRef<HTMLDivElement>(null)
  const storesRef = useRef<HTMLDivElement>(null)
  const offersRef = useRef<HTMLDivElement>(null)
  const trendingRef = useRef<HTMLDivElement>(null)

  // Scroll arrow visibility state
  const [categoriesScroll, setCategoriesScroll] = useState({ canScrollLeft: false, canScrollRight: true })
  const [storesScroll, setStoresScroll] = useState({ canScrollLeft: false, canScrollRight: true })
  const [offersScroll, setOffersScroll] = useState({ canScrollLeft: false, canScrollRight: true })
  const [trendingScroll, setTrendingScroll] = useState({ canScrollLeft: false, canScrollRight: true })

  // Check scroll position and update arrow visibility
  const updateScrollState = useCallback((ref: React.RefObject<HTMLDivElement>, setState: React.Dispatch<React.SetStateAction<{ canScrollLeft: boolean; canScrollRight: boolean }>>) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current
      setState({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft < scrollWidth - clientWidth - 1
      })
    }
  }, [])

  // Scroll handler for arrow buttons
  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.8
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Restore scroll positions on mount
  useEffect(() => {
    if (categoriesRef.current) {
      const savedScroll = sessionStorage.getItem('homepage-categories-scroll')
      if (savedScroll) {
        categoriesRef.current.scrollLeft = parseInt(savedScroll, 10)
      }
    }
    if (storesRef.current) {
      const savedScroll = sessionStorage.getItem('homepage-stores-scroll')
      if (savedScroll) {
        storesRef.current.scrollLeft = parseInt(savedScroll, 10)
      }
    }
  }, [])

  // Save scroll positions when scrolling and update arrow visibility
  useEffect(() => {
    const categoriesEl = categoriesRef.current
    const storesEl = storesRef.current
    const offersEl = offersRef.current
    const trendingEl = trendingRef.current

    const handleCategoriesScroll = () => {
      if (categoriesEl) {
        sessionStorage.setItem('homepage-categories-scroll', categoriesEl.scrollLeft.toString())
        updateScrollState(categoriesRef, setCategoriesScroll)
      }
    }

    const handleStoresScroll = () => {
      if (storesEl) {
        sessionStorage.setItem('homepage-stores-scroll', storesEl.scrollLeft.toString())
        updateScrollState(storesRef, setStoresScroll)
      }
    }

    const handleOffersScroll = () => {
      if (offersEl) {
        updateScrollState(offersRef, setOffersScroll)
      }
    }

    const handleTrendingScroll = () => {
      if (trendingEl) {
        updateScrollState(trendingRef, setTrendingScroll)
      }
    }

    // Initial check for scroll state
    updateScrollState(categoriesRef, setCategoriesScroll)
    updateScrollState(storesRef, setStoresScroll)
    updateScrollState(offersRef, setOffersScroll)
    updateScrollState(trendingRef, setTrendingScroll)

    if (categoriesEl) {
      categoriesEl.addEventListener('scroll', handleCategoriesScroll)
    }
    if (storesEl) {
      storesEl.addEventListener('scroll', handleStoresScroll)
    }
    if (offersEl) {
      offersEl.addEventListener('scroll', handleOffersScroll)
    }
    if (trendingEl) {
      trendingEl.addEventListener('scroll', handleTrendingScroll)
    }

    return () => {
      if (categoriesEl) {
        categoriesEl.removeEventListener('scroll', handleCategoriesScroll)
      }
      if (storesEl) {
        storesEl.removeEventListener('scroll', handleStoresScroll)
      }
      if (offersEl) {
        offersEl.removeEventListener('scroll', handleOffersScroll)
      }
      if (trendingEl) {
        trendingEl.removeEventListener('scroll', handleTrendingScroll)
      }
    }
  }, [updateScrollState])

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

  // Sync cartStore when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (cartUserId !== user.id) {
        setCartUserId(user.id)
      }
    } else if (!isAuthenticated) {
      setCartUserId(null)
    }
  }, [isAuthenticated, user?.id, cartUserId, setCartUserId])

  const customerOrders = user ? getOrdersByCustomer(user.id) : []
  const regulars = getRegulars()
  const regularsCount = regulars.length
  const favouritesCount = favourites.length

  // Get regular products (frequently purchased)
  const regularProducts = products.filter(p =>
    purchaseHistory.some(ph => ph.productId === p.id)
  ).slice(0, 4)

  // Get primary address for distance calculation (reactive to address changes)
  const currentPrimaryAddress = useMemo(() => {
    return user 
      ? addresses.find(addr => addr.userId === user.id && addr.isPrimary)
      : undefined
  }, [user, addresses])

  // Sort stores by proximity to user's primary address
  const sortedStores = useMemo(() => {

    if (!currentPrimaryAddress?.coordinates || !stores.length) {
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

    // Sort stores with coordinates by distance (closest first)
    const sorted = [...storesWithCoords].sort((a, b) => {
      const distA = calculateDistance(userLat, userLng, a.coordinates.lat, a.coordinates.lng)
      const distB = calculateDistance(userLat, userLng, b.coordinates.lat, b.coordinates.lng)
      return distA - distB
    })

    // Append stores without coordinates at the end
    return [...sorted, ...storesWithoutCoords]
  }, [stores, currentPrimaryAddress, isAuthenticated])

  // Get products on offer, sorted by proximity to user's primary address
  const offerProducts = useMemo(() => {
    const now = new Date()

    // Filter products that are on offer and offer hasn't expired
    const onOfferProducts = products.filter(p =>
      p.isOnOffer &&
      p.isActive &&
      (!p.offerEndDate || new Date(p.offerEndDate) > now)
    )

    // If user has primary address, sort by store proximity
    if (currentPrimaryAddress?.coordinates && sortedStores.length > 0) {
      // Create a map of storeId to distance
      const storeDistanceMap = new Map<string, number>()
      sortedStores.forEach((store, index) => {
        storeDistanceMap.set(store.id, index) // Use index as proxy for distance (already sorted)
      })

      // Sort products by their store's proximity
      return [...onOfferProducts].sort((a, b) => {
        const distA = storeDistanceMap.get(a.storeId) ?? 999
        const distB = storeDistanceMap.get(b.storeId) ?? 999
        return distA - distB
      }).slice(0, 10)
    }

    return onOfferProducts.slice(0, 10)
  }, [products, currentPrimaryAddress, sortedStores])

  // Get trending products, sorted by proximity to user's primary address
  const trendingProducts = useMemo(() => {
    // Filter products that are trending and active
    const trendingItems = products.filter(p => p.isTrending && p.isActive)

    // If user has primary address, sort by store proximity
    if (currentPrimaryAddress?.coordinates && sortedStores.length > 0) {
      const storeDistanceMap = new Map<string, number>()
      sortedStores.forEach((store, index) => {
        storeDistanceMap.set(store.id, index)
      })

      return [...trendingItems].sort((a, b) => {
        const distA = storeDistanceMap.get(a.storeId) ?? 999
        const distB = storeDistanceMap.get(b.storeId) ?? 999
        return distA - distB
      }).slice(0, 10)
    }

    return trendingItems.slice(0, 10)
  }, [products, currentPrimaryAddress, sortedStores])

  // Update stores scroll state when stores data loads
  useEffect(() => {
    // Small delay to ensure DOM has updated with new store items
    const timer = setTimeout(() => {
      updateScrollState(storesRef, setStoresScroll)
    }, 100)
    return () => clearTimeout(timer)
  }, [sortedStores.length, updateScrollState])

  // Update offers scroll state when offer products load
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollState(offersRef, setOffersScroll)
    }, 100)
    return () => clearTimeout(timer)
  }, [offerProducts.length, updateScrollState])

  // Update trending scroll state when trending products load
  useEffect(() => {
    const timer = setTimeout(() => {
      updateScrollState(trendingRef, setTrendingScroll)
    }, 100)
    return () => clearTimeout(timer)
  }, [trendingProducts.length, updateScrollState])

  return (
    <div className="min-h-screen bg-cream">
      {/* Categories Row */}
      <section className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-6">
          <div className="relative">
            {/* Left Arrow - Desktop */}
            {categoriesScroll.canScrollLeft && (
              <button
                onClick={() => handleScroll(categoriesRef, 'left')}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
            )}
            {/* Right Arrow - Desktop */}
            {categoriesScroll.canScrollRight && (
              <button
                onClick={() => handleScroll(categoriesRef, 'right')}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>
            )}
            <div ref={categoriesRef} className="flex gap-3 md:gap-6 overflow-x-auto scrollbar-hide py-2 px-2 -mx-2">
              {CATEGORIES.map((cat) => {
      return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex flex-col items-center gap-1 md:gap-2 min-w-[80px] md:min-w-[100px] flex-shrink-0 hover:scale-110 transition-transform duration-200"
                  >
                    <div className="w-12 h-12 md:w-24 md:h-24 bg-gray-100 rounded-xl md:rounded-2xl overflow-hidden hover:bg-gray-200 transition-colors hover:shadow-md">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] md:text-sm text-gray-600 whitespace-nowrap text-center leading-tight">{cat.name}</span>
                  </Link>
                )
              })}
            </div>
            {/* Mobile Arrows - Below content */}
            <div className="flex lg:hidden justify-center gap-4 mt-3">
              <button
                onClick={() => handleScroll(categoriesRef, 'left')}
                disabled={!categoriesScroll.canScrollLeft}
                className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                  categoriesScroll.canScrollLeft ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleScroll(categoriesRef, 'right')}
                disabled={!categoriesScroll.canScrollRight}
                className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                  categoriesScroll.canScrollRight ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Flavour - Orbiting Globe (Mobile only) */}
      <OrbitingGlobe />

      {/* Find Your Flavour - Horizontal scroll (Desktop only) */}
      <section className="hidden md:block py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Find your flavour</h2>
          <div className="flex gap-6 overflow-x-auto scrollbar-hide py-2 px-2 -mx-2 justify-between">
            {[
              { id: 'african', name: 'African', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=african' },
              { id: 'east-asian', name: 'East Asian', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200', href: '/search?q=chinese' },
              { id: 'caribbean', name: 'Caribbean', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200', href: '/search?q=caribbean' },
              { id: 'middle-eastern', name: 'Middle Eastern', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200', href: '/search?q=middle+eastern' },
              { id: 'south-asian', name: 'South Asian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200', href: '/search?q=indian' },
              { id: 'eastern-european', name: 'Eastern European', image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=200', href: '/search?q=eastern+european' },
            ].map((cuisine) => (
              <Link
                key={cuisine.id}
                href={cuisine.href}
                className="flex flex-col items-center gap-2 flex-1 max-w-[140px] hover:scale-110 transition-transform duration-200"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 hover:border-primary hover:shadow-lg transition-all">
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

      {/* Shops in Your Area */}
      <section className="py-3 md:py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Shops in your area</h2>
            <Link
              href="/stores"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">STORE FINDER</span>
            </Link>
          </div>
          <div className="relative">
            {/* Left Arrow - Desktop */}
            {storesScroll.canScrollLeft && (
              <button
                onClick={() => handleScroll(storesRef, 'left')}
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </button>
            )}
            {/* Right Arrow - Desktop */}
            {storesScroll.canScrollRight && (
              <button
                onClick={() => handleScroll(storesRef, 'right')}
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </button>
            )}
            <div ref={storesRef} className="flex gap-3 md:gap-6 overflow-x-auto scrollbar-hide py-2 px-2 -mx-2 md:justify-between">
              {sortedStores.map((store) => {
                // Calculate delivery time if user has primary address
                let deliveryTime: string | null = null
                if (isAuthenticated && currentPrimaryAddress?.coordinates && store.coordinates) {
                  const distance = calculateDistance(
                    currentPrimaryAddress.coordinates.lat,
                    currentPrimaryAddress.coordinates.lng,
                    store.coordinates.lat,
                    store.coordinates.lng
                  )
                  deliveryTime = calculateDeliveryTime(distance)
                }

                return (
                  <Link
                    key={store.id}
                    href={`/stores/${store.id}`}
                    className="flex-shrink-0 w-20 md:w-[100px] md:flex-1 md:max-w-[140px] hover:scale-110 transition-transform duration-200"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-cream border border-gray-200 rounded-xl md:rounded-2xl mb-1 md:mb-2 overflow-hidden flex items-center justify-center hover:border-primary hover:shadow-lg transition-all">
                        {store.image ? (
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                        ) : (
                          <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs md:text-sm font-medium text-gray-900 truncate w-full text-center">{store.name}</p>
                      {deliveryTime && (
                        <p className="text-[10px] md:text-xs text-gray-500">{deliveryTime}</p>
                      )}
                      </div>
                  </Link>
                )
              })}
            </div>
            {/* Mobile Arrows - Below content */}
            <div className="flex lg:hidden justify-center gap-4 mt-3">
              <button
                onClick={() => handleScroll(storesRef, 'left')}
                disabled={!storesScroll.canScrollLeft}
                className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                  storesScroll.canScrollLeft ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleScroll(storesRef, 'right')}
                disabled={!storesScroll.canScrollRight}
                className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                  storesScroll.canScrollRight ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
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

      {/* Offers ending soon - Horizontally scrollable */}
      {offerProducts.length > 0 && (
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-lg font-bold text-primary mb-1">Offers ending soon</h2>
            <p className="text-sm text-gray-500 mb-3">Don&apos;t miss the chance to shop our trusted sellers</p>
            <div className="relative">
              {/* Left Arrow - Desktop */}
              {offersScroll.canScrollLeft && (
                <button
                  onClick={() => handleScroll(offersRef, 'left')}
                  className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-primary" />
                </button>
              )}
              {/* Right Arrow - Desktop */}
              {offersScroll.canScrollRight && (
                <button
                  onClick={() => handleScroll(offersRef, 'right')}
                  className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
                >
                  <ChevronRight className="h-5 w-5 text-primary" />
                </button>
              )}
              <div ref={offersRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-2 -mx-2">
                {offerProducts.map((product) => {
                  const store = sortedStores.find(s => s.id === product.storeId)
                  const originalPrice = product.originalPrice || (product.price * 1.25)
                  const offerEndDate = product.offerEndDate ? new Date(product.offerEndDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-44 bg-cream border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Store badge */}
                      <div className="px-2 py-1 bg-gray-100 text-xs text-gray-600">
                        {store?.name ? `${store.name}-` : 'Marketplace-'}
                      </div>

                      {/* Product image */}
                      <div className="h-28 bg-cream flex items-center justify-center p-2">
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
                          Was £{originalPrice.toFixed(2)} Now £{product.price.toFixed(2)}
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
              {/* Mobile Arrows - Below content */}
              <div className="flex lg:hidden justify-center gap-4 mt-3">
                <button
                  onClick={() => handleScroll(offersRef, 'left')}
                  disabled={!offersScroll.canScrollLeft}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                    offersScroll.canScrollLeft ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleScroll(offersRef, 'right')}
                  disabled={!offersScroll.canScrollRight}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                    offersScroll.canScrollRight ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trendingProducts.length > 0 && (
        <section className="py-4">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-lg font-bold text-primary mb-1">
              {isAuthenticated ? 'Trending in your area' : 'Trending now'}
            </h2>
            <p className="text-sm text-gray-500 mb-3">Popular picks from our trusted sellers</p>
            <div className="relative">
              {/* Left Arrow - Desktop */}
              {trendingScroll.canScrollLeft && (
                <button
                  onClick={() => handleScroll(trendingRef, 'left')}
                  className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
                >
                  <ChevronLeft className="h-5 w-5 text-primary" />
                </button>
              )}
              {/* Right Arrow - Desktop */}
              {trendingScroll.canScrollRight && (
                <button
                  onClick={() => handleScroll(trendingRef, 'right')}
                  className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center rounded-full bg-cream/80 backdrop-blur-md shadow-lg border border-gray-200 hover:bg-cream transition-all"
                >
                  <ChevronRight className="h-5 w-5 text-primary" />
                </button>
              )}
              <div ref={trendingRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-2 -mx-2">
                {trendingProducts.map((product) => {
                  const store = sortedStores.find(s => s.id === product.storeId)

                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-44 bg-cream border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Store badge */}
                      <div className="px-2 py-1 bg-gray-100 text-xs text-gray-600">
                        {store?.name ? `${store.name}` : 'Marketplace'}
                      </div>

                      {/* Product image */}
                      <div className="h-28 bg-cream flex items-center justify-center p-2">
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

                        {/* Trending badge */}
                        <div className="bg-yellow-400 text-xs font-semibold text-gray-900 px-2 py-1 rounded mb-2">
                          Trending
                        </div>

                        {/* Price and Add button */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-gray-900">£{product.price.toFixed(2)}</p>
                            <p className="text-[10px] text-gray-500">£{product.price.toFixed(2)}/{product.unit || 'each'}</p>
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
              {/* Mobile Arrows - Below content */}
              <div className="flex lg:hidden justify-center gap-4 mt-3">
                <button
                  onClick={() => handleScroll(trendingRef, 'left')}
                  disabled={!trendingScroll.canScrollLeft}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                    trendingScroll.canScrollLeft ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleScroll(trendingRef, 'right')}
                  disabled={!trendingScroll.canScrollRight}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all ${
                    trendingScroll.canScrollRight ? 'bg-cream shadow-md text-primary' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
