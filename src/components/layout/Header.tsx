'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBasket, ShoppingCart, User, Search, LogOut, X, MapPin, Package } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductStore } from '@/stores/productStore'
import { stores } from '@/data/stores'
import { Button } from '@/components/ui/button'
import { Product, StoreLocation } from '@/types'

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items, openCart } = useCartStore()
  const products = useProductStore((state) => state.products)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<{
    products: Product[]
    stores: StoreLocation[]
  }>({ products: [], stores: [] })
  const searchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ products: [], stores: [] })
      return
    }

    const query = searchQuery.toLowerCase()

    // Search products
    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
      .slice(0, 5)

    // Search stores
    const matchedStores = stores
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.address.toLowerCase().includes(query) ||
          s.city.toLowerCase().includes(query) ||
          s.postcode.toLowerCase().includes(query)
      )
      .slice(0, 3)

    setSearchResults({ products: matchedProducts, stores: matchedStores })
  }, [searchQuery, products])

  // Handle navigation after overlay closes
  useEffect(() => {
    if (pendingNavigation && !isMobileSearchOpen) {
      // Overlay has closed, now navigate
      router.push(pendingNavigation)
      setPendingNavigation(null)
    }
  }, [pendingNavigation, isMobileSearchOpen, router])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSelect = (type: 'product' | 'store', id: string) => {
    // Determine navigation path
    const path = type === 'product' ? `/products/${id}` : `/stores/${id}`
    
    // If mobile overlay is open, close it first and queue navigation
    if (isMobileSearchOpen) {
      setPendingNavigation(path)
      setIsMobileSearchOpen(false)
      // Clear search state
      setSearchQuery('')
      setIsSearchOpen(false)
      setSearchResults({ products: [], stores: [] })
    } else {
      // Desktop: navigate immediately
      setSearchQuery('')
      setIsSearchOpen(false)
      setSearchResults({ products: [], stores: [] })
      router.push(path)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const query = searchQuery.trim()
      const path = `/search?q=${encodeURIComponent(query)}`
      
      // If mobile overlay is open, close it first and queue navigation
      if (isMobileSearchOpen) {
        setPendingNavigation(path)
        setIsMobileSearchOpen(false)
        setIsSearchOpen(false)
      } else {
        // Desktop: navigate immediately
        setIsSearchOpen(false)
        router.push(path)
      }
    }
  }

  const hasResults = searchResults.products.length > 0 || searchResults.stores.length > 0

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-terracotta rounded-xl flex items-center justify-center">
              <ShoppingBasket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">WurldBasket</span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full">
              <form onSubmit={handleSearchSubmit}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products or stores..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setIsSearchOpen(true)
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults({ products: [], stores: [] })
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </form>

              {/* Search Results Dropdown */}
              {isSearchOpen && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto">
                  {!hasResults ? (
                    <div className="p-4 text-center text-gray-500">
                      No results found for &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    <>
                      {/* Products */}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Products
                          </div>
                          {searchResults.products.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSearchSelect('product', product.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{product.name}</p>
                                <p className="text-sm text-terracotta">£{product.price.toFixed(2)}</p>
                              </div>
                              <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Stores */}
                      {searchResults.stores.length > 0 && (
                        <div>
                          <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Stores
                          </div>
                          {searchResults.stores.map((store) => (
                            <button
                              key={store.id}
                              onClick={() => handleSearchSelect('store', store.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={store.image}
                                  alt={store.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{store.name}</p>
                                <p className="text-sm text-gray-500 truncate">{store.address}</p>
                              </div>
                              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* View All Results */}
                      <button
                        onClick={handleSearchSubmit}
                        className="w-full px-4 py-3 bg-gray-50 text-terracotta font-medium hover:bg-gray-100 transition-colors text-center border-t border-gray-100"
                      >
                        View all results for &ldquo;{searchQuery}&rdquo;
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="Search"
          >
            <Search className="h-6 w-6 text-gray-700" />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {user?.role === 'customer' && (
                  <Link href="/account">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Account
                    </Button>
                  </Link>
                )}
                {user?.role === 'vendor' && (
                  <Link href="/dashboard">
                    <Button variant="secondary" size="sm">Dashboard</Button>
                  </Link>
                )}
                <span className="text-sm text-gray-600">Hi, {user?.name.split(' ')[0]}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button variant="primary" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="p-4 border-b border-gray-200" ref={mobileSearchRef}>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <form onSubmit={handleSearchSubmit}>
                  <input
                    type="text"
                    placeholder="Search products or stores..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsSearchOpen(true)
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    autoFocus
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setSearchResults({ products: [], stores: [] })
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </form>
              </div>
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false)
                  setSearchQuery('')
                  setIsSearchOpen(false)
                }}
                className="px-4 py-2 text-gray-600 font-medium"
              >
                Cancel
              </button>
            </div>

            {/* Mobile Search Results */}
            {isSearchOpen && searchQuery.length >= 2 && (
              <div className="max-h-[calc(100vh-120px)] overflow-y-auto">
                {!hasResults ? (
                  <div className="p-4 text-center text-gray-500">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <>
                    {/* Products */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Products
                        </div>
                        {searchResults.products.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleSearchSelect('product', product.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-sm text-terracotta">£{product.price.toFixed(2)}</p>
                            </div>
                            <Package className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Stores */}
                    {searchResults.stores.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Stores
                        </div>
                        {searchResults.stores.map((store) => (
                          <button
                            key={store.id}
                            onClick={() => handleSearchSelect('store', store.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100"
                          >
                            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={store.image}
                                alt={store.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{store.name}</p>
                              <p className="text-sm text-gray-500 truncate">{store.address}</p>
                            </div>
                            <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* View All Results */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleSearchSubmit(e)
                      }}
                      className="w-full px-4 py-4 bg-gray-50 text-terracotta font-medium hover:bg-gray-100 transition-colors text-center border-t border-gray-200"
                    >
                      View all results for &ldquo;{searchQuery}&rdquo;
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
