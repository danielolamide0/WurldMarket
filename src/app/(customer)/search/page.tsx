'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, ArrowLeft, Loader2 } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const { stores, fetchStores } = useVendorStore()

  // Fetch data on mount
  useEffect(() => {
    fetchProducts({})
    fetchStores()
  }, [fetchProducts, fetchStores])

  const searchQuery = query.toLowerCase()

  // Search products
  const matchedProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery)
  )

  // Search stores
  const matchedStores = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery) ||
      s.address.toLowerCase().includes(searchQuery) ||
      s.city.toLowerCase().includes(searchQuery) ||
      s.postcode.toLowerCase().includes(searchQuery)
  )

  const totalResults = matchedProducts.length + matchedStores.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search results for &ldquo;{query}&rdquo;
              </h1>
              <p className="text-gray-600">
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
            {matchedStores.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Stores ({matchedStores.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedStores.map((store) => (
                    <Link key={store.id} href={`/stores/${store.id}`}>
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
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
            {matchedProducts.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Products ({matchedProducts.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {matchedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
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
