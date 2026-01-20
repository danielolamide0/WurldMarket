import { Category, ProductCategory } from '@/types'

export const APP_NAME = 'AfriMart'
export const APP_DESCRIPTION = 'Your African Food Marketplace'

export const CATEGORIES: Category[] = [
  {
    id: 'grains-rice',
    name: 'Grains & Rice',
    slug: 'grains-rice',
    icon: 'Wheat',
    description: 'Rice, garri, semolina, and more',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  },
  {
    id: 'spices',
    name: 'Spices',
    slug: 'spices',
    icon: 'Flame',
    description: 'Traditional African spices and seasonings',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
  },
  {
    id: 'frozen',
    name: 'Frozen',
    slug: 'frozen',
    icon: 'Snowflake',
    description: 'Frozen fish, meat, and vegetables',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
  },
  {
    id: 'fresh-produce',
    name: 'Fresh Produce',
    slug: 'fresh-produce',
    icon: 'Leaf',
    description: 'Fresh fruits, vegetables, and plantains',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
  },
  {
    id: 'snacks',
    name: 'Snacks',
    slug: 'snacks',
    icon: 'Cookie',
    description: 'Chin chin, puff puff, and treats',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
  },
  {
    id: 'beverages',
    name: 'Beverages',
    slug: 'beverages',
    icon: 'Coffee',
    description: 'Malt drinks, palm wine, and juices',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  },
]

export const CATEGORY_MAP: Record<ProductCategory, string> = {
  'grains-rice': 'Grains & Rice',
  'spices': 'Spices',
  'frozen': 'Frozen',
  'fresh-produce': 'Fresh Produce',
  'snacks': 'Snacks',
  'beverages': 'Beverages',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

export const DELIVERY_FEE = 3.99
export const FREE_DELIVERY_THRESHOLD = 30
export const MIN_ORDER_AMOUNT = 10
