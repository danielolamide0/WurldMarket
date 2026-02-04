'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { User, Lock, Store, Mail, Building2, Phone, ShoppingBag } from 'lucide-react'

type ViewMode = 'login' | 'signup' | 'forgot-password'
type SignupRole = 'customer' | 'vendor'

export default function LoginPage() {
  const router = useRouter()
  const { login, signup, resetPassword, checkUsernameExists, isLoading, error, clearError } = useAuthStore()
  const { addToast } = useToast()
  const [viewMode, setViewMode] = useState<ViewMode>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [signupRole, setSignupRole] = useState<SignupRole>('customer')
  const [companyName, setCompanyName] = useState('')

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

    if (signupRole === 'vendor' && !companyName.trim()) {
      addToast('Company name is required for vendor accounts', 'error')
      return
    }

    if (!email.trim()) {
      addToast('Email is required', 'error')
      return
    }

    const result = await signup({
      username,
      password,
      name,
      email: email.trim(),
      phone: signupRole === 'customer' ? (phone || undefined) : undefined,
      role: signupRole,
      companyName: signupRole === 'vendor' ? companyName : undefined,
    })

    if (result.success) {
      if (signupRole === 'vendor') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
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
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="/WurldBAsketLogo.png"
              alt="WurldBasket"
              className="h-16 w-auto"
            />
            <img
              src="/WurldBasketText.png"
              alt="WurldBasket"
              className="h-10 w-auto brightness-0 invert"
            />
          </div>
          <p className="text-white/70">Global Food Marketplace</p>
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
                setPhone('')
              }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                viewMode === 'login'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
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
                setSignupRole('customer')
                setCompanyName('')
                setPhone('')
              }}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                viewMode === 'signup'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
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
                        className="text-sm text-primary hover:underline w-full text-left"
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
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            {viewMode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I want to sign up as a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSignupRole('customer')
                        setCompanyName('')
                      }}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        signupRole === 'customer'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <ShoppingBag className={`h-6 w-6 mx-auto mb-2 ${signupRole === 'customer' ? 'text-primary' : 'text-gray-400'}`} />
                      <p className={`font-medium ${signupRole === 'customer' ? 'text-primary' : 'text-gray-700'}`}>Customer</p>
                      <p className="text-xs text-gray-500 mt-1">Shop & order</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupRole('vendor')}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        signupRole === 'vendor'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Store className={`h-6 w-6 mx-auto mb-2 ${signupRole === 'vendor' ? 'text-primary' : 'text-gray-400'}`} />
                      <p className={`font-medium ${signupRole === 'vendor' ? 'text-primary' : 'text-gray-700'}`}>Vendor</p>
                      <p className="text-xs text-gray-500 mt-1">Sell products</p>
                    </button>
                  </div>
                </div>

                {/* Company Name - only for vendors */}
                {signupRole === 'vendor' && (
                  <Input
                    label="Company Name"
                    placeholder="Enter your business name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    icon={<Building2 className="h-5 w-5" />}
                    required
                  />
                )}

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
                  label={signupRole === 'vendor' ? 'Business Email' : 'Email'}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="h-5 w-5" />}
                  required
                />

                {signupRole === 'customer' && (
                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    placeholder="07123 456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={<Phone className="h-5 w-5" />}
                  />
                )}

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
                  {signupRole === 'vendor' ? 'Create Vendor Account' : 'Create Account'}
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
                    Already have an account? <span className="text-primary font-medium">Sign In</span>
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
                    Back to <span className="text-primary font-medium">Sign In</span>
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
