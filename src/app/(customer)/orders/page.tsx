'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Package, ChevronRight, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'

export default function CustomerOrdersPage() {
  const { user, isAuthenticated } = useAuthStore()
  const { getOrdersByCustomer, fetchOrders } = useOrderStore()

  // Fetch orders from MongoDB on mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrders({ customerId: user.id })
    }
  }, [isAuthenticated, user?.id, fetchOrders])

  const orders = user ? getOrdersByCustomer(user.id) : []

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pt-8 pb-20">
        <div className="max-w-md mx-auto">
          <Card className="w-full p-8 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view orders</h1>
            <p className="text-gray-500 mb-6">
              View and track your orders by signing in to your account.
            </p>
            <Link href="/login">
              <Button size="lg" className="w-full">Sign In</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">
              When you place an order, it will appear here.
            </p>
            <Link href="/stores">
              <Button>Start Shopping</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-gray-900 truncate">{order.id}</span>
                          <Badge className={ORDER_STATUS_COLORS[order.status]} size="sm" style={{ flexShrink: 0 }}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{order.storeName}</p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-lg font-bold text-primary whitespace-nowrap">{formatPrice(order.total)}</p>
                        <ChevronRight className="h-5 w-5 text-gray-400 mt-2 ml-auto" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
