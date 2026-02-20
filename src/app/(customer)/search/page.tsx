'use client'

import { Suspense, useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, ArrowLeft, Loader2, Store, Package, Filter, X, Check } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useAuthStore } from '@/stores/authStore'
import { useAddressStore } from '@/stores/addressStore'
import { useLocationStore, useActiveLocation } from '@/stores/locationStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { calculateDistance } from '@/lib/utils'
import { Product } from '@/types'

type FilterType = 'stores' | 'products'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [filter, setFilter] = useState<FilterType>('products')
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
  const [isStoreFilterOpen, setIsStoreFilterOpen] = useState(false)
  const storeFilterRef = useRef<HTMLDivElement>(null)
  
  const { user, isAuthenticated } = useAuthStore()
  const { getPrimaryAddress } = useAddressStore()
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const { stores, fetchStores } = useVendorStore()

  // Get user's primary address
  const primaryAddress = user ? getPrimaryAddress(user.id) : undefined

  // Get active location for city filtering and proximity sorting
  const activeLocation = useActiveLocation(
    isAuthenticated,
    primaryAddress ? { city: primaryAddress.city, coordinates: primaryAddress.coordinates } : null
  )

  // Fetch data on mount
  useEffect(() => {
    fetchProducts({})
    fetchStores()
  }, [fetchProducts, fetchStores])

  // Close store filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (storeFilterRef.current && !storeFilterRef.current.contains(event.target as Node)) {
        setIsStoreFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const searchQuery = query.toLowerCase()

  // Filter stores by city if user has location
  let availableStores = stores
  if (activeLocation.city) {
    availableStores = stores.filter((s) => 
      s.city.toLowerCase() === activeLocation.city!.toLowerCase()
    )
  }

  // Search stores
  let matchedStores = availableStores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery) ||
      s.address.toLowerCase().includes(searchQuery) ||
      s.city.toLowerCase().includes(searchQuery) ||
      s.postcode.toLowerCase().includes(searchQuery)
  )

  // Sort stores by proximity if user has location
  if (activeLocation.coordinates) {
    matchedStores = matchedStores.sort((a, b) => {
      const distA = a.coordinates
        ? calculateDistance(
            activeLocation.coordinates!.lat,
            activeLocation.coordinates!.lng,
            a.coordinates.lat,
            a.coordinates.lng
          )
        : Infinity
      const distB = b.coordinates
        ? calculateDistance(
            activeLocation.coordinates!.lat,
            activeLocation.coordinates!.lng,
            b.coordinates.lat,
            b.coordinates.lng
          )
        : Infinity
      return distA - distB
    })
  }

  // Check if search query matches a cuisine
  const cuisineMap: Record<string, string> = {
    'african': 'african',
    'caribbean': 'caribbean',
    'south asian': 'south-asian',
    'south-asian': 'south-asian',
    'indian': 'south-asian',
    'east asian': 'east-asian',
    'east-asian': 'east-asian',
    'chinese': 'east-asian',
    'middle eastern': 'middle-eastern',
    'middle-eastern': 'middle-eastern',
    'eastern european': 'eastern-european',
    'eastern-european': 'eastern-european',
  }
  const matchedCuisine = cuisineMap[searchQuery.replace('+', ' ')]

  // Search products - also match by cuisines array
  let matchedProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery) ||
        (p.cuisines && p.cuisines.some(c => c.toLowerCase().includes(searchQuery.replace('+', '-')))) ||
        (matchedCuisine && p.cuisines?.includes(matchedCuisine as any))
    )
    .map((product) => {
      const store = stores.find((s) => s.id === product.storeId)
      return { ...product, storeName: store?.name, storeCoordinates: store?.coordinates }
    })

  // If searching for a cuisine, find stores that have products in that cuisine
  // Get unique store IDs from matched products
  const storeIdsWithMatchingProducts = [...new Set(matchedProducts.map(p => p.storeId))]

  // For cuisine searches, show stores that sell products in that cuisine
  if (matchedCuisine) {
    matchedStores = availableStores.filter(s => storeIdsWithMatchingProducts.includes(s.id))
  }

  // Filter products by city if user has location
  if (activeLocation.city) {
    matchedProducts = matchedProducts.filter((p) => {
      const store = stores.find((s) => s.id === p.storeId)
      return store && store.city.toLowerCase() === activeLocation.city!.toLowerCase()
    })
  }

  // Filter products by selected stores
  if (selectedStoreIds.length > 0) {
    matchedProducts = matchedProducts.filter((p) => selectedStoreIds.includes(p.storeId))
  }

  // Sort products by proximity if user has location
  if (activeLocation.coordinates) {
    matchedProducts = matchedProducts.sort((a, b) => {
      const distA = a.storeCoordinates
        ? calculateDistance(
            activeLocation.coordinates!.lat,
            activeLocation.coordinates!.lng,
            a.storeCoordinates.lat,
            a.storeCoordinates.lng
          )
        : Infinity
      const distB = b.storeCoordinates
        ? calculateDistance(
            activeLocation.coordinates!.lat,
            activeLocation.coordinates!.lng,
            b.storeCoordinates.lat,
            b.storeCoordinates.lng
          )
        : Infinity
      return distA - distB
    })
  }

  const totalResults = matchedProducts.length + matchedStores.length
  const showStores = filter === 'stores'
  const showProducts = filter === 'products'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Back Arrow + Filter Tabs + Store Filter Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Link>

            {/* Filter Tabs */}
            {totalResults > 0 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setFilter('stores')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filter === 'stores'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  Stores
                </button>
                <button
                  onClick={() => setFilter('products')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    filter === 'products'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  Products
                </button>
              </div>
            )}
          </div>

          {/* Store Filter Button */}
          {filter === 'products' && (
            <div className="relative flex-shrink-0" ref={storeFilterRef}>
              <button
                onClick={() => setIsStoreFilterOpen(!isStoreFilterOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStoreIds.length > 0
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="h-4 w-4" />
                {selectedStoreIds.length > 0 ? (
                  <>
                    <span className="hidden sm:inline">
                      {selectedStoreIds.length === 1
                        ? stores.find((s) => s.id === selectedStoreIds[0])?.name || 'Store'
                        : `${selectedStoreIds.length} stores`}
                    </span>
                    <X
                      className="h-3 w-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedStoreIds([])
                      }}
                    />
                  </>
                ) : (
                  <span className="hidden sm:inline">Filter</span>
                )}
              </button>

              {/* Store Filter Dropdown */}
              {isStoreFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    {activeLocation.city ? `Stores in ${activeLocation.city}` : 'All Stores'}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStoreIds([])
                      setIsStoreFilterOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                      selectedStoreIds.length === 0 ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedStoreIds.length === 0 ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {selectedStoreIds.length === 0 && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className={`flex-1 ${selectedStoreIds.length === 0 ? 'font-medium text-primary' : 'text-gray-700'}`}>
                      All Stores
                    </span>
                  </button>
                  {matchedStores.map((store) => {
                    const isSelected = selectedStoreIds.includes(store.id)
                    return (
                      <button
                        key={store.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedStoreIds(selectedStoreIds.filter((id) => id !== store.id))
                          } else {
                            setSelectedStoreIds([...selectedStoreIds, store.id])
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`truncate ${isSelected ? 'font-medium text-primary' : 'text-gray-900'}`}>
                            {store.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{store.address}</p>
                        </div>
                      </button>
                    )
                  })}
                  {matchedStores.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No stores found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {totalResults === 0 ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
            <p className="text-gray-500 mb-6">
              We couldn&apos;t find any products or stores matching &ldquo;{query}&rdquo;
            </p>
            <Link href="/">
              <Button>Browse All Products</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Stores Section */}
            {showStores && matchedStores.length > 0 && (
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedStores.map((store) => (
                    <Link key={store.id} href={`/stores/${store.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                        <div className="h-32 bg-gray-100">
                          <img
                            src={store.image}
                            alt={store.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{store.name}</h3>
                            <Badge variant="success" size="sm">Open</Badge>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {store.address}, {store.city}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Products Section */}
            {showProducts && matchedProducts.length > 0 && (
              <section>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {matchedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state for filtered results */}
            {filter === 'stores' && matchedStores.length === 0 && (
              <Card className="p-8 text-center">
                <Store className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No stores found for &ldquo;{query}&rdquo;</p>
              </Card>
            )}
            {filter === 'products' && matchedProducts.length === 0 && (
              <Card className="p-8 text-center">
                <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No products found for &ldquo;{query}&rdquo;</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading search results...</p>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  )
}
