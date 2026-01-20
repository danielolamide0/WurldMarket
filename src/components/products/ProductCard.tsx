'use client'

import Link from 'next/link'
import { Plus, Check } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { CATEGORY_MAP } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, getItemQuantity } = useCartStore()
  const { addToast } = useToast()
  const quantityInCart = getItemQuantity(product.id)
  const isInCart = quantityInCart > 0
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return

    addItem({
      productId: product.id,
      storeId: product.storeId,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      quantity: 1,
      stock: product.stock,
    })

    addToast(`${product.name} added to cart`, 'success')
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group">
        {/* Image */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="error">Out of Stock</Badge>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <div className="absolute top-2 left-2">
              <Badge variant="warning" size="sm">Only {product.stock} left</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <Badge variant="outline" size="sm" className="mb-2">
            {CATEGORY_MAP[product.category]}
          </Badge>
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{product.unit}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-terracotta">{formatPrice(product.price)}</span>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl transition-all ${
                isInCart
                  ? 'bg-forest text-white'
                  : isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-terracotta text-white hover:bg-terracotta-dark'
              }`}
            >
              {isInCart ? (
                <Check className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
          </div>

          {isInCart && (
            <p className="text-sm text-forest mt-2 font-medium">
              {quantityInCart} in cart
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
