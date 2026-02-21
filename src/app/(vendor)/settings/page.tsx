'use client'

import { useState, useEffect } from 'react'
import { Building2, Mail, Phone, FileText, Save } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function VendorSettingsPage() {
  const { user } = useAuthStore()
  const { getVendorById, updateVendor, fetchVendors } = useVendorStore()

  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const vendor = user?.vendorId ? getVendorById(user.vendorId) : undefined

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  useEffect(() => {
    if (vendor) {
      setDescription(vendor.description || '')
      setContactEmail(vendor.contactEmail || '')
      setContactPhone(vendor.contactPhone || '')
    }
  }, [vendor])

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Business profile, contact email and phone</p>
      </div>

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

            <Input
              label="Contact email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="info@yourbusiness.com"
              icon={<Mail className="h-5 w-5" />}
            />

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
