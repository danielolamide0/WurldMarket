'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Store, ShoppingBasket, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/stores', icon: Store, label: 'Shop' },
  { href: '/regulars', icon: ShoppingBasket, label: 'Regulars' },
  { href: '/account', icon: User, label: 'Account' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full relative',
                isActive ? 'text-primary' : 'text-gray-500'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs mt-1 font-medium">{label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
