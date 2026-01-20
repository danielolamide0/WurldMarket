'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Phone, ExternalLink } from 'lucide-react'
import { stores } from '@/data/stores'
import { vendors } from '@/data/users'
import { useProductStore } from '@/stores/productStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CATEGORIES } from '@/lib/constants'

export default function StoreDetailPage() {
  const params = useParams()
  const storeId = params.storeId as string
  const store = stores.find((s) => s.id === storeId)
  const vendor = store ? vendors.find((v) => v.id === store.vendorId) : null
  const products = useProductStore((state) => state.getProductsByStore(storeId))

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
  const storeCategories = [...new Set(products.map((p) => p.category))]

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
          href="/stores"
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-xl hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>

      {/* Store Info */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <Badge variant="success" size="sm" className="mb-2">Open Now</Badge>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
              <p className="text-gray-600 mb-4">{vendor?.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  <MapPin className="h-4 w-4 text-terracotta" />
                  {store.address}, {store.city} {store.postcode}
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4 text-terracotta" />
                  9:00 AM - 9:00 PM
                </span>
                {vendor && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <Phone className="h-4 w-4 text-terracotta" />
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
              {CATEGORIES.filter((c) => storeCategories.includes(c.id)).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-terracotta hover:text-white transition-colors whitespace-nowrap"
                >
                  {category.name}
                </Link>
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
            <div className="bg-white rounded-2xl p-8 text-center">
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
