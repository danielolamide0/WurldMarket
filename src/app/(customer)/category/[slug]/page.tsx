'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { ProductCard } from '@/components/products/ProductCard'
import { CATEGORIES, CATEGORY_MAP } from '@/lib/constants'
import { ProductCategory } from '@/types'

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const category = CATEGORIES.find((c) => c.slug === slug)
  const products = useProductStore((state) => state.getProductsByCategory(slug as ProductCategory))
  const fetchProducts = useProductStore((state) => state.fetchProducts)

  // Fetch products for this category when page loads
  useEffect(() => {
    fetchProducts({ category: slug })
  }, [slug, fetchProducts])

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
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
          <p className="text-gray-600">{category.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500 mb-4">No products found in this category.</p>
            <Link href="/" className="text-primary font-medium hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{products.length} products found</p>
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
