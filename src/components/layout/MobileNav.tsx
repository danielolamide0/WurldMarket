'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingBasket, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/orders', icon: Package, label: 'Orders' },
  { href: '/regulars', icon: ShoppingBasket, label: 'Regulars' },
  { href: '/account', icon: User, label: 'Account' },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()

  // Don't show bottom nav if user is not logged in
  if (!isAuthenticated) {
    return null
  }

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 md:hidden px-4">
      <div className="bg-black/30 backdrop-blur-lg rounded-full px-4 py-3 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-around gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center relative px-2 py-1 rounded-xl transition-all',
                  isActive ? 'bg-white/20' : ''
                )}
              >
                <Icon className={cn(
                  'h-4 w-4',
                  isActive ? 'text-white' : 'text-white/80'
                )} />
                <span className={cn(
                  'text-[10px] font-medium leading-tight',
                  isActive ? 'text-white' : 'text-white/80'
                )}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
