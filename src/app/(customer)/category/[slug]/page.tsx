'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Filter, X, Check } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useAuthStore } from '@/stores/authStore'
import { useAddressStore } from '@/stores/addressStore'
import { useLocationStore, useActiveLocation } from '@/stores/locationStore'
import { ProductCard } from '@/components/products/ProductCard'
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants'
import { ProductCategory } from '@/types'
import { calculateDistance } from '@/lib/utils'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const category = CATEGORIES.find((c) => c.slug === slug)
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
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

  // Filter stores by city if user has location
  let availableStores = stores
  if (activeLocation.city) {
    availableStores = stores.filter((s) => 
      s.city.toLowerCase() === activeLocation.city!.toLowerCase()
    )
  }

  // Filter products by city if user has location
  let products = allProducts
  if (activeLocation.city) {
    products = allProducts.filter((p) => {
      const store = stores.find((s) => s.id === p.storeId)
      return store && store.city.toLowerCase() === activeLocation.city!.toLowerCase()
    })
  }

  // Filter products by selected store
  if (selectedStoreId) {
    products = products.filter((p) => p.storeId === selectedStoreId)
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
        {/* Back Arrow + Store Filter Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          {/* Store Filter Button */}
          <div className="relative flex-shrink-0" ref={storeFilterRef}>
            <button
              onClick={() => setIsStoreFilterOpen(!isStoreFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                selectedStoreId
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              {selectedStoreId ? (
                <>
                  <span className="hidden sm:inline">
                    {stores.find((s) => s.id === selectedStoreId)?.name || 'Store'}
                  </span>
                  <X
                    className="h-3 w-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedStoreId(null)
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
                    setSelectedStoreId(null)
                    setIsStoreFilterOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                    !selectedStoreId ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    !selectedStoreId ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}>
                    {!selectedStoreId && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className={`flex-1 ${!selectedStoreId ? 'font-medium text-primary' : 'text-gray-700'}`}>
                    All Stores
                  </span>
                </button>
                {availableStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setSelectedStoreId(store.id)
                      setIsStoreFilterOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                      selectedStoreId === store.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedStoreId === store.id ? 'border-primary bg-primary' : 'border-gray-300'
                    }`}>
                      {selectedStoreId === store.id && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate ${selectedStoreId === store.id ? 'font-medium text-primary' : 'text-gray-900'}`}>
                        {store.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{store.address}</p>
                    </div>
                  </button>
                ))}
                {availableStores.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    No stores found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-cream rounded-2xl p-12 text-center">
            <p className="text-gray-500 mb-4">No products found in this category.</p>
            <Link href="/" className="text-primary font-medium hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
