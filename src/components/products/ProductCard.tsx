'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Minus, Heart, Store } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useVendorStore } from '@/stores/vendorStore'
import { formatPrice } from '@/lib/utils'
import { CATEGORY_MAP } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
  showStoreName?: boolean
}

export function ProductCard({ product, showStoreName }: ProductCardProps) {
  const pathname = usePathname()
  const { addItem, updateQuantity, removeItem, getItemQuantity } = useCartStore()
  const { isFavourite, toggleFavourite } = useCustomerStore()
  const { stores } = useVendorStore()
  const quantityInCart = getItemQuantity(product.id)
  const isInCart = quantityInCart > 0
  const isOutOfStock = product.stock === 0
  const isFav = isFavourite(product.id)
  
  // Show store name if not on a store page and showStoreName is not explicitly false
  const shouldShowStoreName = showStoreName !== false && !pathname?.startsWith('/stores/')
  const store = shouldShowStoreName ? stores.find((s) => s.id === product.storeId) : null

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
  }

  const handleIncreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantityInCart < product.stock) {
      if (quantityInCart === 0) {
        handleAddToCart(e)
      } else {
        updateQuantity(product.id, quantityInCart + 1)
      }
    }
  }

  const handleDecreaseQuantity = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (quantityInCart > 1) {
      updateQuantity(product.id, quantityInCart - 1)
    } else if (quantityInCart === 1) {
      removeItem(product.id)
    }
  }

  const handleToggleFavourite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavourite(product.id)
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
          {/* Favourite Button */}
          <button
            onClick={handleToggleFavourite}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              isFav
                ? 'bg-primary text-white'
                : 'bg-white/90 text-gray-400 hover:bg-white hover:text-primary'
            }`}
            title={isFav ? 'Remove from favourites' : 'Add to favourites'}
          >
            <Heart className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
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
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" size="sm">
              {CATEGORY_MAP[product.category]}
            </Badge>
            {shouldShowStoreName && store && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Store className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{store.name}</span>
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-3">{product.unit}</p>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>

            {isInCart ? (
              <div className="flex items-center gap-2 bg-primary-light rounded-xl p-1">
                <button
                  onClick={handleDecreaseQuantity}
                  className="p-1.5 rounded-lg hover:bg-primary transition-colors text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center font-semibold text-white">{quantityInCart}</span>
                <button
                  onClick={handleIncreaseQuantity}
                  disabled={quantityInCart >= product.stock}
                  className="p-1.5 rounded-lg hover:bg-primary transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`p-2.5 rounded-xl transition-all ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
