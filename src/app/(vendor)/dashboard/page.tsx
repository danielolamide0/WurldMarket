'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Circle,
  Rocket,
  Store,
  MapPin,
  FileText,
  Phone,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { useOrderStore } from '@/stores/orderStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import { Vendor } from '@/types'

export default function VendorDashboardPage() {
  const { user } = useAuthStore()
  const { getVendorById, goLive, canGoLive, getStoresByVendor, fetchVendors, fetchStores } = useVendorStore()
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const fetchOrders = useOrderStore((state) => state.fetchOrders)
  const [vendor, setVendor] = useState<Vendor | undefined>(undefined)
  const [isGoingLive, setIsGoingLive] = useState(false)

  // Fetch data on mount
  useEffect(() => {
    if (user?.vendorId) {
      fetchVendors()
      fetchStores(user.vendorId)
      fetchProducts({ vendorId: user.vendorId })
      fetchOrders({ vendorId: user.vendorId })
    }
  }, [user?.vendorId, fetchVendors, fetchStores, fetchProducts, fetchOrders])

  // Get vendor from store
  useEffect(() => {
    if (user?.vendorId) {
      const v = getVendorById(user.vendorId)
      setVendor(v)
    }
  }, [user?.vendorId, getVendorById])

  const products = useProductStore((state) =>
    user?.vendorId ? state.getProductsByVendor(user.vendorId) : []
  )
  const lowStockProducts = useProductStore((state) =>
    user?.vendorId ? state.getLowStockProducts(user.vendorId, 10) : []
  )
  const orders = useOrderStore((state) =>
    user?.vendorId ? state.getOrdersByVendor(user.vendorId) : []
  )
  const totalRevenue = useOrderStore((state) =>
    user?.vendorId ? state.getTotalRevenue(user.vendorId) : 0
  )
  const pendingOrdersCount = useOrderStore((state) =>
    user?.vendorId ? state.getPendingOrdersCount(user.vendorId) : 0
  )

  const recentOrders = orders.slice(0, 5)
  const vendorStores = user?.vendorId ? getStoresByVendor(user.vendorId) : []

  // Check if vendor can go live
  const liveStatus = user?.vendorId ? canGoLive(user.vendorId) : { canGoLive: false, missing: [] }

  // Onboarding checklist items
  const onboardingSteps = [
    {
      id: 'description',
      label: 'Add business description',
      completed: !!vendor?.description,
      href: '/my-stores',
      icon: FileText,
    },
    {
      id: 'phone',
      label: 'Add contact phone number',
      completed: !!vendor?.contactPhone,
      href: '/my-stores',
      icon: Phone,
    },
    {
      id: 'store',
      label: 'Add at least one store location',
      completed: vendorStores.length > 0,
      href: '/my-stores',
      icon: MapPin,
    },
    {
      id: 'product',
      label: 'Add at least one product',
      completed: products.length > 0,
      href: '/inventory/add',
      icon: Package,
    },
  ]

  const completedSteps = onboardingSteps.filter((s) => s.completed).length
  const isOnboardingComplete = completedSteps === onboardingSteps.length
  const isLive = vendor?.isLive ?? false

  const handleGoLive = async () => {
    if (!user?.vendorId) return
    setIsGoingLive(true)

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const success = await goLive(user.vendorId)
    if (success) {
      // Update local vendor state
      setVendor((prev) => prev ? { ...prev, isLive: true } : prev)
    }

    setIsGoingLive(false)
  }

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-blue-50 text-blue-600',
      href: '/inventory',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-green-50 text-green-600',
      href: '/vendor/orders',
    },
    {
      label: 'Revenue',
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-primary/10 text-primary',
      href: '/vendor/orders',
    },
    {
      label: 'Pending Orders',
      value: pendingOrdersCount,
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-600',
      href: '/vendor/orders',
    },
  ]

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">
              {isLive
                ? `Here's what's happening with ${vendor?.name} today.`
                : `Let's get ${vendor?.name || 'your store'} ready to go live!`}
            </p>
          </div>
          {isLive && (
            <Badge className="bg-green-100 text-green-700">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live
            </Badge>
          )}
        </div>
      </div>

      {/* Onboarding Section - Only show if not live */}
      {!isLive && (
        <Card className="mb-8 border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Get Your Store Ready
                </h2>
                <p className="text-gray-600 text-sm">
                  Complete the steps below to make your store visible to customers.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{completedSteps}/{onboardingSteps.length}</p>
                <p className="text-xs text-gray-500">completed</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps / onboardingSteps.length) * 100}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-3 mb-6">
              {onboardingSteps.map((step) => (
                <Link
                  key={step.id}
                  href={step.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    step.completed
                      ? 'bg-green-50'
                      : 'bg-cream hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                  )}
                  <step.icon className={`h-4 w-4 ${step.completed ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={`flex-1 ${step.completed ? 'text-green-700' : 'text-gray-700'}`}>
                    {step.label}
                  </span>
                  {!step.completed && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </Link>
              ))}
            </div>

            {/* Go Live Button */}
            <Button
              onClick={handleGoLive}
              disabled={!isOnboardingComplete || isGoingLive}
              className="w-full"
              size="lg"
            >
              {isGoingLive ? (
                'Going Live...'
              ) : isOnboardingComplete ? (
                <>
                  <Rocket className="h-5 w-5 mr-2" />
                  Go Live!
                </>
              ) : (
                'Complete all steps to Go Live'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/vendor/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {order.customerName} &bull; {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={ORDER_STATUS_COLORS[order.status]} size="sm">
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      <p className="text-sm font-medium text-primary mt-1">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Low Stock Alert</h2>
            </div>
            <Link href="/inventory" className="text-sm text-primary hover:underline flex items-center gap-1">
              Manage <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">All products well stocked</p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-amber-600">
                        Only {product.stock} left in stock
                      </p>
                    </div>
                    <Link href={`/inventory/${product.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/inventory/add">
              <Button>
                <Package className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </Link>
            <Link href="/vendor/orders">
              <Button variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View All Orders
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
