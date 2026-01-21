'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { User, Lock, Store, ShoppingBasket, Mail } from 'lucide-react'

type ViewMode = 'login' | 'signup' | 'forgot-password'

export default function LoginPage() {
  const router = useRouter()
  const { login, signup, resetPassword, checkUsernameExists, isLoading, error, clearError } = useAuthStore()
  const { addToast } = useToast()
  const [viewMode, setViewMode] = useState<ViewMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error')
      return
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error')
      return
    }

    const result = await signup(username, password, name, email || undefined)
    if (result.success) {
      addToast('Account created successfully!', 'success')
      router.push('/')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!username) {
      addToast('Please enter your username', 'error')
      return
    }

    const result = await resetPassword(username)
    if (result.success) {
      addToast('Password reset instructions have been sent to your email', 'success')
      setViewMode('login')
      setUsername('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta rounded-2xl mb-4">
            <ShoppingBasket className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">WurldBasket</h1>
          <p className="text-forest-light mt-2">Global Food Marketplace</p>
        </div>

        <Card variant="elevated" className="overflow-hidden">
          {/* View Mode Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => {
                setViewMode('login')
                clearError()
                setPassword('')
                setConfirmPassword('')
                setName('')
                setEmail('')
              }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                viewMode === 'login'
                  ? 'text-terracotta border-b-2 border-terracotta bg-terracotta/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('signup')
                clearError()
                setPassword('')
                setConfirmPassword('')
              }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                viewMode === 'signup'
                  ? 'text-terracotta border-b-2 border-terracotta bg-terracotta/5'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          <CardContent className="p-6">
            {viewMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="space-y-2">
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>
                    {error.includes('Incorrect password') && (
                      <button
                        type="button"
                        onClick={() => setViewMode('forgot-password')}
                        className="text-sm text-terracotta hover:underline w-full text-left"
                      >
                        Forgot your password?
                      </button>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                >
                  Sign In
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setViewMode('forgot-password')}
                    className="text-sm text-terracotta hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            {viewMode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User className="h-5 w-5" />}
                  required
                />

                <Input
                  label="Username"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User className="h-5 w-5" />}
                  required
                />

                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-5 w-5" />}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-5 w-5" />}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  Create Account
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login')
                      clearError()
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Already have an account? <span className="text-terracotta font-medium">Sign In</span>
                  </button>
                </div>
              </form>
            )}

            {viewMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-gray-600">
                    Enter your username and we&apos;ll send you instructions to reset your password.
                  </p>
                </div>

                <Input
                  label="Username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  icon={<User className="h-5 w-5" />}
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
                  Reset Password
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login')
                      clearError()
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Back to <span className="text-terracotta font-medium">Sign In</span>
                  </button>
                </div>
              </form>
            )}
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
