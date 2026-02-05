import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Order, OrderStatus, CartItem, OrderItem } from '@/types'

interface OrderState {
  orders: Order[]
  isLoading: boolean
  fetchOrders: (params?: { customerId?: string; vendorId?: string; storeId?: string }) => Promise<void>
  createOrder: (
    items: CartItem[],
    customerId: string,
    customerName: string,
    customerPhone: string,
    orderType: 'delivery' | 'pickup',
    deliveryAddress?: string,
    notes?: string
  ) => Promise<Order | null>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  getOrderById: (orderId: string) => Order | undefined
  getOrdersByVendor: (vendorId: string) => Order[]
  getOrdersByCustomer: (customerId: string) => Order[]
  getOrdersByStore: (storeId: string) => Order[]
  getRecentOrders: (vendorId: string, limit?: number) => Order[]
  getTotalRevenue: (vendorId: string) => number
  getPendingOrdersCount: (vendorId: string) => number
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,

      fetchOrders: async (params) => {
        set({ isLoading: true })
        try {
          const searchParams = new URLSearchParams()
          if (params?.customerId) searchParams.set('customerId', params.customerId)
          if (params?.vendorId) searchParams.set('vendorId', params.vendorId)
          if (params?.storeId) searchParams.set('storeId', params.storeId)

          const url = `/api/orders${searchParams.toString() ? `?${searchParams}` : ''}`
          const response = await fetch(url)
          const data = await response.json()

          if (response.ok) {
            const fetchedOrders = data.orders || []
            // Merge fetched orders with existing orders (update existing, add new)
            set((state) => {
              const fetchedIds = new Set(fetchedOrders.map((o: Order) => o.id))
              // Keep existing orders that weren't part of this fetch (different user's orders)
              const existingOtherOrders = state.orders.filter((o) => !fetchedIds.has(o.id))
              // Combine: fetched orders take priority (they're fresher)
              return {
                orders: [...fetchedOrders, ...existingOtherOrders.filter((o) => {
                  // Also filter out orders that belong to the same customer/vendor being fetched
                  if (params?.customerId && o.customerId === params.customerId) return false
                  if (params?.vendorId && o.vendorId === params.vendorId) return false
                  return true
                })],
                isLoading: false,
              }
            })
          } else {
            set({ isLoading: false })
          }
        } catch {
          set({ isLoading: false })
        }
      },

      createOrder: async (items, customerId, customerName, customerPhone, orderType, deliveryAddress, notes) => {
        const firstItem = items[0]
        if (!firstItem) return null

        const orderItems: OrderItem[] = items.map((item) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          unit: item.unit,
        }))

        const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0)
        const deliveryFee = orderType === 'delivery' ? 3.99 : 0

        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerId,
              customerName,
              customerPhone,
              vendorId: firstItem.vendorId,
              storeId: firstItem.storeId,
              items: orderItems,
              subtotal,
              deliveryFee,
              total: subtotal + deliveryFee,
              orderType,
              deliveryAddress,
              notes,
            }),
          })

          const data = await response.json()

          if (response.ok) {
            const newOrder = data.order
            set((state) => ({
              orders: [newOrder, ...state.orders],
            }))
            return newOrder
          }
          return null
        } catch {
          return null
        }
      },

      updateOrderStatus: async (orderId, status) => {
        const originalOrders = get().orders
        // Optimistically update
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, updatedAt: new Date().toISOString() }
              : o
          ),
        }))

        try {
          const response = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status }),
          })

          if (!response.ok) {
            // Revert on error
            set({ orders: originalOrders })
          }
        } catch {
          // Revert on error
          set({ orders: originalOrders })
        }
      },

      getOrderById: (orderId) => {
        return get().orders.find((o) => o.id === orderId)
      },

      getOrdersByVendor: (vendorId) => {
        return get().orders.filter((o) => o.vendorId === vendorId)
      },

      getOrdersByCustomer: (customerId) => {
        return get().orders.filter((o) => o.customerId === customerId)
      },

      getOrdersByStore: (storeId) => {
        return get().orders.filter((o) => o.storeId === storeId)
      },

      getRecentOrders: (vendorId, limit = 5) => {
        return get()
          .orders.filter((o) => o.vendorId === vendorId)
          .slice(0, limit)
      },

      getTotalRevenue: (vendorId) => {
        return get()
          .orders.filter((o) => o.vendorId === vendorId && o.status === 'completed')
          .reduce((sum, o) => sum + o.total, 0)
      },

      getPendingOrdersCount: (vendorId) => {
        return get().orders.filter(
          (o) => o.vendorId === vendorId && (o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing')
        ).length
      },
    }),
    {
      name: 'wurldbasket-orders',
    }
  )
)
