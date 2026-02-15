'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bell, Mail, MessageSquare, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PermissionsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: false,
    orderUpdates: true,
    promotions: false,
    newsletters: false,
  })

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Account
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
          </div>
          <p className="text-gray-600">Manage your notification and privacy preferences</p>
        </div>

        {/* Notifications Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via email</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.email ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates via text message</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('sms')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.sms ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.sms ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('push')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.push ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Order Updates */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Order Updates</p>
                <p className="text-sm text-gray-500">Get notified about your order status</p>
              </div>
              <button
                onClick={() => handleToggle('orderUpdates')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.orderUpdates ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.orderUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Promotions */}
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Promotions & Offers</p>
                <p className="text-sm text-gray-500">Receive special offers and discounts</p>
              </div>
              <button
                onClick={() => handleToggle('promotions')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.promotions ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.promotions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Newsletters */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Newsletters</p>
                <p className="text-sm text-gray-500">Receive our monthly newsletter</p>
              </div>
              <button
                onClick={() => handleToggle('newsletters')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications.newsletters ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications.newsletters ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={() => {
              // TODO: Save preferences to backend
              router.push('/account')
            }}
            className="flex-1"
            size="lg"
          >
            Save Preferences
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/account')}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
