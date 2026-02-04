'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  ShoppingBasket,
  Package,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const menuItems = [
  { icon: ShoppingBasket, label: 'Regulars', href: '/regulars' },
  { icon: Package, label: 'Your Orders', href: '/orders' },
  { icon: MapPin, label: 'Saved Addresses', href: '/account/addresses' },
  { icon: CreditCard, label: 'Payment Methods', href: '#' },
  { icon: Bell, label: 'Notifications', href: '#' },
  { icon: HelpCircle, label: 'Help & Support', href: '#' },
  { icon: Settings, label: 'Settings', href: '/account/settings' },
]

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 pt-8">
        <div className="max-w-sm w-full text-center mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-8">
            Sign in to view your orders, manage your account, and more.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Sign in / Sign up</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {user?.role === 'vendor' && (
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Store className="h-4 w-4 mr-2" />
                Go to Vendor Dashboard
              </Button>
            </Link>
          </div>
        )}
        {/* Menu Items */}
        <div>
          <Card className="divide-y divide-gray-100">
            {menuItems.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Link>
            ))}
          </Card>
        </div>

        {/* Sign Out */}
        <div className="mt-6 pb-20">
          <Button
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
