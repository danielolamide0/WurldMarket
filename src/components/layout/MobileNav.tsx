'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingBasket, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/orders', icon: Package, label: 'Orders' },
  { href: '/regulars', icon: ShoppingBasket, label: 'Regulars' },
  { href: '/account', icon: User, label: 'Account' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="bg-black/60 backdrop-blur-lg rounded-full px-4 py-3 border border-white/20 shadow-2xl">
        <div className="flex items-center justify-around gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center relative px-3 py-2 rounded-xl transition-all',
                  isActive ? 'bg-white/20' : ''
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 mb-1',
                  isActive ? 'text-white' : 'text-white/80'
                )} />
                <span className={cn(
                  'text-xs font-medium',
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
