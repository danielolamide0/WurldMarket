'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, MapPin, Clock, Phone } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const { isAuthenticated } = useAuthStore()
  const { getOrderById } = useOrderStore()

  const order = getOrderById(orderId)

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-20">
        <Card className="max-w-md w-full p-8 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view order</h1>
          <p className="text-gray-500 mb-6">
            Please sign in to view your order details.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-20">
        <Card className="max-w-md w-full p-8 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-500 mb-6">
            We couldn&apos;t find this order. It may have been removed or the link is incorrect.
          </p>
          <Link href="/orders">
            <Button size="lg" className="w-full">View All Orders</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{order.id}</h1>
              <p className="text-gray-500">{formatDateTime(order.createdAt)}</p>
            </div>
            <Badge className={ORDER_STATUS_COLORS[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Store Info */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Store</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <MapPin className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{order.storeName}</p>
              <p className="text-sm text-gray-500">
                {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
              </p>
            </div>
          </div>
        </Card>

        {/* Delivery Address */}
        {order.orderType === 'delivery' && order.deliveryAddress && (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Delivery Address</h2>
            <p className="text-gray-700">{order.deliveryAddress}</p>
          </Card>
        )}

        {/* Order Items */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-3">
            Order Items ({order.items.length})
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-medium text-gray-900">{formatPrice(item.totalPrice)}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Order Summary */}
        <Card className="p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="text-gray-900">{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
              <span className="text-gray-900">Total</span>
              <span className="text-terracotta">{formatPrice(order.total)}</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Order Notes</h2>
            <p className="text-gray-700">{order.notes}</p>
          </Card>
        )}

        {/* Reorder Button */}
        <Link href={`/stores/${order.storeId}`}>
          <Button className="w-full" size="lg">
            Order Again from {order.storeName}
          </Button>
        </Link>
      </div>
    </div>
  )
}
