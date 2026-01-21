import { User, Vendor } from '@/types'

export const users: User[] = [
  {
    id: 'cust-001',
    username: 'customer',
    password: 'customer',
    role: 'customer',
    name: 'John Customer',
    email: 'customer@example.com',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'vendor-001',
    username: 'abubakr',
    password: 'abubakr',
    role: 'vendor',
    name: 'Abu Bakr Admin',
    email: 'admin@abubakr.com',
    vendorId: 'abubakr-stores',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'vendor-002',
    username: 'sunday',
    password: 'sunday',
    role: 'vendor',
    name: 'Sunday Admin',
    email: 'admin@sunnyday.com',
    vendorId: 'sunnyday-foods',
    createdAt: '2024-01-01T00:00:00Z',
  },
]

export const vendors: Vendor[] = [
  {
    id: 'abubakr-stores',
    name: 'Abu Bakr Supermarket',
    slug: 'abu-bakr',
    description: 'Authentic African and Asian groceries serving Leeds since 2005. Fresh produce, spices, and frozen goods.',
    logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200',
    storeIds: ['store-ab-kirkstall', 'store-ab-queens'],
    contactEmail: 'info@abubakr.com',
    contactPhone: '+44 113 123 4567',
  },
  {
    id: 'sunnyday-foods',
    name: 'Sunnyday International Foods',
    slug: 'sunnyday',
    description: 'Your one-stop shop for African, Caribbean, and Asian groceries in Southampton.',
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200',
    storeIds: ['store-sunnyday'],
    contactEmail: 'info@sunnyday.com',
    contactPhone: '+44 23 8012 3456',
  },
]
