'use client'

import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Footer } from './Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'

interface CustomerLayoutProps {
  children: React.ReactNode
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <CartDrawer />
    </div>
  )
}
