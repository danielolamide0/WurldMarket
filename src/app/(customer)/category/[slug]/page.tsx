'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { ProductCard } from '@/components/products/ProductCard'
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants'
import { ProductCategory } from '@/types'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const category = CATEGORIES.find((c) => c.slug === slug)
  const products = useProductStore((state) => state.getProductsByCategory(slug as ProductCategory))
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchStores = useVendorStore((state) => state.fetchStores)

  // Fetch products and stores for this category when page loads
  useEffect(() => {
    fetchProducts({ category: slug })
    fetchStores()
  }, [slug, fetchProducts, fetchStores])

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
        {/* Back Arrow */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
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
