'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Search, LogOut, X, MapPin, Package, Menu, ChevronDown, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { useAddressStore } from '@/stores/addressStore'
import { Button } from '@/components/ui/button'
import { Product, StoreLocation } from '@/types'

// Popular searches for the dropdown
const POPULAR_SEARCHES = [
  'Chicken',
  'Eggs',
  'Milk',
  'Bread',
  'Cheese',
  'Crisps',
  'Carrots',
  'Rice',
  'Plantain',
  'Palm Oil',
]

// Animated placeholder search terms
const SEARCH_TERMS = ['shops?', 'groceries?', 'Butcher?', 'frozen?', 'spices?']

// Animated Placeholder Component
function AnimatedPlaceholder() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      // Start scroll-up animation
      setIsAnimating(true)
      
      // After animation completes, update index and reset
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SEARCH_TERMS.length)
        setIsAnimating(false)
      }, 600) // Animation duration
    }, 2000) // Each word stays for 2 seconds before scrolling

    return () => clearInterval(interval)
  }, [])

  const nextIndex = (currentIndex + 1) % SEARCH_TERMS.length

  return (
    <span className="inline-flex items-center whitespace-nowrap">
      <span className="whitespace-nowrap">Looking for </span>
      <span className="relative inline-block h-[1.5em] min-w-[100px] max-w-[140px] ml-1 overflow-hidden">
        {/* Container that scrolls up - words stacked vertically */}
        <span
          className="absolute left-0 w-full"
          style={{
            transform: isAnimating ? `translateY(-1.5em)` : 'translateY(0)',
            transition: 'transform 600ms ease-in-out',
          }}
        >
          {/* Current word */}
          <span className="block h-[1.5em] leading-[1.5em] whitespace-nowrap">{SEARCH_TERMS[currentIndex]}</span>
          {/* Next word positioned directly below */}
          <span className="block h-[1.5em] leading-[1.5em] whitespace-nowrap">{SEARCH_TERMS[nextIndex]}</span>
        </span>
      </span>
    </span>
  )
}

export function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { items, openCart, setUserId: setCartUserId } = useCartStore()
  const products = useProductStore((state) => state.products)
  const stores = useVendorStore((state) => state.stores)
  const { getAddressesByUser, getPrimaryAddress, setPrimaryAddress, fetchAddresses } = useAddressStore()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    products: Product[]
    stores: StoreLocation[]
  }>({ products: [], stores: [] })
  const desktopSearchRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)
  const addressDropdownRef = useRef<HTMLDivElement>(null)
  const mobileAddressDropdownRef = useRef<HTMLDivElement>(null)

  // Get user's addresses
  const userAddresses = user ? getAddressesByUser(user.id) : []
  const primaryAddress = user ? getPrimaryAddress(user.id) : undefined

  // Fetch addresses when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchAddresses(user.id)
    }
  }, [isAuthenticated, user?.id, fetchAddresses])

  // Sync cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      setCartUserId(user.id)
    }
  }, [isAuthenticated, user?.id, setCartUserId])

  // Close address dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isInsideDesktop = addressDropdownRef.current?.contains(target)
      const isInsideMobile = mobileAddressDropdownRef.current?.contains(target)

      if (!isInsideDesktop && !isInsideMobile) {
        setIsAddressDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddressSelect = (addressId: string) => {
    if (user) {
      setPrimaryAddress(user.id, addressId)
      setIsAddressDropdownOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setCartUserId(null)
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
  }, [searchQuery, products, stores])

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isOutsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(target)
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target)

      // Only close if clicking outside both search areas
      if (isOutsideDesktop && isOutsideMobile) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSelect = (type: 'product' | 'store', id: string) => {
    const path = type === 'product' ? `/products/${id}` : `/stores/${id}`

    // Clear search state
    setSearchQuery('')
    setIsSearchOpen(false)
    setSearchResults({ products: [], stores: [] })

    // Navigate immediately
    router.push(path)
  }

  const handlePopularSearchClick = (term: string) => {
    setSearchQuery(term)
    const path = `/search?q=${encodeURIComponent(term)}`
    setIsSearchOpen(false)
    router.push(path)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const path = `/search?q=${encodeURIComponent(searchQuery.trim())}`
      setIsSearchOpen(false)
      router.push(path)
    }
  }

  const hasResults = searchResults.products.length > 0 || searchResults.stores.length > 0
  const showPopularSearches = isSearchOpen && searchQuery.length < 2

  // Popular Searches Component
  const PopularSearchesDropdown = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? '' : 'absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg border border-gray-100'} bg-cream overflow-hidden z-50`}>
      <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Popular Searches
      </div>
      <div className="py-2">
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            onClick={() => handlePopularSearchClick(term)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 active:bg-primary/10 transition-colors text-left"
          >
            <Search className="h-4 w-4 text-primary" />
            <span className="text-gray-700 hover:text-primary">{term}</span>
          </button>
        ))}
      </div>
    </div>
  )

  // Search Results Component (shared between mobile and desktop)
  const SearchResultsDropdown = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`${isMobile ? 'border-t border-gray-100' : 'absolute top-full left-0 right-0 mt-2 rounded-xl shadow-lg border border-gray-100'} bg-cream overflow-hidden z-50 max-h-80 overflow-y-auto`}>
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
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} bg-gray-100 rounded-lg overflow-hidden flex-shrink-0`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-primary">£{product.price.toFixed(2)}</p>
                  </div>
                  <Package className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-gray-400 flex-shrink-0`} />
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
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                >
                  <div className={`${isMobile ? 'w-12 h-12' : 'w-10 h-10'} bg-gray-100 rounded-lg overflow-hidden flex-shrink-0`}>
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
                  <MapPin className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-gray-400 flex-shrink-0`} />
                </button>
              ))}
            </div>
          )}

          {/* View All Results */}
          <button
            onClick={handleSearchSubmit}
            className="w-full px-4 py-3 bg-gray-50 text-primary font-medium hover:bg-gray-100 active:bg-gray-200 transition-colors text-center border-t border-gray-100"
          >
            View all results for &ldquo;{searchQuery}&rdquo;
          </button>
        </>
      )}
    </div>
  )

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Header Row */}
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger (only when signed in) + Logo */}
            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="h-6 w-6 text-gray-700" />
                </button>
              )}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <img
                  src="/WurldBAsketLogo.png"
                  alt="WurldBasket"
                  className="h-10 w-auto olive-tint"
                />
                <img
                  src="/WurldBasketText.png"
                  alt="WurldBasket"
                  className="h-6 w-auto olive-tint"
                />
              </Link>
            </div>

            {/* Right: Cart (signed in) or Sign In button (signed out) */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <button
                  onClick={openCart}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <div className="relative">
                    <ShoppingCart className="h-6 w-6 text-gray-700" />
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900 ml-1">
                    £{items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar Row */}
          <div className="hidden md:block pb-3" ref={desktopSearchRef}>
            <div className="relative w-full flex max-w-2xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  {!searchQuery && (
                    <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-gray-400 overflow-hidden max-w-[calc(100%-3rem)]">
                      <AnimatedPlaceholder />
                    </div>
                  )}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsSearchOpen(true)
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className={`w-full pl-11 pr-4 py-3 border-2 border-primary bg-cream focus:outline-none ${
                      isAuthenticated && userAddresses.length > 0 ? 'rounded-l-full border-r-0' : 'rounded-full'
                    }`}
                  />
                </div>
                {/* Location Selector - Only show for authenticated users */}
                {isAuthenticated && userAddresses.length > 0 ? (
                  <div className="relative flex" ref={addressDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                      className="flex items-center gap-2 px-4 bg-primary text-white rounded-r-full border-2 border-primary hover:bg-primary-dark transition-colors"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium">{primaryAddress?.postcode || userAddresses[0]?.postcode}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAddressDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Address Dropdown */}
                    {isAddressDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-cream rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Deliver to
                        </div>
                        {userAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleAddressSelect(addr.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                          >
                            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{addr.label}</p>
                              <p className="text-xs text-gray-500 truncate">{addr.postcode}</p>
                            </div>
                            {addr.isPrimary && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddressDropdownOpen(false)
                            router.push('/account/addresses?from=home')
                          }}
                          className="block w-full text-left px-4 py-3 text-sm text-primary font-medium hover:bg-gray-50 border-t border-gray-100"
                        >
                          Manage addresses
                        </button>
                      </div>
                    )}
                  </div>
                ) : isAuthenticated ? (
                  <Link
                    href="/account/addresses?from=home"
                    className="flex items-center gap-2 px-4 bg-primary text-white rounded-r-full border-2 border-primary hover:bg-primary-dark transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Add address</span>
                  </Link>
                ) : null}
              </form>

              {/* Desktop Popular Searches Dropdown */}
              {showPopularSearches && (
                <PopularSearchesDropdown />
              )}

              {/* Desktop Search Results Dropdown */}
              {isSearchOpen && searchQuery.length >= 2 && (
                <SearchResultsDropdown />
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <div className="relative flex" ref={mobileSearchRef}>
              <form onSubmit={handleSearchSubmit} className="flex-1 flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  {!searchQuery && (
                    <div className="absolute left-11 top-1/2 -translate-y-1/2 pointer-events-none z-10 text-gray-400 overflow-hidden max-w-[calc(100%-3rem)]">
                      <AnimatedPlaceholder />
                    </div>
                  )}
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setIsSearchOpen(true)
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    className={`w-full pl-11 pr-4 py-3 border-2 border-primary bg-cream focus:outline-none ${
                      isAuthenticated && userAddresses.length > 0 ? 'rounded-l-full border-r-0' : 'rounded-full'
                    }`}
                  />
                </div>
                {/* Location Selector - Only show for authenticated users */}
                {isAuthenticated && userAddresses.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsAddressDropdownOpen(!isAddressDropdownOpen)}
                    className="flex items-center gap-1 px-3 bg-primary text-white rounded-r-full border-2 border-primary"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-medium">{primaryAddress?.postcode || userAddresses[0]?.postcode}</span>
                    <ChevronDown className={`h-3 w-3 transition-transform ${isAddressDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : isAuthenticated ? (
                  <Link
                    href="/account/addresses?from=home"
                    className="flex items-center gap-1 px-3 bg-primary text-white rounded-r-full border-2 border-primary"
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-medium">Add</span>
                  </Link>
                ) : null}
              </form>

              {/* Mobile Address Dropdown */}
              {isAddressDropdownOpen && isAuthenticated && userAddresses.length > 0 && (
                <div ref={mobileAddressDropdownRef} className="absolute top-full left-0 right-0 mt-2 bg-cream rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Deliver to
                  </div>
                  {userAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleAddressSelect(addr.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                    >
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{addr.label}</p>
                        <p className="text-xs text-gray-500 truncate">{addr.fullAddress}, {addr.postcode}</p>
                      </div>
                      {addr.isPrimary && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddressDropdownOpen(false)
                      router.push('/account/addresses?from=home')
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-primary font-medium hover:bg-gray-50 border-t border-gray-100"
                  >
                    Manage addresses
                  </button>
                </div>
              )}

              {/* Mobile Popular Searches Dropdown */}
              {showPopularSearches && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-cream rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                  <PopularSearchesDropdown isMobile />
                </div>
              )}

              {/* Mobile Search Results Dropdown */}
              {isSearchOpen && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-cream rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto">
                  <SearchResultsDropdown isMobile />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-cream z-50 shadow-xl overflow-y-auto">
            {/* Menu Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <img src="/WurldBAsketLogo.png" alt="WurldBasket" className="h-10 w-auto olive-tint" />
                  <img src="/WurldBasketText.png" alt="WurldBasket" className="h-6 w-auto olive-tint" />
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {isAuthenticated ? (
                <p className="text-lg font-semibold text-gray-900">Hi {user?.name.split(' ')[0]}</p>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>

            {/* Menu Items */}
            <nav className="p-4">
              <ul className="space-y-1">
                {isAuthenticated && (
                  <>
                    <li>
                      <Link
                        href="/checkout"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700"
                      >
                        <ShoppingCart className="h-5 w-5" />
                        Checkout
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700"
                      >
                        <Package className="h-5 w-5" />
                        Your Orders
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700"
                      >
                        <User className="h-5 w-5" />
                        Your Account
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/regulars"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Your Regulars
                      </Link>
                    </li>
                  </>
                )}
                <li className="border-t border-gray-100 pt-2 mt-2">
                  <Link
                    href="/stores"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700"
                  >
                    <MapPin className="h-5 w-5" />
                    Groceries
                  </Link>
                </li>
                <li>
                  <Link
                    href="/regulars"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Regulars & Favourites
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Sign Out */}
            {isAuthenticated && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
