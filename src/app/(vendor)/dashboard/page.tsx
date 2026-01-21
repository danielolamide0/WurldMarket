'use client'

import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { useOrderStore } from '@/stores/orderStore'
import { vendors } from '@/data/users'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'

export default function VendorDashboardPage() {
  const { user } = useAuthStore()
  const vendor = vendors.find((v) => v.id === user?.vendorId)

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
      color: 'bg-terracotta/10 text-terracotta',
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">
          Here&apos;s what&apos;s happening with {vendor?.name} today.
        </p>
      </div>

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
            <Link href="/vendor/orders" className="text-sm text-terracotta hover:underline flex items-center gap-1">
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
                      <p className="text-sm font-medium text-terracotta mt-1">
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
            <Link href="/inventory" className="text-sm text-terracotta hover:underline flex items-center gap-1">
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
