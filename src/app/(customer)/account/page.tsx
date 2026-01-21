'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  Clock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  Heart,
  Repeat,
  ShoppingBag,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useProductStore } from '@/stores/productStore'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'

type TabType = 'regulars' | 'favourites' | 'previously-purchased'

const menuItems = [
  { icon: MapPin, label: 'Saved Addresses', href: '#' },
  { icon: CreditCard, label: 'Payment Methods', href: '#' },
  { icon: Bell, label: 'Notifications', href: '#' },
  { icon: HelpCircle, label: 'Help & Support', href: '#' },
]

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('regulars')
  const orders = useOrderStore((state) =>
    user ? state.getOrdersByCustomer(user.id) : []
  )
  const { favourites, getRegulars, getPreviouslyPurchased } = useCustomerStore()
  const { getProductById, initializeProducts } = useProductStore()

  // Ensure products are initialized
  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  // Get product objects from IDs
  const regularProductIds = getRegulars()
  const regularProducts = regularProductIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined && p.isActive)

  const favouriteProductIds = favourites
  const favouriteProducts = favouriteProductIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined && p.isActive)

  const previouslyPurchasedIds = getPreviouslyPurchased()
  const previouslyPurchasedProducts = previouslyPurchasedIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined && p.isActive)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Continue</h1>
          <p className="text-gray-500 mb-8">
            Sign in to view your orders, manage your account, and more.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-forest-dark to-forest text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-white/70">{user?.email}</p>
            </div>
          </div>

          {user?.role === 'vendor' && (
            <Link href="/dashboard" className="block mt-4">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-forest">
                <Store className="h-4 w-4 mr-2" />
                Go to Vendor Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tabs Navigation - Like ASDA */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('regulars')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                  activeTab === 'regulars'
                    ? 'bg-forest text-white border-b-2 border-forest'
                    : 'bg-white text-forest hover:bg-gray-50'
                }`}
              >
                <Repeat className="h-5 w-5" />
                <span className="hidden sm:inline">Regulars</span>
                {regularProducts.length > 0 && (
                  <Badge variant={activeTab === 'regulars' ? 'info' : 'outline'} size="sm">
                    {regularProducts.length}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab('favourites')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                  activeTab === 'favourites'
                    ? 'bg-forest text-white border-b-2 border-forest'
                    : 'bg-white text-forest hover:bg-gray-50'
                }`}
              >
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">Favourites</span>
                {favouriteProducts.length > 0 && (
                  <Badge variant={activeTab === 'favourites' ? 'info' : 'outline'} size="sm">
                    {favouriteProducts.length}
                  </Badge>
                )}
              </button>
              <button
                onClick={() => setActiveTab('previously-purchased')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-medium transition-all ${
                  activeTab === 'previously-purchased'
                    ? 'bg-forest text-white border-b-2 border-forest'
                    : 'bg-white text-forest hover:bg-gray-50'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="hidden sm:inline">Previously Purchased</span>
                {previouslyPurchasedProducts.length > 0 && (
                  <Badge variant={activeTab === 'previously-purchased' ? 'info' : 'outline'} size="sm">
                    {previouslyPurchasedProducts.length}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Regulars Tab */}
          {activeTab === 'regulars' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Regulars</h1>
                <p className="text-gray-600">Items you buy regularly</p>
                {regularProducts.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {regularProducts.length} item{regularProducts.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {regularProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <Repeat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Regulars Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Products you buy 2 or more times will appear here
                  </p>
                  <Link href="/">
                    <Button>Start Shopping</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {regularProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favourites Tab */}
          {activeTab === 'favourites' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Favourites</h1>
                <p className="text-gray-600">Products you&apos;ve marked as favourites</p>
                {favouriteProducts.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {favouriteProducts.length} item{favouriteProducts.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {favouriteProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Favourites Yet</h3>
                  <p className="text-gray-500 mb-6">
                    Tap the heart icon on any product to add it to your favourites
                  </p>
                  <Link href="/">
                    <Button>Browse Products</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {favouriteProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Previously Purchased Tab */}
          {activeTab === 'previously-purchased' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Previously Purchased</h1>
                <p className="text-gray-600">Products you&apos;ve purchased before</p>
                {previouslyPurchasedProducts.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {previouslyPurchasedProducts.length} item{previouslyPurchasedProducts.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {previouslyPurchasedProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Previous Purchases</h3>
                  <p className="text-gray-500 mb-6">
                    Products you&apos;ve bought will appear here for easy reordering
                  </p>
                  <Link href="/">
                    <Button>Start Shopping</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previouslyPurchasedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Orders - Always visible at bottom */}
          <div className="mt-12">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-terracotta" />
                  <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link href="/">
                    <Button variant="outline">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{order.storeName}</p>
                          <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                        </div>
                        <Badge className={ORDER_STATUS_COLORS[order.status]}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="font-semibold text-terracotta">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Menu Items */}
          <div className="mt-12">
            <Card className="divide-y divide-gray-100">
              {menuItems.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-gray-900">{label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              ))}
            </Card>
          </div>

          {/* Sign Out */}
          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
