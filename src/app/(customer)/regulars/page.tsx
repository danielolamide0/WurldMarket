'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBasket, Heart, History, Plus, Check } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type TabType = 'regulars' | 'favourites' | 'previously-purchased'

function RegularsContent() {
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as TabType) || 'regulars'
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  const { isAuthenticated, user } = useAuthStore()
  const products = useProductStore((state) => state.products)
  const { favourites, getPreviouslyPurchased, getRegulars, fetchCustomerData, userId, setUserId } = useCustomerStore()
  const { addItem } = useCartStore()

  // Sync customerStore when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role === 'customer') {
      // If userId changed, clear old data and fetch new user's data
      if (userId !== user.id) {
        setUserId(user.id)
        fetchCustomerData(user.id)
      } else if (userId === user.id) {
        // Same user, just ensure data is fresh
        fetchCustomerData(user.id)
      }
    } else if (!isAuthenticated) {
      // User logged out, clear customer data
      setUserId(null)
    }
  }, [isAuthenticated, user?.id, userId, setUserId, fetchCustomerData])

  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType
    if (tab && ['regulars', 'favourites', 'previously-purchased'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const previouslyPurchasedIds = getPreviouslyPurchased()
  const regularsProductIds = getRegulars()

  // Regulars are products ordered more than twice
  const regularsProducts = products.filter((p) => regularsProductIds.includes(p.id))
  const favouritesProducts = products.filter((p) => favourites.includes(p.id))
  const previouslyPurchasedProducts = products.filter((p) => previouslyPurchasedIds.includes(p.id))

  const tabs = [
    {
      id: 'regulars' as TabType,
      label: 'Regulars',
      icon: ShoppingBasket,
      count: regularsProducts.length,
    },
    {
      id: 'favourites' as TabType,
      label: 'Favourites',
      icon: Heart,
      count: favouritesProducts.length,
    },
    {
      id: 'previously-purchased' as TabType,
      label: 'Previously Purchased',
      icon: History,
      count: previouslyPurchasedProducts.length,
    },
  ]

  const getActiveProducts = () => {
    switch (activeTab) {
      case 'regulars':
        return regularsProducts
      case 'favourites':
        return favouritesProducts
      case 'previously-purchased':
        return previouslyPurchasedProducts
      default:
        return []
    }
  }

  const activeProducts = getActiveProducts()
  const activeTabInfo = tabs.find((t) => t.id === activeTab)

  const handleAddAllToCart = () => {
    let addedCount = 0
    activeProducts.forEach((product) => {
      if (product.stock > 0) {
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
        addedCount++
      }
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-20">
        <Card className="max-w-md w-full p-8 text-center">
          <ShoppingBasket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to see your regulars</h1>
          <p className="text-gray-500 mb-6">
            Track your favourite items and quickly reorder products you buy regularly.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 py-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center px-6 py-4 rounded-2xl border-2 transition-all min-w-[120px] ${
                    isActive
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-white' : ''}`} />
                  <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Section Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your {activeTabInfo?.label}</h1>
          <p className="text-gray-500">
            {activeTab === 'regulars' && 'Items you buy regularly'}
            {activeTab === 'favourites' && 'Items you have saved'}
            {activeTab === 'previously-purchased' && 'Your order history'}
          </p>
        </div>

        {/* Item count and Add All button */}
        {activeProducts.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-700 font-medium">
              {activeProducts.length} item{activeProducts.length !== 1 ? 's' : ''}
            </p>
            <Button onClick={handleAddAllToCart} className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add all to cart
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {activeProducts.length === 0 ? (
          <Card className="p-12 text-center">
            {activeTab === 'regulars' ? (
              <>
                <ShoppingBasket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No regulars yet</h3>
                <p className="text-gray-500 mb-6">
                  Items you purchase frequently will appear here. Start shopping to build your regulars list!
                </p>
                <Link href="/stores">
                  <Button>Browse Products</Button>
                </Link>
              </>
            ) : activeTab === 'favourites' ? (
              <>
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No favourites yet</h3>
                <p className="text-gray-500 mb-6">
                  Tap the heart icon on any product to save it to your favourites.
                </p>
                <Link href="/stores">
                  <Button>Browse Products</Button>
                </Link>
              </>
            ) : (
              <>
                <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No purchase history</h3>
                <p className="text-gray-500 mb-6">
                  Products you have ordered will appear here for easy reordering.
                </p>
                <Link href="/stores">
                  <Button>Start Shopping</Button>
                </Link>
              </>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {activeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function RegularsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegularsContent />
    </Suspense>
  )
}
