'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingCart, Store, AlertCircle } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { formatPrice } from '@/lib/utils'
import { CATEGORY_MAP } from '@/lib/constants'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  const { addToast } = useToast()

  const product = useProductStore((state) => state.getProductById(productId))
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const { addItem, getItemQuantity } = useCartStore()
  const { stores, fetchStores } = useVendorStore()
  const [quantity, setQuantity] = useState(1)

  // Fetch data on mount
  useEffect(() => {
    fetchProducts({})
    fetchStores()
  }, [fetchProducts, fetchStores])

  const quantityInCart = product ? getItemQuantity(product.id) : 0
  const store = product ? stores.find((s) => s.id === product.storeId) : null

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const maxQuantity = Math.min(product.stock - quantityInCart, product.stock)

  const handleAddToCart = () => {
    if (isOutOfStock || quantity > maxQuantity) return

    addItem({
      productId: product.id,
      storeId: product.storeId,
      vendorId: product.vendorId,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image,
      quantity,
      stock: product.stock,
    })

    addToast(`Added ${quantity} x ${product.name} to cart`, 'success')
    setQuantity(1)
  }

  return (
    <div className="min-h-screen">
      {/* Header Image */}
      <div className="relative h-64 md:h-80 bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="error" className="text-lg px-4 py-2">Out of Stock</Badge>
          </div>
        )}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/90 rounded-xl hover:bg-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Product Info */}
        <div className="mb-6">
          <Badge variant="outline" className="mb-3">
            {CATEGORY_MAP[product.category]}
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-terracotta">{formatPrice(product.price)}</span>
            <span className="text-gray-500">/ {product.unit}</span>
          </div>

          {/* Stock Info */}
          {product.stock > 0 && product.stock <= 10 && (
            <div className="flex items-center gap-2 text-amber-600 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Only {product.stock} left in stock</span>
            </div>
          )}

          {quantityInCart > 0 && (
            <Badge variant="success" className="mb-4">
              {quantityInCart} already in cart
            </Badge>
          )}
        </div>

        {/* Store Info */}
        {store && (
          <Link href={`/stores/${store.id}`}>
            <Card className="p-4 mb-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6 text-terracotta" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Available at</p>
                  <p className="font-medium text-gray-900">{store.name}</p>
                </div>
              </div>
            </Card>
          </Link>
        )}

        {/* Add to Cart */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-gray-700">Quantity</span>
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
                className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || quantity > maxQuantity}
            className="w-full"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {isOutOfStock
              ? 'Out of Stock'
              : `Add to Cart - ${formatPrice(product.price * quantity)}`}
          </Button>
        </Card>
      </div>
    </div>
  )
}
