import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Order, OrderStatus, CartItem, OrderItem } from '@/types'
import { generateId } from '@/lib/utils'
import { stores } from '@/data/stores'

interface OrderState {
  orders: Order[]
  createOrder: (
    items: CartItem[],
    customerId: string,
    customerName: string,
    customerPhone: string,
    orderType: 'delivery' | 'pickup',
    deliveryAddress?: string,
    notes?: string
  ) => Order
  updateOrderStatus: (orderId: string, status: OrderStatus) => void
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

      createOrder: (items, customerId, customerName, customerPhone, orderType, deliveryAddress, notes) => {
        // Group items by store (for simplicity, we assume all items are from the same store)
        const firstItem = items[0]
        const store = stores.find((s) => s.id === firstItem.storeId)

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

        const order: Order = {
          id: `ORD-${generateId().toUpperCase()}`,
          customerId,
          customerName,
          customerPhone,
          vendorId: firstItem.vendorId,
          storeId: firstItem.storeId,
          storeName: store?.name || 'Unknown Store',
          items: orderItems,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          status: 'pending',
          orderType,
          deliveryAddress,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          orders: [order, ...state.orders],
        }))

        return order
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, updatedAt: new Date().toISOString() }
              : o
          ),
        }))
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
      name: 'afrimart-orders',
    }
  )
)
