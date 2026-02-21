'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Package, ChevronDown, ChevronUp, Phone, MapPin, Clock, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import { OrderStatus } from '@/types'

const statusOptions: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled']

export default function VendorOrdersPage() {
  const { user } = useAuthStore()
  const fetchOrders = useOrderStore((state) => state.fetchOrders)
  const orders = useOrderStore((state) =>
    user?.vendorId ? state.getOrdersByVendor(user.vendorId) : []
  )
  const updateOrderStatus = useOrderStore((state) => state.updateOrderStatus)

  // Fetch orders from MongoDB on mount
  useEffect(() => {
    if (user?.vendorId) {
      fetchOrders({ vendorId: user.vendorId })
    }
  }, [user?.vendorId, fetchOrders])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus)
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed']
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) return null
    return statusFlow[currentIndex + 1]
  }

  return (
    <div className="p-4 lg:p-8">
      <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5 text-primary" />
      </Link>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by order ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-cream focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Orders will appear here when customers place them'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id
            const nextStatus = getNextStatus(order.status)

            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-mono font-bold text-gray-900 truncate">{order.id}</span>
                        <Badge className={ORDER_STATUS_COLORS[order.status]} style={{ flexShrink: 0 }}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                        <Badge variant={order.orderType === 'delivery' ? 'info' : 'outline'} size="sm" style={{ flexShrink: 0 }}>
                          {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{order.customerName}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(order.createdAt)}
                        </span>
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-xl font-bold text-primary whitespace-nowrap">{formatPrice(order.total)}</p>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400 mt-2 ml-auto" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 mt-2 ml-auto" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
                        <div className="space-y-2 text-sm">
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {order.customerPhone}
                          </p>
                          {order.orderType === 'delivery' && order.deliveryAddress && (
                            <p className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                              {order.deliveryAddress}
                            </p>
                          )}
                          {order.notes && (
                            <div className="mt-3 p-3 bg-cream rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Notes:</p>
                              <p className="text-gray-700">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.productId}
                              className="flex items-center justify-between text-sm bg-cream p-2 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-gray-500">
                                  {item.quantity} x {formatPrice(item.unitPrice)}
                                </p>
                              </div>
                              <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                            </div>
                          ))}
                          <div className="border-t border-gray-200 pt-2 mt-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Subtotal</span>
                              <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Delivery</span>
                              <span>{formatPrice(order.deliveryFee)}</span>
                            </div>
                            <div className="flex justify-between font-medium mt-1">
                              <span>Total</span>
                              <span className="text-primary">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
                        {nextStatus && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(order.id, nextStatus)
                            }}
                          >
                            Mark as {ORDER_STATUS_LABELS[nextStatus]}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(order.id, 'cancelled')
                          }}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
