'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Plus,
  Check,
  Trash2,
  Edit2,
  Home,
  Briefcase,
  MapPinned,
  AlertTriangle,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useAddressStore } from '@/stores/addressStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PostcodeLookup } from '@/components/address/PostcodeLookup'
import { SavedAddress } from '@/types'

const addressLabels = [
  { value: 'Home', icon: Home },
  { value: 'Work', icon: Briefcase },
  { value: 'Other', icon: MapPinned },
]

function SavedAddressesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromPage = searchParams.get('from') // 'home', 'cart', 'checkout', or null

  const { user, isAuthenticated } = useAuthStore()
  const {
    getAddressesByUser,
    addAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress,
  } = useAddressStore()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [label, setLabel] = useState('Home')
  const [fullAddress, setFullAddress] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined)
  const [addressSelected, setAddressSelected] = useState(false)

  const addresses = user ? getAddressesByUser(user.id) : []

  const resetForm = () => {
    setLabel('Home')
    setFullAddress('')
    setCity('')
    setPostcode('')
    setCoordinates(undefined)
    setIsAdding(false)
    setEditingId(null)
    setAddressSelected(false)
  }

  const handleAddressSelect = (address: { line1: string; city: string; postcode: string; coordinates?: { lat: number; lng: number } }) => {
    setFullAddress(address.line1)
    setCity(address.city)
    setPostcode(address.postcode)
    setCoordinates(address.coordinates)
    setAddressSelected(true)
  }

  const handleSave = () => {
    if (!fullAddress.trim() || !city.trim() || !postcode.trim()) {
      return
    }

    if (!user) return

    if (editingId) {
      updateAddress(editingId, { label, fullAddress, city, postcode, coordinates })
    } else {
      addAddress(user.id, label, fullAddress, city, postcode, false, coordinates)
    }

    resetForm()

    // Redirect based on where user came from
    if (fromPage === 'home') {
      router.push('/')
    } else if (fromPage === 'cart') {
      router.push('/cart')
    } else if (fromPage === 'checkout') {
      router.push('/checkout')
    }
    // If fromPage is null or 'account', stay on the page (current behavior)
  }

  const handleEdit = (address: SavedAddress) => {
    setEditingId(address.id)
    setLabel(address.label)
    setFullAddress(address.fullAddress)
    setCity(address.city)
    setPostcode(address.postcode)
    setCoordinates(address.coordinates)
    setAddressSelected(true)
    setIsAdding(true)
  }

  const handleDelete = (addressId: string) => {
    deleteAddress(addressId)
  }

  const handleSetPrimary = (addressId: string) => {
    if (!user) return
    setPrimaryAddress(user.id, addressId)
  }

  const getLabelIcon = (labelValue: string) => {
    const found = addressLabels.find((l) => l.value === labelValue)
    return found?.icon || MapPinned
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to manage addresses</h1>
          <p className="text-gray-500 mb-6">
            Save your delivery addresses for faster checkout.
          </p>
          <Link href="/login">
            <Button size="lg" className="w-full">Sign In</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href={fromPage === 'home' ? '/' : fromPage === 'cart' ? '/cart' : fromPage === 'checkout' ? '/checkout' : '/account'}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors inline-block"
          >
            <ArrowLeft className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Add/Edit Form */}
        {isAdding ? (
          <Card className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>

            {/* Label Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label
              </label>
              <div className="flex gap-2">
                {addressLabels.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLabel(value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                      label === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* Postcode Lookup - for new addresses OR editing addresses without coordinates */}
            {((!editingId && !addressSelected) || (editingId && !coordinates && !addressSelected)) && (
              <>
                {editingId && !coordinates && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 text-amber-700 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>This address needs coordinates for store proximity sorting. Look up the postcode to add them.</span>
                    </div>
                  </div>
                )}
                <PostcodeLookup
                  onAddressSelect={handleAddressSelect}
                  onManualEntry={() => setAddressSelected(true)}
                />
              </>
            )}

            {/* Manual fields - shown after postcode lookup or when editing */}
            {(addressSelected || (editingId && coordinates)) && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-xl">
                {!editingId && (
                  <div className="flex justify-end -mt-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAddressSelected(false)
                        setFullAddress('')
                        setCity('')
                        setPostcode('')
                        setCoordinates(undefined)
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Change Postcode
                    </button>
                  </div>
                )}
                {editingId && (
                  <div className="flex justify-end -mt-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAddressSelected(false)
                        setCoordinates(undefined)
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      Look up new postcode
                    </button>
                  </div>
                )}
                <Input
                  label="Street Address"
                  placeholder="123 Main Street, Apartment 4B"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  icon={<MapPin className="h-5 w-5" />}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="London"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <Input
                    label="Postcode"
                    placeholder="SW1A 1AA"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="uppercase"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} className="flex-1">
                {editingId ? 'Update Address' : 'Save Address'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </Card>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="w-full border-dashed border-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}

        {/* Address List */}
        {addresses.length === 0 && !isAdding ? (
          <Card className="p-12 text-center">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved addresses</h2>
            <p className="text-gray-500 mb-6">
              Add an address for faster checkout
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => {
              const LabelIcon = getLabelIcon(address.label)
              return (
                <Card
                  key={address.id}
                  className={`p-4 ${address.isPrimary ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          address.isPrimary ? 'bg-primary/10' : 'bg-gray-100'
                        }`}
                      >
                        <LabelIcon
                          className={`h-5 w-5 ${
                            address.isPrimary ? 'text-primary' : 'text-gray-500'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {address.label}
                          </span>
                          {address.isPrimary && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                              Primary
                            </span>
                          )}
                          {!address.coordinates && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Needs update
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{address.fullAddress}</p>
                        <p className="text-gray-500 text-sm">
                          {address.city}, {address.postcode}
                        </p>
                        {!address.coordinates && (
                          <p className="text-xs text-amber-600 mt-1">
                            Edit this address to enable store proximity sorting
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!address.isPrimary && (
                        <button
                          onClick={() => handleSetPrimary(address.id)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="Set as primary"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(address)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SavedAddressesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SavedAddressesContent />
    </Suspense>
  )
}
