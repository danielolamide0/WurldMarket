'use client'

import { useState, useEffect } from 'react'
import {
  MapPin,
  Clock,
  ExternalLink,
  Package,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
  FileText,
  Save,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { stores as staticStores } from '@/data/stores'
import { vendors as staticVendors } from '@/data/users'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { PostcodeLookup } from '@/components/address/PostcodeLookup'
import { Vendor, StoreLocation } from '@/types'

export default function VendorStoresPage() {
  const { user } = useAuthStore()
  const { getVendorById, updateVendor, getStoresByVendor, createStore, deleteStore } = useVendorStore()
  const { addToast } = useToast()

  const [vendor, setVendor] = useState<Vendor | undefined>(undefined)
  const [vendorStores, setVendorStores] = useState<StoreLocation[]>([])
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [isAddingStore, setIsAddingStore] = useState(false)

  // Editable vendor fields
  const [description, setDescription] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  // New store fields
  const [newStoreName, setNewStoreName] = useState('')
  const [newStoreAddress, setNewStoreAddress] = useState('')
  const [newStoreCity, setNewStoreCity] = useState('')
  const [newStorePostcode, setNewStorePostcode] = useState('')
  const [storeAddressSelected, setStoreAddressSelected] = useState(false)

  const handleStoreAddressSelect = (addr: { line1: string; city: string; postcode: string }) => {
    setNewStoreAddress(addr.line1)
    setNewStoreCity(addr.city)
    setNewStorePostcode(addr.postcode)
    setStoreAddressSelected(true)
  }

  const products = useProductStore((state) =>
    user?.vendorId ? state.getProductsByVendor(user.vendorId) : []
  )

  // Load vendor data
  useEffect(() => {
    if (user?.vendorId) {
      // Check vendorStore first
      let v = getVendorById(user.vendorId)

      // If not found, check static vendors
      if (!v) {
        v = staticVendors.find((sv) => sv.id === user.vendorId)
      }

      // If still not found, check localStorage
      if (!v) {
        const storedVendors = localStorage.getItem('wurldbasket-vendors')
        if (storedVendors) {
          const parsedVendors = JSON.parse(storedVendors)
          v = parsedVendors.find((sv: Vendor) => sv.id === user.vendorId)
        }
      }

      if (v) {
        setVendor(v)
        setDescription(v.description || '')
        setContactPhone(v.contactPhone || '')
        setContactEmail(v.contactEmail || '')
      }

      // Get stores
      let stores = getStoresByVendor(user.vendorId)
      if (stores.length === 0) {
        stores = staticStores.filter((s) => s.vendorId === user.vendorId)
      }
      setVendorStores(stores)
    }
  }, [user?.vendorId, getVendorById, getStoresByVendor])

  const getStoreProductCount = (storeId: string) => {
    return products.filter((p) => p.storeId === storeId).length
  }

  const handleSaveDetails = () => {
    if (!user?.vendorId) return

    // Update in vendorStore
    updateVendor(user.vendorId, {
      description,
      contactPhone,
      contactEmail,
    })

    // Also update localStorage for newly registered vendors
    const storedVendors = localStorage.getItem('wurldbasket-vendors')
    if (storedVendors) {
      const parsedVendors = JSON.parse(storedVendors)
      const updatedVendors = parsedVendors.map((v: Vendor) =>
        v.id === user.vendorId
          ? { ...v, description, contactPhone, contactEmail }
          : v
      )
      localStorage.setItem('wurldbasket-vendors', JSON.stringify(updatedVendors))
    }

    setVendor((prev) => prev ? { ...prev, description, contactPhone, contactEmail } : prev)
    setIsEditingDetails(false)
    addToast('Business details updated', 'success')
  }

  const handleAddStore = () => {
    if (!user?.vendorId) return
    if (!newStoreName || !newStoreAddress || !newStoreCity || !newStorePostcode) {
      addToast('Please fill in all store details', 'error')
      return
    }

    const newStore = createStore(user.vendorId, {
      name: newStoreName,
      address: newStoreAddress,
      city: newStoreCity,
      postcode: newStorePostcode,
      coordinates: { lat: 51.5074, lng: -0.1278 }, // Default to London, would use geocoding in production
      openingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '17:00' },
        sunday: 'closed',
      },
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    })

    setVendorStores((prev) => [...prev, newStore])
    setIsAddingStore(false)
    setNewStoreName('')
    setNewStoreAddress('')
    setNewStoreCity('')
    setNewStorePostcode('')
    setStoreAddressSelected(false)
    addToast('Store location added', 'success')
  }

  const handleDeleteStore = (storeId: string) => {
    deleteStore(storeId)
    setVendorStores((prev) => prev.filter((s) => s.id !== storeId))
    addToast('Store location removed', 'success')
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Business</h1>
        <p className="text-gray-600">Manage your business details and store locations</p>
      </div>

      {/* Business Details Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-terracotta/10 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-terracotta" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{vendor?.name}</h2>
                <p className="text-sm text-gray-500">Business Profile</p>
              </div>
            </div>
            {!isEditingDetails && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingDetails(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {isEditingDetails ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your business..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+44 123 456 7890"
                  icon={<Phone className="h-5 w-5" />}
                />
                <Input
                  label="Contact Email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="info@yourbusiness.com"
                  icon={<Mail className="h-5 w-5" />}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSaveDetails}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditingDetails(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-gray-400 mt-1" />
                <p className="text-gray-600">
                  {vendor?.description || (
                    <span className="text-gray-400 italic">No description added yet</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-gray-600">
                  {vendor?.contactPhone || (
                    <span className="text-gray-400 italic">No phone number added</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-gray-600">
                  {vendor?.contactEmail || (
                    <span className="text-gray-400 italic">No email added</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store Locations Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Store Locations ({vendorStores.length})
        </h2>
        {!isAddingStore && (
          <Button onClick={() => setIsAddingStore(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Store
          </Button>
        )}
      </div>

      {/* Add Store Form */}
      {isAddingStore && (
        <Card className="mb-6 border-2 border-dashed border-terracotta/30">
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Add New Store Location</h3>
            <div className="space-y-4">
              <Input
                label="Store Name"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="e.g., Main Street Branch"
              />

              {/* Postcode Lookup */}
              <PostcodeLookup
                onAddressSelect={handleStoreAddressSelect}
                onManualEntry={() => setStoreAddressSelected(true)}
              />

              {/* Show selected address fields */}
              {storeAddressSelected && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <Input
                    label="Street Address"
                    value={newStoreAddress}
                    onChange={(e) => setNewStoreAddress(e.target.value)}
                    placeholder="123 Main Street"
                    icon={<MapPin className="h-5 w-5" />}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={newStoreCity}
                      onChange={(e) => setNewStoreCity(e.target.value)}
                      placeholder="London"
                    />
                    <Input
                      label="Postcode"
                      value={newStorePostcode}
                      onChange={(e) => setNewStorePostcode(e.target.value)}
                      placeholder="SW1A 1AA"
                      className="uppercase"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleAddStore} disabled={!storeAddressSelected}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsAddingStore(false)
                  setStoreAddressSelected(false)
                  setNewStoreName('')
                  setNewStoreAddress('')
                  setNewStoreCity('')
                  setNewStorePostcode('')
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stores Grid */}
      {vendorStores.length === 0 ? (
        <Card className="p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No store locations yet</h3>
          <p className="text-gray-500 mb-4">Add your first store location to get started</p>
          <Button onClick={() => setIsAddingStore(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Store Location
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendorStores.map((store) => {
            const productCount = getStoreProductCount(store.id)

            return (
              <Card key={store.id} className="overflow-hidden">
                {/* Store Image */}
                <div className="h-40 bg-gray-100">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {store.address}, {store.city} {store.postcode}
                      </p>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>

                  {/* Store Stats */}
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Package className="h-4 w-4" />
                      {productCount} products
                    </span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4" />
                      9am - 6pm
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${store.coordinates.lat},${store.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Map
                      </Button>
                    </a>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
