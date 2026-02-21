'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Building2, Mail, Phone, Save, ArrowLeft, Edit2, Check, X } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type EmailChangeStep = 'enter' | 'verify'

export default function VendorSettingsPage() {
  const { user, sendEmailChangeCode, updateEmailWithCode, isLoading, error, clearError } = useAuthStore()
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
    if (!newEmailValue.trim()) return
    const result = await sendEmailChangeCode(newEmailValue.trim())
    if (result.success) {
      setEmailChangeStep('verify')
      setEmailVerificationCode(['', '', '', '', '', ''])
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
    if (code.length !== 6) return
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
                  <button type="button" onClick={() => { setIsEditingEmail(true); setNewEmailValue(contactEmail || user?.email || ''); setEmailChangeStep('enter'); }} className="p-2 rounded-xl hover:bg-gray-100">
                    <Edit2 className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailChangeStep === 'enter' ? (
                    <>
                      <Input type="email" placeholder="info@yourbusiness.com" value={newEmailValue} onChange={(e) => setNewEmailValue(e.target.value)} icon={<Mail className="h-5 w-5" />} />
                      <p className="text-xs text-gray-500">We’ll send a verification code to this address.</p>
                      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
                      <div className="flex gap-2">
                        <Button onClick={handleSendEmailChangeCode} size="sm" disabled={!newEmailValue.trim() || isLoading}>Send verification code</Button>
                        <Button onClick={handleCancelEmail} variant="outline" size="sm"><X className="h-4 w-4 mr-2" /> Cancel</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">Enter the 6-digit code sent to <strong>{newEmailValue}</strong></p>
                      <div className="flex justify-center gap-2">
                        {[0,1,2,3,4,5].map((i) => (
                          <input key={i} ref={(el) => { emailCodeRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={i === 0 ? 6 : 1} value={emailVerificationCode[i]} onChange={(e) => handleEmailCodeChange(i, e.target.value)} className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary" />
                        ))}
                      </div>
                      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handleConfirmEmailChange} size="sm" disabled={getEmailChangeCode().length !== 6 || isLoading}><Check className="h-4 w-4 mr-2" /> Confirm new email</Button>
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
    </div>
  )
}
