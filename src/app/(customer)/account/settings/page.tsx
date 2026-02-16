'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Phone, Edit2, Check, X, Trash2, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, deleteAccount, logout } = useAuthStore()

  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [emailValue, setEmailValue] = useState(user?.email || '')
  const [phoneValue, setPhoneValue] = useState(user?.phone || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (user) {
      setEmailValue(user.email || '')
      setPhoneValue(user.phone || '')
    }
  }, [user])

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign In to Continue</h1>
          <Link href="/login">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSaveEmail = async () => {
    if (!emailValue.trim()) {
      return
    }

    const success = await updateUser({ email: emailValue.trim() })
    if (success) {
      setIsEditingEmail(false)
    }
  }

  const handleSavePhone = async () => {
    const success = await updateUser({ phone: phoneValue.trim() || undefined })
    if (success) {
      setIsEditingPhone(false)
    }
  }

  const handleCancelEmail = () => {
    setEmailValue(user?.email || '')
    setIsEditingEmail(false)
  }

  const handleCancelPhone = () => {
    setPhoneValue(user?.phone || '')
    setIsEditingPhone(false)
  }

  const handleDeleteAccount = async () => {
    const success = await deleteAccount(user.id)
    if (success) {
      logout()
      router.push('/')
    }
    setShowDeleteConfirm(false)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/account"
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors inline-block"
          >
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Name (Uneditable) */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Name</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-gray-900 font-medium">{user.name}</p>
            </div>
          </div>
        </Card>

        {/* Email (Editable) */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Email</h3>
              </div>
              {!isEditingEmail && (
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>

            {isEditingEmail ? (
              <div className="space-y-3">
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  icon={<Mail className="h-5 w-5" />}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEmail}
                    size="sm"
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEmail}
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
                  {user.email || 'No email saved'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Phone Number (Editable) */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Phone Number</h3>
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
                    onClick={handleCancelPhone}
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
                  {user.phone || 'No phone number saved'}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Delete Account</h3>
                <p className="text-sm text-gray-500">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-medium mb-2">
                    Are you sure you want to delete your account?
                  </p>
                  <p className="text-xs text-red-600">
                    This will permanently delete your account, orders, and all associated data.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Confirm Delete
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
