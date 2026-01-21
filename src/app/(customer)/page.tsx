'use client'

import Link from 'next/link'
import { MapPin, ArrowRight, Star, Clock, Truck } from 'lucide-react'
import { useProductStore } from '@/stores/productStore'
import { stores } from '@/data/stores'
import { vendors } from '@/data/users'
import { CATEGORIES } from '@/lib/constants'
import { ProductCard } from '@/components/products/ProductCard'
import { CategoryNav } from '@/components/products/CategoryNav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const products = useProductStore((state) => state.products)
  const featuredProducts = products.filter((p) => p.isActive).slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-forest-dark via-forest to-forest-light text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <Badge className="bg-terracotta text-white mb-4">Now Serving Leeds & Southampton</Badge>
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
              <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-terracotta" />
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
              <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-terracotta" />
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
            <Link href="/stores" className="text-terracotta font-medium flex items-center gap-1 hover:underline">
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
            <Link href="/category/grains-rice" className="text-terracotta font-medium flex items-center gap-1 hover:underline">
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
      <section className="py-12 bg-terracotta">
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
