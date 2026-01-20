'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { User, Lock, Store, ShoppingBag } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState<'customer' | 'vendor'>('customer')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const success = await login(username, password)
    if (success) {
      const user = useAuthStore.getState().user
      if (user?.role === 'vendor') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }

  const handleQuickLogin = async (type: 'customer' | 'vendor1' | 'vendor2') => {
    clearError()
    let u = '', p = ''

    if (type === 'customer') {
      u = 'customer'
      p = 'customer'
    } else if (type === 'vendor1') {
      u = 'abubakr'
      p = 'abubakr'
    } else {
      u = 'sunday'
      p = 'sunday'
    }

    const success = await login(u, p)
    if (success) {
      const user = useAuthStore.getState().user
      if (user?.role === 'vendor') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta rounded-2xl mb-4">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AfriMart</h1>
          <p className="text-forest-light mt-2">African Food Marketplace</p>
        </div>

        <Card variant="elevated" className="overflow-hidden">
          {/* Login Type Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setLoginType('customer')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                loginType === 'customer'
                  ? 'text-terracotta border-b-2 border-terracotta bg-terracotta/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mx-auto mb-1" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setLoginType('vendor')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                loginType === 'vendor'
                  ? 'text-terracotta border-b-2 border-terracotta bg-terracotta/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Store className="h-5 w-5 mx-auto mb-1" />
              Vendor
            </button>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User className="h-5 w-5" />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-5 w-5" />}
                required
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Login for Demo */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center mb-4">Quick Demo Login</p>
              <div className="space-y-2">
                {loginType === 'customer' ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleQuickLogin('customer')}
                    disabled={isLoading}
                  >
                    Login as Customer
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleQuickLogin('vendor1')}
                      disabled={isLoading}
                    >
                      Login as Abu Bakr (Leeds)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleQuickLogin('vendor2')}
                      disabled={isLoading}
                    >
                      Login as Sunnyday (Southampton)
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Demo Credentials Info */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 text-center">
                <strong>Demo Credentials:</strong><br />
                Customer: customer / customer<br />
                Abu Bakr: abubakr / abubakr<br />
                Sunnyday: sunday / sunday
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Continue as Guest */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-white/80 hover:text-white text-sm underline underline-offset-4"
          >
            Continue browsing as guest
          </button>
        </div>
      </div>
    </div>
  )
}
