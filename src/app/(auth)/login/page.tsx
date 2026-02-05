'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { User, Lock, Store, Mail, Building2, Phone, ShoppingBag, ArrowLeft } from 'lucide-react'

type ViewMode = 'login' | 'signup' | 'forgot-password'
type SignupStep = 'form' | 'verify'
type ForgotPasswordStep = 'email' | 'verify' | 'reset'
type SignupRole = 'customer' | 'vendor'

export default function LoginPage() {
  const router = useRouter()
  const {
    login,
    signup,
    sendVerificationCode,
    verifyCode,
    resetPassword,
    isLoading,
    error,
    clearError
  } = useAuthStore()
  const { addToast } = useToast()

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('login')
  const [signupStep, setSignupStep] = useState<SignupStep>('form')
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email')

  // Form fields
  const [identifier, setIdentifier] = useState('') // email or username for login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [signupRole, setSignupRole] = useState<SignupRole>('customer')
  const [companyName, setCompanyName] = useState('')

  // Verification code
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Email verified flag for signup
  const [emailVerified, setEmailVerified] = useState(false)

  // Countdown timer for resend code
  const [countdown, setCountdown] = useState<number | null>(null)

  // Countdown effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0) {
        setCountdown(null)
        clearError()
      }
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, clearError])

  // Reset all form state
  const resetForm = () => {
    setIdentifier('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setPhone('')
    setCompanyName('')
    setSignupRole('customer')
    setVerificationCode(['', '', '', '', '', ''])
    setEmailVerified(false)
    setSignupStep('form')
    setForgotPasswordStep('email')
    setCountdown(null)
    clearError()
  }

  // Handle verification code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    // Detect iOS autofill - if value is 6 digits, it's likely autofill
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const newCode = value.split('')
      setVerificationCode(newCode)
      // Focus the last field
      setTimeout(() => {
        codeInputRefs.current[5]?.focus()
      }, 0)
      return
    }

    const newCode = [...verificationCode]
    newCode[index] = value.slice(-1) // Only keep last character
    setVerificationCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent, startIndex: number = 0) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...verificationCode]
    
    // Fill the code starting from the current field
    for (let i = 0; i < pastedData.length && (startIndex + i) < 6; i++) {
      newCode[startIndex + i] = pastedData[i]
    }
    
    setVerificationCode(newCode)
    
    // Focus the last filled field or the last field if 6 digits were pasted
    const lastFilledIndex = Math.min(startIndex + pastedData.length - 1, 5)
    setTimeout(() => {
      codeInputRefs.current[lastFilledIndex]?.focus()
    }, 0)
  }

  const getFullCode = () => verificationCode.join('')

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const success = await login(identifier, password)
    if (success) {
      const user = useAuthStore.getState().user
      if (user?.role === 'vendor') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    }
  }

  // Signup Step 1: Fill form and send verification code
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email.trim()) {
      addToast('Please enter your email', 'error')
      return
    }

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

    // Send verification code to email
    const result = await sendVerificationCode(email.trim(), 'signup')
    if (result.success) {
      setSignupStep('verify')
    }
  }

  // Signup Step 2: Verify code and complete signup
  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const code = getFullCode()
    if (code.length !== 6) {
      addToast('Please enter the 6-digit code', 'error')
      return
    }

    // Complete signup with the verification code
    const result = await signup({
      email: email.trim(),
      verificationCode: code,
      password,
      name,
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

  // Forgot Password Step 1: Send code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!email.trim()) {
      addToast('Please enter your email', 'error')
      return
    }

    const result = await sendVerificationCode(email.trim(), 'password-reset')
    if (result.success) {
      setForgotPasswordStep('verify')
    }
  }

  // Forgot Password Step 2: Verify code
  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    const code = getFullCode()
    if (code.length !== 6) {
      addToast('Please enter the 6-digit code', 'error')
      return
    }

    const result = await verifyCode(email.trim(), code, 'password-reset')
    if (result.success) {
      setForgotPasswordStep('reset')
    }
  }

  // Forgot Password Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
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

    const result = await resetPassword(email.trim(), getFullCode(), password)
    if (result.success) {
      resetForm()
      setViewMode('login')
    }
  }

  // Resend code
  const handleResendCode = async (type: 'signup' | 'password-reset') => {
    clearError()
    setVerificationCode(['', '', '', '', '', ''])
    const result = await sendVerificationCode(email.trim(), type)
    
    // If rate limited, start countdown
    if (!result.success && result.timeRemaining) {
      setCountdown(result.timeRemaining)
    } else if (result.success) {
      setCountdown(null)
    }
  }

  // Format countdown time
  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `Wait ${mins} min${mins !== 1 ? 's' : ''} ${secs} sec${secs !== 1 ? 's' : ''} before requesting another code`
    }
    return `Wait ${secs} sec${secs !== 1 ? 's' : ''} before requesting another code`
  }

  // Render verification code inputs
  const renderCodeInputs = () => (
    <div className="flex justify-center gap-2">
      {verificationCode.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { codeInputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={index === 0 ? 6 : 1}
          value={digit}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          onChange={(e) => handleCodeChange(index, e.target.value)}
          onInput={(e) => {
            // Handle iOS autofill which may trigger onInput
            const target = e.target as HTMLInputElement
            const value = target.value.replace(/\D/g, '')
            if (value.length === 6 && index === 0) {
              handleCodeChange(index, value)
            }
          }}
          onKeyDown={(e) => handleCodeKeyDown(index, e)}
          onPaste={(e) => handleCodePaste(e, index)}
          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors"
        />
      ))}
    </div>
  )

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
          {/* View Mode Tabs - only show when not in sub-steps */}
          {(viewMode === 'login' || (viewMode === 'signup' && signupStep === 'form') || viewMode === 'forgot-password') && (
            <div className="flex border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login')
                  resetForm()
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
                  resetForm()
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
          )}

          <CardContent className="p-6">
            {/* LOGIN VIEW */}
            {viewMode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  icon={<Mail className="h-5 w-5" />}
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

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot-password')
                      resetForm()
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP VIEW */}
            {viewMode === 'signup' && (
              <>
                {/* Step 1: Full Signup Form */}
                {signupStep === 'form' && (
                  <form onSubmit={handleSignupSubmit} className="space-y-4">
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
                          resetForm()
                        }}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Already have an account? <span className="text-primary font-medium">Sign In</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: Verify Email Code */}
                {signupStep === 'verify' && (
                  <form onSubmit={handleVerifyAndSignup} className="space-y-6">
                    <button
                      type="button"
                      onClick={() => {
                        setSignupStep('form')
                        setVerificationCode(['', '', '', '', '', ''])
                        clearError()
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Email</h2>
                      <p className="text-gray-600 text-sm">
                        We sent a 6-digit code to<br />
                        <span className="font-medium text-gray-900">{email}</span>
                      </p>
                    </div>

                    {renderCodeInputs()}

                    {countdown !== null && countdown > 0 ? (
                      <p className="text-sm text-gray-600 text-center">
                        {formatCountdown(countdown)}
                      </p>
                    ) : error && !error.includes('wait') ? (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">{error}</p>
                    ) : null}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      isLoading={isLoading}
                      disabled={getFullCode().length !== 6}
                    >
                      Verify & Create Account
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => handleResendCode('signup')}
                        className="text-sm text-primary hover:underline"
                        disabled={isLoading || (countdown !== null && countdown > 0)}
                      >
                        Didn&apos;t receive the code? Resend
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {viewMode === 'forgot-password' && (
              <>
                {/* Step 1: Enter Email */}
                {forgotPasswordStep === 'email' && (
                  <form onSubmit={handleSendResetCode} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('login')
                        resetForm()
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </button>

                    <div className="text-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Password</h2>
                      <p className="text-gray-600 text-sm">
                        Enter your email and we&apos;ll send you a code to reset your password.
                      </p>
                    </div>

                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      icon={<Mail className="h-5 w-5" />}
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
                      Send Reset Code
                    </Button>
                  </form>
                )}

                {/* Step 2: Verify Code */}
                {forgotPasswordStep === 'verify' && (
                  <form onSubmit={handleVerifyResetCode} className="space-y-6">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep('email')
                        setVerificationCode(['', '', '', '', '', ''])
                        clearError()
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <div className="text-center">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Verification Code</h2>
                      <p className="text-gray-600 text-sm">
                        We sent a 6-digit code to<br />
                        <span className="font-medium text-gray-900">{email}</span>
                      </p>
                    </div>

                    {renderCodeInputs()}

                    {countdown !== null && countdown > 0 ? (
                      <p className="text-sm text-gray-600 text-center">
                        {formatCountdown(countdown)}
                      </p>
                    ) : error && !error.includes('wait') ? (
                      <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">{error}</p>
                    ) : null}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      isLoading={isLoading}
                      disabled={getFullCode().length !== 6}
                    >
                      Verify Code
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => handleResendCode('password-reset')}
                        className="text-sm text-primary hover:underline"
                        disabled={isLoading || (countdown !== null && countdown > 0)}
                      >
                        Didn&apos;t receive the code? Resend
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Reset Password */}
                {forgotPasswordStep === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep('verify')
                        clearError()
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <div className="text-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Set New Password</h2>
                      <p className="text-gray-600 text-sm">
                        Choose a new password for your account
                      </p>
                    </div>

                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      icon={<Lock className="h-5 w-5" />}
                      required
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm your new password"
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
                      Reset Password
                    </Button>
                  </form>
                )}
              </>
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
