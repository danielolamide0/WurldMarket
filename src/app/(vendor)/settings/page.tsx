'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, Mail, Phone, Save, ArrowLeft, Edit2, Check, X, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type EmailChangeStep = 'enter' | 'verify'
type DeleteStep = 'idle' | 'send_code' | 'verify'

export default function VendorSettingsPage() {
  const router = useRouter()
  const { user, sendEmailChangeCode, updateEmailWithCode, isLoading, error, clearError, logout } = useAuthStore()
  const { getVendorById, updateVendor, fetchVendors } = useVendorStore()

  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [emailChangeStep, setEmailChangeStep] = useState<EmailChangeStep>('enter')
  const [newEmailValue, setNewEmailValue] = useState('')
  const [emailVerificationCode, setEmailVerificationCode] = useState(['', '', '', '', '', ''])
  const emailCodeRefs = useRef<(HTMLInputElement | null)[]>([])

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle')
  const [deleteCode, setDeleteCode] = useState(['', '', '', '', '', ''])
  const [deleteError, setDeleteError] = useState('')
  const [isSendingDeleteCode, setIsSendingDeleteCode] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteCodeRefs = useRef<(HTMLInputElement | null)[]>([])

  const vendor = user?.vendorId ? getVendorById(user.vendorId) : undefined

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  useEffect(() => {
    if (vendor) {
      setDescription(vendor.description || '')
      setContactEmail(vendor.contactEmail || '')
      setContactPhone(vendor.contactPhone || '')
      if (!isEditingEmail) setNewEmailValue(vendor.contactEmail || user?.email || '')
    }
  }, [vendor, user?.email, isEditingEmail])

  const handleSendEmailChangeCode = async () => {
    clearError?.()
    const result = await sendEmailChangeCode()
    if (result.success) {
      setEmailChangeStep('verify')
      setEmailVerificationCode(['', '', '', '', '', ''])
      setNewEmailValue('') // new email input in step 2
    }
  }

  const getEmailChangeCode = () => emailVerificationCode.join('')

  const handleEmailCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setEmailVerificationCode(value.split(''))
      emailCodeRefs.current[5]?.focus()
      return
    }
    const next = [...emailVerificationCode]
    next[index] = value.slice(-1)
    setEmailVerificationCode(next)
    if (value && index < 5) emailCodeRefs.current[index + 1]?.focus()
  }

  const handleConfirmEmailChange = async () => {
    clearError?.()
    const code = getEmailChangeCode()
    if (code.length !== 6 || !newEmailValue.trim()) return
    const success = await updateEmailWithCode(newEmailValue.trim(), code)
    if (success && user?.vendorId) {
      await updateVendor(user.vendorId, { contactEmail: newEmailValue.trim() })
      setContactEmail(newEmailValue.trim())
      setIsEditingEmail(false)
      setEmailChangeStep('enter')
      setEmailVerificationCode(['', '', '', '', '', ''])
    }
  }

  const handleCancelEmail = () => {
    setNewEmailValue(contactEmail || user?.email || '')
    setEmailChangeStep('enter')
    setEmailVerificationCode(['', '', '', '', '', ''])
    setIsEditingEmail(false)
    clearError?.()
  }

  const handleSave = async () => {
    if (!user?.vendorId) return
    setIsSaving(true)
    setSaved(false)
    try {
      await updateVendor(user.vendorId, {
        description: description.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      })
      setSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendDeleteCode = async () => {
    if (!user?.id) return
    setDeleteError('')
    setIsSendingDeleteCode(true)
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'delete-vendor-account', userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to send code')
        return
      }
      setDeleteStep('verify')
      setDeleteCode(['', '', '', '', '', ''])
    } finally {
      setIsSendingDeleteCode(false)
    }
  }

  const getDeleteCode = () => deleteCode.join('')

  const handleDeleteCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      setDeleteCode(value.split(''))
      deleteCodeRefs.current[5]?.focus()
      return
    }
    const next = [...deleteCode]
    next[index] = value.slice(-1)
    setDeleteCode(next)
    if (value && index < 5) deleteCodeRefs.current[index + 1]?.focus()
  }

  const handleConfirmDelete = async () => {
    if (!user?.id) return
    const code = getDeleteCode()
    if (code.length !== 6) return
    setDeleteError('')
    setIsDeleting(true)
    try {
      const res = await fetch('/api/vendor/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete account')
        return
      }
      logout()
      router.replace('/')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-5 w-5 text-primary" />
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Business profile</h2>
              <p className="text-sm text-gray-500">Business name cannot be changed here</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
              <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
                {vendor?.name || '—'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business info</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your business..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact email</label>
              {!isEditingEmail ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 flex-1">
                    {contactEmail || user?.email || '—'}
                  </div>
                  <button type="button" onClick={() => { setIsEditingEmail(true); setNewEmailValue(''); setEmailChangeStep('enter'); }} className="p-2 rounded-xl hover:bg-gray-100">
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailChangeStep === 'enter' ? (
                    <>
                      <p className="text-sm text-gray-600">We’ll send a verification code to your current email to confirm it’s you.</p>
                      <p className="text-sm font-medium text-gray-900">Current email: <strong>{user?.email || contactEmail || '—'}</strong></p>
                      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
                      <div className="flex gap-2">
                        <Button onClick={handleSendEmailChangeCode} size="sm" disabled={isLoading}>Send verification code to current email</Button>
                        <Button onClick={handleCancelEmail} variant="outline" size="sm"><X className="h-4 w-4 mr-2" /> Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">Enter the 6-digit code we sent to your current email (<strong>{user?.email}</strong>), then enter your new contact email below.</p>
                      <div className="flex justify-center gap-2">
                        {[0,1,2,3,4,5].map((i) => (
                          <input key={i} ref={(el) => { emailCodeRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={i === 0 ? 6 : 1} value={emailVerificationCode[i]} onChange={(e) => handleEmailCodeChange(i, e.target.value)} className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                        ))}
                      </div>
                      <Input label="New contact email" type="email" placeholder="info@yourbusiness.com" value={newEmailValue} onChange={(e) => setNewEmailValue(e.target.value)} icon={<Mail className="h-5 w-5" />} />
                      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handleConfirmEmailChange} size="sm" disabled={getEmailChangeCode().length !== 6 || !newEmailValue.trim() || isLoading}><Check className="h-4 w-4 mr-2" /> Update to new email</Button>
                        <Button variant="outline" size="sm" onClick={() => { setEmailChangeStep('enter'); setEmailVerificationCode(['','','','','','']); clearError?.(); }}>Back</Button>
                        <Button onClick={handleCancelEmail} variant="outline" size="sm"><X className="h-4 w-4 mr-2" /> Cancel</Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <Input
              label="Contact phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+44 123 456 7890"
              icon={<Phone className="h-5 w-5" />}
            />

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
              {saved && <span className="text-sm text-green-600">Saved</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete account */}
      <Card className="mt-8 border-red-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Delete vendor account</h2>
              <p className="text-sm text-gray-500">Permanently delete all your stores, products, orders and vendor data. Your login will become a customer account. This cannot be undone.</p>
            </div>
          </div>

          {deleteStep === 'idle' && (
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => { setDeleteStep('send_code'); setDeleteError(''); }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete vendor account
            </Button>
          )}

          {deleteStep === 'send_code' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">We’ll send a verification code to <strong>{user?.email}</strong>. Enter it below to confirm and permanently delete all vendor data.</p>
              {deleteError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{deleteError}</p>}
              <div className="flex gap-2">
                <Button onClick={handleSendDeleteCode} size="sm" disabled={isSendingDeleteCode}>
                  {isSendingDeleteCode ? 'Sending...' : 'Send verification code'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDeleteStep('idle'); setDeleteError(''); }}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </div>
            </div>
          )}

          {deleteStep === 'verify' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Enter the 6-digit code we sent to <strong>{user?.email}</strong>.</p>
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { deleteCodeRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={i === 0 ? 6 : 1}
                    value={deleteCode[i]}
                    onChange={(e) => handleDeleteCodeChange(i, e.target.value)}
                    className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}
              </div>
              {deleteError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{deleteError}</p>}
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleConfirmDelete}
                  disabled={getDeleteCode().length !== 6 || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete everything'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDeleteStep('idle'); setDeleteError(''); setDeleteCode(['', '', '', '', '', '']); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
