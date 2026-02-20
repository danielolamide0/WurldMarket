import { Category, ProductCategory, Cuisine } from '@/types'

export const APP_NAME = 'WurldBasket'
export const APP_DESCRIPTION = 'Your Global Food Marketplace'

export const CATEGORIES: Category[] = [
  {
    id: 'fresh-produce',
    name: 'Fresh Produce',
    slug: 'fresh-produce',
    icon: 'Leaf',
    description: 'Fresh fruits, vegetables, and plantains',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
  },
  {
    id: 'tubers-roots',
    name: 'Tubers & Roots',
    slug: 'tubers-roots',
    icon: 'Carrot',
    description: 'Yams, cassava, sweet potatoes, and more',
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400',
  },
  {
    id: 'fresh-vegetables',
    name: 'Fresh Vegetables',
    slug: 'fresh-vegetables',
    icon: 'Salad',
    description: 'Fresh leafy greens and vegetables',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  },
  {
    id: 'fresh-fruits',
    name: 'Fresh Fruits',
    slug: 'fresh-fruits',
    icon: 'Apple',
    description: 'Tropical and seasonal fruits',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
  },
  {
    id: 'fresh-meat',
    name: 'Fresh Meat',
    slug: 'fresh-meat',
    icon: 'Beef',
    description: 'Fresh beef, goat, chicken, and more',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400',
  },
  {
    id: 'fresh-fish-seafood',
    name: 'Fresh Fish & Seafood',
    slug: 'fresh-fish-seafood',
    icon: 'Fish',
    description: 'Fresh fish, prawns, and seafood',
    image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400',
  },
  {
    id: 'smoked-dried-fish-meat',
    name: 'Smoked & Dried Fish/Meat',
    slug: 'smoked-dried-fish-meat',
    icon: 'Flame',
    description: 'Stockfish, dried prawns, smoked fish',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  },
  {
    id: 'frozen-foods',
    name: 'Frozen Foods',
    slug: 'frozen-foods',
    icon: 'Snowflake',
    description: 'Frozen fish, meat, and vegetables',
    image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
  },
  {
    id: 'rice-grains',
    name: 'Rice & Grains',
    slug: 'rice-grains',
    icon: 'Wheat',
    description: 'Rice, garri, semolina, couscous, and more',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  },
  {
    id: 'flour-meal',
    name: 'Flour & Meal',
    slug: 'flour-meal',
    icon: 'WheatOff',
    description: 'Cassava flour, yam flour, cornmeal',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
  },
  {
    id: 'beans-lentils-pulses',
    name: 'Beans, Lentils & Pulses',
    slug: 'beans-lentils-pulses',
    icon: 'Bean',
    description: 'Black-eyed peas, lentils, chickpeas',
    image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400',
  },
  {
    id: 'spices-seasonings',
    name: 'Spices & Seasonings',
    slug: 'spices-seasonings',
    icon: 'Sparkles',
    description: 'Traditional spices and seasonings',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
  },
  {
    id: 'sauces-pastes',
    name: 'Sauces & Pastes',
    slug: 'sauces-pastes',
    icon: 'Droplets',
    description: 'Tomato paste, palm oil, groundnut paste',
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400',
  },
  {
    id: 'cooking-oils-fats',
    name: 'Cooking Oils & Fats',
    slug: 'cooking-oils-fats',
    icon: 'Droplet',
    description: 'Palm oil, groundnut oil, shea butter',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
  },
  {
    id: 'noodles-pasta',
    name: 'Noodles & Pasta',
    slug: 'noodles-pasta',
    icon: 'Utensils',
    description: 'Instant noodles, spaghetti, macaroni',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400',
  },
  {
    id: 'ready-to-cook-foods',
    name: 'Ready-to-Cook Foods',
    slug: 'ready-to-cook-foods',
    icon: 'ChefHat',
    description: 'Pre-made meals and quick-cook items',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
  },
  {
    id: 'packaged-canned-foods',
    name: 'Packaged & Canned Foods',
    slug: 'packaged-canned-foods',
    icon: 'Package',
    description: 'Canned tomatoes, sardines, corned beef',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400',
  },
  {
    id: 'snacks-sweets',
    name: 'Snacks & Sweets',
    slug: 'snacks-sweets',
    icon: 'Cookie',
    description: 'Chin chin, puff puff, biscuits, and treats',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
  },
  {
    id: 'drinks-beverages',
    name: 'Drinks & Beverages',
    slug: 'drinks-beverages',
    icon: 'Coffee',
    description: 'Malt drinks, palm wine, juices, and sodas',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  },
  {
    id: 'dairy-eggs',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    icon: 'Egg',
    description: 'Milk, eggs, cheese, and butter',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
  },
  {
    id: 'household-essentials',
    name: 'Household Essentials',
    slug: 'household-essentials',
    icon: 'Home',
    description: 'Cleaning supplies and household items',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
  },
]

// Cuisine options for "Find Your Flavour"
export interface CuisineOption {
  id: Cuisine
  name: string
  slug: string
  description: string
  image: string
}

export const CUISINES: CuisineOption[] = [
  {
    id: 'african',
    name: 'African',
    slug: 'african',
    description: 'West African, East African, and North African cuisines',
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400',
  },
  {
    id: 'caribbean',
    name: 'Caribbean',
    slug: 'caribbean',
    description: 'Jamaican, Trinidadian, and island cuisines',
    image: 'https://images.unsplash.com/photo-1593759608136-45eb2ad9507d?w=400',
  },
  {
    id: 'south-asian',
    name: 'South Asian',
    slug: 'south-asian',
    description: 'Indian, Pakistani, Bangladeshi, and Sri Lankan cuisines',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
  },
  {
    id: 'east-asian',
    name: 'East Asian',
    slug: 'east-asian',
    description: 'Chinese, Japanese, Korean, and Vietnamese cuisines',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
  },
  {
    id: 'middle-eastern',
    name: 'Middle Eastern',
    slug: 'middle-eastern',
    description: 'Lebanese, Turkish, Persian, and Arab cuisines',
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
  },
  {
    id: 'eastern-european',
    name: 'Eastern European',
    slug: 'eastern-european',
    description: 'Polish, Russian, Ukrainian, and Balkan cuisines',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
  },
]

export const CUISINE_MAP: Record<Cuisine, string> = {
  'african': 'African',
  'caribbean': 'Caribbean',
  'south-asian': 'South Asian',
  'east-asian': 'East Asian',
  'middle-eastern': 'Middle Eastern',
  'eastern-european': 'Eastern European',
}

export const CATEGORY_MAP: Record<ProductCategory, string> = {
  'fresh-produce': 'Fresh Produce',
  'tubers-roots': 'Tubers & Roots',
  'fresh-vegetables': 'Fresh Vegetables',
  'fresh-fruits': 'Fresh Fruits',
  'fresh-meat': 'Fresh Meat',
  'fresh-fish-seafood': 'Fresh Fish & Seafood',
  'smoked-dried-fish-meat': 'Smoked & Dried Fish/Meat',
  'frozen-foods': 'Frozen Foods',
  'rice-grains': 'Rice & Grains',
  'flour-meal': 'Flour & Meal',
  'beans-lentils-pulses': 'Beans, Lentils & Pulses',
  'spices-seasonings': 'Spices & Seasonings',
  'sauces-pastes': 'Sauces & Pastes',
  'cooking-oils-fats': 'Cooking Oils & Fats',
  'noodles-pasta': 'Noodles & Pasta',
  'ready-to-cook-foods': 'Ready-to-Cook Foods',
  'packaged-canned-foods': 'Packaged & Canned Foods',
  'snacks-sweets': 'Snacks & Sweets',
  'drinks-beverages': 'Drinks & Beverages',
  'dairy-eggs': 'Dairy & Eggs',
  'household-essentials': 'Household Essentials',
  // Legacy mappings for backward compatibility
  'grains-rice': 'Rice & Grains',
  'spices': 'Spices & Seasonings',
  'frozen': 'Frozen Foods',
  'snacks': 'Snacks & Sweets',
  'beverages': 'Drinks & Beverages',
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
