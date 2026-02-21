'use client'

import { useState, useEffect } from 'react'
import {
  MapPin,
  Clock,
  ExternalLink,
  Package,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PostcodeLookup } from '@/components/address/PostcodeLookup'
import { StoreLocation } from '@/types'

export default function VendorStoresPage() {
  const { user } = useAuthStore()
  const { getStoresByVendor, createStore, deleteStore, fetchVendors, fetchStores } = useVendorStore()

  const [vendorStores, setVendorStores] = useState<StoreLocation[]>([])
  const [isAddingStore, setIsAddingStore] = useState(false)

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

  // Fetch data on mount
  useEffect(() => {
    if (user?.vendorId) {
      fetchVendors()
      fetchStores(user.vendorId)
    }
  }, [user?.vendorId, fetchVendors, fetchStores])

  // Load stores from store
  useEffect(() => {
    if (user?.vendorId) {
      const stores = getStoresByVendor(user.vendorId)
      setVendorStores(stores)
    }
  }, [user?.vendorId, getStoresByVendor])

  const getStoreProductCount = (storeId: string) => {
    return products.filter((p) => p.storeId === storeId).length
  }

  const handleAddStore = async () => {
    if (!user?.vendorId) return
    if (!newStoreName || !newStoreAddress || !newStoreCity || !newStorePostcode) {
      return
    }

    const newStore = await createStore(user.vendorId, {
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

    if (!newStore) {
      return
    }

    setVendorStores((prev) => [...prev, newStore])
    setIsAddingStore(false)
    setNewStoreName('')
    setNewStoreAddress('')
    setNewStoreCity('')
    setNewStorePostcode('')
    setStoreAddressSelected(false)
  }

  const handleDeleteStore = (storeId: string) => {
    deleteStore(storeId)
    setVendorStores((prev) => prev.filter((s) => s.id !== storeId))
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Stores</h1>
        <p className="text-gray-600">Manage your store locations</p>
      </div>

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
        <Card className="mb-6 border-2 border-dashed border-primary/30">
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
