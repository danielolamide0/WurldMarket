'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Phone, ExternalLink } from 'lucide-react'
import { useVendorStore } from '@/stores/vendorStore'
import { useProductStore } from '@/stores/productStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/lib/constants'
import { ProductCategory } from '@/types'

export default function StoreDetailPage() {
  const params = useParams()
  const storeId = params.storeId as string
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)

  const stores = useVendorStore((state) => state.stores)
  const vendors = useVendorStore((state) => state.vendors)
  const fetchStores = useVendorStore((state) => state.fetchStores)
  const fetchVendors = useVendorStore((state) => state.fetchVendors)

  const allProducts = useProductStore((state) => state.getProductsByStore(storeId))
  const fetchProducts = useProductStore((state) => state.fetchProducts)

  const store = stores.find((s) => s.id === storeId)
  const vendor = store ? vendors.find((v) => v.id === store.vendorId) : null

  // Filter products by selected category
  const products = selectedCategory
    ? allProducts.filter((p) => p.category === selectedCategory)
    : allProducts

  // Ensure data is fetched
  useEffect(() => {
    if (stores.length === 0) fetchStores()
    if (vendors.length === 0) fetchVendors()
    fetchProducts({ storeId })
  }, [fetchStores, fetchVendors, fetchProducts, storeId, stores.length, vendors.length])

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <Link href="/stores">
            <Button>Back to Stores</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get unique categories for this store's products
  const storeCategories = Array.from(new Set(allProducts.map((p) => p.category)))

  return (
    <div className="min-h-screen">
      {/* Header Image */}
      <div className="relative h-48 md:h-64 bg-gray-100">
        <img
          src={store.image}
          alt={store.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link
          href="/"
          className="absolute top-4 left-4 p-2 bg-cream/90 rounded-xl hover:bg-cream transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-cream rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <Badge variant="success" size="sm" className="mb-2">Open Now</Badge>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
              <p className="text-gray-600 mb-4">{vendor?.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4 text-primary" />
                  {store.address}, {store.city} {store.postcode}
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4 text-primary" />
                  9:00 AM - 9:00 PM
                </span>
                {vendor && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <Phone className="h-4 w-4 text-primary" />
                    {vendor.contactPhone}
                  </span>
                )}
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
            </a>
          </div>
        </div>

        {/* Category Filter */}
        {storeCategories.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-primary text-white'
                    : 'bg-cream text-gray-700 hover:bg-primary hover:text-white'
                }`}
              >
                All
              </button>
              {CATEGORIES.filter((c) => storeCategories.includes(c.id)).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as ProductCategory)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-cream text-gray-700 hover:bg-primary hover:text-white'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="bg-cream rounded-2xl p-8 text-center">
              <p className="text-gray-500">No products available at this store yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
