'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, MapPin, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/stores', icon: MapPin, label: 'Stores' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart', showBadge: true },
  { href: '/account', icon: User, label: 'Account' },
]

export function MobileNav() {
  const pathname = usePathname()
  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label, showBadge }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative',
                isActive ? 'text-terracotta' : 'text-gray-500'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {showBadge && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-terracotta text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-terracotta rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
