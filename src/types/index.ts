// User Types
export type UserRole = 'customer' | 'vendor'

export interface User {
  id: string
  username: string
  password: string // For demo only - never store plain passwords in production!
  role: UserRole
  name: string
  email?: string
  phone?: string // Customer phone number
  vendorId?: string // Links vendor user to their vendor profile
  authMethod?: 'username' | 'email' // How the user authenticates
  isEmailVerified?: boolean // Whether email has been verified
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
  isLive: boolean // Whether the store is visible to customers
  createdAt: string
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
  | 'fresh-produce'
  | 'tubers-roots'
  | 'fresh-vegetables'
  | 'fresh-fruits'
  | 'fresh-meat'
  | 'fresh-fish-seafood'
  | 'smoked-dried-fish-meat'
  | 'frozen-foods'
  | 'rice-grains'
  | 'flour-meal'
  | 'beans-lentils-pulses'
  | 'spices-seasonings'
  | 'sauces-pastes'
  | 'cooking-oils-fats'
  | 'noodles-pasta'
  | 'ready-to-cook-foods'
  | 'packaged-canned-foods'
  | 'snacks-sweets'
  | 'drinks-beverages'
  | 'dairy-eggs'
  | 'household-essentials'
  // Legacy categories for backward compatibility
  | 'grains-rice'
  | 'spices'
  | 'frozen'
  | 'snacks'
  | 'beverages'

export type CuisineType = 'african' | 'caribbean' | 'south-asian' | 'east-asian' | 'middle-eastern' | 'eastern-european'

export interface Product {
  id: string
  vendorId: string
  storeId: string
  name: string
  description: string
  category: ProductCategory
  cuisines?: CuisineType[]
  price: number
  unit: string
  image: string
  stock: number
  isActive: boolean
  isOnOffer?: boolean
  isTrending?: boolean
  originalPrice?: number
  offerEndDate?: string
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

// Address Types
export interface SavedAddress {
  id: string
  userId: string
  label: string // e.g., "Home", "Work", "Other"
  fullAddress: string
  city: string
  postcode: string
  coordinates?: {
    lat: number
    lng: number
  }
  isPrimary: boolean
  createdAt: string
}
