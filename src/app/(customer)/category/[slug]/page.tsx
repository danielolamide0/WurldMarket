'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Filter, X, Check, Store, Package, MapPin } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useAuthStore } from '@/stores/authStore'
import { useAddressStore } from '@/stores/addressStore'
import { useLocationStore, useActiveLocation } from '@/stores/locationStore'
import { ProductCard } from '@/components/products/ProductCard'
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants'
import { ProductCategory } from '@/types'
import { calculateDistance, getEffectiveCityForStores } from '@/lib/utils'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const category = CATEGORIES.find((c) => c.slug === slug)
  const [filter, setFilter] = useState<'stores' | 'products'>('products')
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
  const [isStoreFilterOpen, setIsStoreFilterOpen] = useState(false)
  const storeFilterRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated } = useAuthStore()
  const { getPrimaryAddress } = useAddressStore()
  const allProducts = useProductStore((state) => state.getProductsByCategory(slug as ProductCategory))
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const { stores, fetchStores } = useVendorStore()

  // Get user's primary address
  const primaryAddress = user ? getPrimaryAddress(user.id) : undefined

  // Get active location for city filtering and proximity sorting
  const activeLocation = useActiveLocation(
    isAuthenticated,
    primaryAddress ? { city: primaryAddress.city, coordinates: primaryAddress.coordinates } : null
  )

  // Fetch products and stores for this category when page loads
  useEffect(() => {
    fetchProducts({ category: slug })
    fetchStores()
  }, [slug, fetchProducts, fetchStores])

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

  // Use effective city: user's city if it has stores, otherwise closest city with stores
  const { city: effectiveCity, isFallback: isClosestCity } = getEffectiveCityForStores(
    activeLocation.city,
    activeLocation.coordinates,
    stores
  )

  // Filter stores by effective city when we have a location
  let availableStores = stores
  if (effectiveCity) {
    availableStores = stores.filter((s) => s.city.toLowerCase() === effectiveCity.toLowerCase())
  }

  // Filter products by effective city when we have a location
  let products = allProducts
  if (effectiveCity) {
    products = allProducts.filter((p) => {
      const store = stores.find((s) => s.id === p.storeId)
      return store && store.city.toLowerCase() === effectiveCity.toLowerCase()
    })
  }

  // Get stores that have products in this category (BEFORE filtering by selectedStoreIds)
  // This ensures all stores remain visible in the filter dropdown
  const storeIdsWithCategoryProducts = new Set(products.map(p => p.storeId))
  const storesWithCategoryProducts = availableStores.filter(s => storeIdsWithCategoryProducts.has(s.id))

  // Sort stores by proximity if user has location
  let sortedStores = storesWithCategoryProducts
  if (activeLocation.coordinates) {
    sortedStores = storesWithCategoryProducts.sort((a, b) => {
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

  // Filter products by selected stores (AFTER calculating sortedStores)
  if (selectedStoreIds.length > 0) {
    products = products.filter((p) => selectedStoreIds.includes(p.storeId))
  }

  // Sort products by proximity if user has location
  if (activeLocation.coordinates) {
    products = products
      .map((product) => {
        const store = stores.find((s) => s.id === product.storeId)
        return { ...product, storeCoordinates: store?.coordinates }
      })
      .sort((a, b) => {
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

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <Link href="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Arrow + Filter Tabs + Store Filter Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            {/* Filter Tabs */}
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
          </div>

          {/* Store Filter Button (only show on Products tab) */}
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
                  {effectiveCity 
                    ? `Stores in ${effectiveCity}${isClosestCity ? ' (closest to you)' : ''} with ${category.name}`
                    : `Stores with ${category.name}`}
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
                {sortedStores.map((store) => {
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
                {sortedStores.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No stores found with products in this category
                  </div>
                )}
              </div>
            )}
            </div>
          )}
        </div>

        {/* Stores Section */}
        {filter === 'stores' && sortedStores.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedStores.map((store) => (
                <Link key={store.id} href={`/stores/${store.id}`}>
                  <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-gray-100">
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
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Open</span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {store.address}, {store.city}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {filter === 'stores' && sortedStores.length === 0 && (
          <div className="bg-cream rounded-2xl p-12 text-center">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No stores found with products in this category.</p>
            <Link href="/" className="text-primary font-medium hover:underline">
              Browse all stores
            </Link>
          </div>
        )}

        {/* Products Section */}
        {filter === 'products' && products.length === 0 ? (
          <div className="bg-cream rounded-2xl p-12 text-center">
            <p className="text-gray-500 mb-4">No products found in this category.</p>
            <Link href="/" className="text-primary font-medium hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          filter === 'products' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
