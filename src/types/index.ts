// User Types
export type UserRole = 'customer' | 'vendor'

export interface User {
  id: string
  username: string
  password: string // For demo only - never store plain passwords in production!
  role: UserRole
  name: string
  email?: string
  vendorId?: string // Links vendor user to their vendor profile
  createdAt: string
}

export interface Vendor {
  id: string
  name: string
  slug: string
  description: string
  logo?: string
  storeIds: string[]
  contactEmail: string
  contactPhone: string
}

// Store Types
export interface StoreLocation {
  id: string
  vendorId: string
  name: string
  address: string
  city: string
  postcode: string
  coordinates: {
    lat: number
    lng: number
  }
  openingHours: {
    [day: string]: { open: string; close: string } | 'closed'
  }
  isActive: boolean
  image?: string
}

// Product Types
export type ProductCategory =
  | 'grains-rice'
  | 'spices'
  | 'frozen'
  | 'fresh-produce'
  | 'snacks'
  | 'beverages'

export interface Product {
  id: string
  vendorId: string
  storeId: string
  name: string
  description: string
  category: ProductCategory
  price: number
  unit: string
  image: string
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: ProductCategory
  name: string
  slug: string
  icon: string
  description: string
  image: string
}

// Cart Types
export interface CartItem {
  productId: string
  storeId: string
  vendorId: string
  name: string
  price: number
  unit: string
  image: string
  quantity: number
  stock: number
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'

export type OrderType = 'delivery' | 'pickup'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  unit: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  vendorId: string
  storeId: string
  storeName: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  orderType: OrderType
  deliveryAddress?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Analytics Types
export interface VendorAnalytics {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  recentOrders: Order[]
}
