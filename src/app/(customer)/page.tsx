'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { MapPin, ArrowRight, Star, Clock, Truck, ShoppingBasket, ClipboardList, Package, ChevronRight, Heart } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { useOrderStore } from '@/stores/orderStore'
import { useAuthStore } from '@/stores/authStore'
import { useCustomerStore } from '@/stores/customerStore'
import { useVendorStore } from '@/stores/vendorStore'
import { ProductCard } from '@/components/products/ProductCard'
import { CategoryNav } from '@/components/products/CategoryNav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'

export default function HomePage() {
  const products = useProductStore((state) => state.products)
  const featuredProducts = products.filter((p) => p.isActive).slice(0, 8)
  const { user, isAuthenticated } = useAuthStore()
  const { getOrdersByCustomer } = useOrderStore()
  const { favourites, getRegulars, userId, setUserId, fetchCustomerData } = useCustomerStore()
  const stores = useVendorStore((state) => state.stores)
  const vendors = useVendorStore((state) => state.vendors)

  // Sync customerStore when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role === 'customer') {
      // If userId changed, clear old data and fetch new user's data
      if (userId !== user.id) {
        setUserId(user.id)
        fetchCustomerData(user.id)
      } else if (userId === user.id) {
        // Same user, just ensure data is fresh
        fetchCustomerData(user.id)
      }
    } else if (!isAuthenticated) {
      // User logged out, clear customer data
      setUserId(null)
    }
  }, [isAuthenticated, user?.id, userId, setUserId, fetchCustomerData])

  const customerOrders = user ? getOrdersByCustomer(user.id) : []
  const mostRecentOrder = customerOrders[0]
  const regularsCount = getRegulars().length
  const favouritesCount = favourites.length

  // Show personalized homepage for signed-in customers
  if (isAuthenticated && user?.role === 'customer') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-forest to-forest-dark">
        {/* Personalized Header */}
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            Hi {user.name.split(' ')[0]}
          </h1>
          <p className="text-white/70 text-sm">Welcome back to WurldBasket</p>
        </div>

        {/* Content Cards */}
        <div className="px-4 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Most Recent Order */}
            {mostRecentOrder ? (
              <Card className="overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Most Recent Order</span>
                    <Badge className={ORDER_STATUS_COLORS[mostRecentOrder.status]} size="sm">
                      {ORDER_STATUS_LABELS[mostRecentOrder.status]}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{mostRecentOrder.id}</p>
                      <p className="text-sm text-gray-500">{mostRecentOrder.storeName}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatPrice(mostRecentOrder.total)}</p>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {mostRecentOrder.items.length} item{mostRecentOrder.items.length !== 1 ? 's' : ''} • {formatDate(mostRecentOrder.createdAt)}
                  </p>
                  <Link href={`/orders/${mostRecentOrder.id}`}>
                    <Button variant="outline" className="w-full text-forest border-forest hover:bg-forest hover:text-white">
                      View order
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">No orders yet</p>
                    <p className="text-sm text-gray-500">Start shopping to see your orders here</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Your Regulars */}
            <Card className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-forest/10 rounded-xl flex items-center justify-center">
                    <ShoppingBasket className="h-6 w-6 text-forest" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Your regulars</p>
                    <p className="text-sm text-gray-500">Your one stop shopping list</p>
                  </div>
                  {regularsCount > 0 && (
                    <Badge variant="outline">{regularsCount} items</Badge>
                  )}
                </div>
                <Link href="/regulars">
                  <Button className="w-full bg-forest hover:bg-forest-dark">
                    Shop regulars
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Favourites */}
            <Card className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Your favourites</p>
                    <p className="text-sm text-gray-500">Items you have saved</p>
                  </div>
                  {favouritesCount > 0 && (
                    <Badge variant="outline">{favouritesCount} items</Badge>
                  )}
                </div>
                <Link href="/regulars?tab=favourites">
                  <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary hover:text-white">
                    View favourites
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Manage Orders */}
            <Card className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Manage your orders</p>
                    <p className="text-sm text-gray-500">View and track your orders</p>
                  </div>
                  {customerOrders.length > 0 && (
                    <Badge variant="outline">{customerOrders.length} orders</Badge>
                  )}
                </div>
                <Link href="/orders">
                  <Button variant="outline" className="w-full">
                    View orders
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Quick Shop Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Quick Shop</h2>
              <Link href="/stores" className="text-white/80 text-sm flex items-center gap-1 hover:text-white">
                All stores <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {stores.map((store) => (
                <Link key={store.id} href={`/stores/${store.id}`} className="flex-shrink-0">
                  <Card className="w-40 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-20 bg-gray-100">
                      <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-gray-900 text-sm truncate">{store.name}</p>
                      <p className="text-xs text-gray-500">{store.city}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <h2 className="text-lg font-bold text-white mb-4">Shop by Category</h2>
            <div className="bg-white rounded-2xl p-4">
              <CategoryNav />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default homepage for guests
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <Badge className="bg-primary text-white mb-4">Now Serving Leeds & Southampton</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Flavours of the World,<br />Delivered to You
            </h1>
            <p className="text-lg text-gray-200 mb-8">
              Shop authentic international groceries from local stores near you. Fresh produce, traditional spices, and all your favourite foods from around the globe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/stores">
                <Button size="lg" className="w-full sm:w-auto">
                  <MapPin className="h-5 w-5 mr-2" />
                  Find Stores Near You
                </Button>
              </Link>
              <Link href="/category/grains-rice">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-forest">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Fast Delivery</h3>
                <p className="text-sm text-gray-500">Same day delivery available</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-forest/10 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-forest" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quality Products</h3>
                <p className="text-sm text-gray-500">Fresh from trusted vendors</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Easy Pickup</h3>
                <p className="text-sm text-gray-500">Click & collect option</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          </div>
          <CategoryNav />
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Partner Stores</h2>
            <Link href="/stores" className="text-primary font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stores.map((store) => {
              const vendor = vendors.find((v) => v.id === store.vendorId)
              return (
                <Link key={store.id} href={`/stores/${store.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gray-100 overflow-hidden">
                      <img
                        src={store.image}
                        alt={store.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{store.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{store.address}, {store.city}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-forest">
                          <MapPin className="h-4 w-4" />
                          {store.city}
                        </span>
                        <Badge variant="success" size="sm">Open</Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Products</h2>
            <Link href="/category/grains-rice" className="text-primary font-medium flex items-center gap-1 hover:underline">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Shopping?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of customers enjoying authentic international groceries delivered fresh to their door.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
