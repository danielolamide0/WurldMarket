'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, ArrowLeft, Loader2, Store, Package } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FilterType = 'all' | 'stores' | 'products'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [filter, setFilter] = useState<FilterType>('all')
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
  const showStores = filter === 'all' || filter === 'stores'
  const showProducts = filter === 'all' || filter === 'products'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back Arrow */}
        <Link
          href="/"
          className="inline-block p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5 text-primary" />
        </Link>

        {/* Search Query Display */}
        {query && (
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 capitalize">{query}</h1>
            <p className="text-sm text-gray-500">{totalResults} results found</p>
          </div>
        )}

        {/* Filter Tabs */}
        {totalResults > 0 && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({totalResults})
            </button>
            <button
              onClick={() => setFilter('stores')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'stores'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Store className="h-4 w-4" />
              Stores ({matchedStores.length})
            </button>
            <button
              onClick={() => setFilter('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'products'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="h-4 w-4" />
              Products ({matchedProducts.length})
            </button>
          </div>
        )}

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
                {filter === 'all' && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Stores ({matchedStores.length})
                  </h2>
                )}
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
                {filter === 'all' && (
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Products ({matchedProducts.length})
                  </h2>
                )}
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
