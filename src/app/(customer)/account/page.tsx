'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  Clock,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  ShoppingBasket,
  Package,
  Phone,
  Edit2,
  Check,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useOrderStore } from '@/stores/orderStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { formatPrice, formatDateTime } from '@/lib/utils'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'

const menuItems = [
  { icon: ShoppingBasket, label: 'Regulars', href: '/regulars' },
  { icon: Package, label: 'Your Orders', href: '/orders' },
  { icon: MapPin, label: 'Saved Addresses', href: '/account/addresses' },
  { icon: CreditCard, label: 'Payment Methods', href: '#' },
  { icon: Bell, label: 'Notifications', href: '#' },
  { icon: HelpCircle, label: 'Help & Support', href: '#' },
]

export default function AccountPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, updateUser } = useAuthStore()
  const { addToast } = useToast()
  const orders = useOrderStore((state) =>
    user ? state.getOrdersByCustomer(user.id) : []
  )

  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(user?.phone || '')

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleSavePhone = async () => {
    const success = await updateUser({ phone: phoneValue || undefined })
    if (success) {
      addToast('Phone number updated successfully', 'success')
      setIsEditingPhone(false)
    } else {
      addToast('Failed to update phone number', 'error')
    }
  }

  const handleCancelEdit = () => {
    setPhoneValue(user?.phone || '')
    setIsEditingPhone(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Continue</h1>
          <p className="text-gray-500 mb-8">
            Sign in to view your orders, manage your account, and more.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-forest-dark to-forest text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user?.name}</h1>
              <p className="text-white/70">{user?.email}</p>
              {user?.phone && (
                <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {user.phone}
                </p>
              )}
            </div>
          </div>

          {user?.role === 'vendor' && (
            <Link href="/dashboard" className="block mt-4">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-forest">
                <Store className="h-4 w-4 mr-2" />
                Go to Vendor Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Phone Number Section */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Phone Number</h3>
                  <p className="text-sm text-gray-500">Used for order updates and delivery</p>
                </div>
              </div>
              {!isEditingPhone && (
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>

            {isEditingPhone ? (
              <div className="space-y-3">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="07123 456789"
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  icon={<Phone className="h-5 w-5" />}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSavePhone}
                    size="sm"
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-900 font-medium">
                  {user?.phone || 'No phone number saved'}
                </p>
                {!user?.phone && (
                  <p className="text-sm text-gray-500 mt-1">
                    Add a phone number to receive order updates
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

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

        {/* Recent Orders */}
        <div className="mt-6">
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-terracotta" />
                <h2 className="font-semibold text-gray-900">Recent Orders</h2>
              </div>
              {orders.length > 0 && (
                <Link href="/orders" className="text-sm text-terracotta font-medium">
                  View all
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No orders yet</p>
                <Link href="/stores">
                  <Button variant="outline">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.slice(0, 3).map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="block p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-medium text-gray-900">{order.storeName}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <Badge className={ORDER_STATUS_COLORS[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="font-semibold text-terracotta">{formatPrice(order.total)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
