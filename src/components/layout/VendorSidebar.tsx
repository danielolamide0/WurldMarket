'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/vendor/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/my-stores', icon: Store, label: 'My Stores' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function VendorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
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
        <p className="text-sm text-gray-500 mt-2">Vendor Portal</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <p className="font-medium text-gray-900">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href)) || (href === '/vendor/orders' && pathname.startsWith('/vendor/orders'))

            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-cream border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img
              src="/WurldBAsketLogo.png"
              alt="WurldBasket"
              className="h-8 w-auto olive-tint"
            />
            <img
              src="/WurldBasketText.png"
              alt="WurldBasket"
              className="h-5 w-auto olive-tint"
            />
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl hover:bg-gray-100"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-64 bg-cream z-50 flex flex-col">
            <NavContent />
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-64 bg-cream border-r border-gray-100 flex-col z-30">
        <NavContent />
      </aside>
    </>
  )
}
