'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag, Upload, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CATEGORIES } from '@/lib/constants'
import { ProductCategory, CuisineType } from '@/types'
import { Check } from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const addProduct = useProductStore((state) => state.addProduct)

  const vendorStores = useVendorStore((state) => state.getStoresByVendor(user?.vendorId || ''))
  const fetchStores = useVendorStore((state) => state.fetchStores)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'grains-rice' as ProductCategory,
    cuisines: [] as CuisineType[],
    price: '',
    unit: '',
    stock: '',
    storeId: '',
    image: '',
    isOnOffer: false,
    originalPrice: '',
    offerEndDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const CUISINES: { value: CuisineType; label: string }[] = [
    { value: 'african', label: 'African' },
    { value: 'caribbean', label: 'Caribbean' },
    { value: 'south-asian', label: 'South Asian' },
    { value: 'east-asian', label: 'East Asian' },
    { value: 'middle-eastern', label: 'Middle Eastern' },
    { value: 'eastern-european', label: 'Eastern European' },
  ]

  const toggleCuisine = (cuisine: CuisineType) => {
    setFormData((prev) => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter((c) => c !== cuisine)
        : [...prev.cuisines, cuisine],
    }))
  }

  // Fetch stores on mount and set default storeId
  useEffect(() => {
    if (user?.vendorId) {
      fetchStores(user.vendorId)
    }
  }, [user?.vendorId, fetchStores])

  // Set default storeId when stores are loaded
  useEffect(() => {
    if (vendorStores.length > 0 && !formData.storeId) {
      setFormData((prev) => ({ ...prev, storeId: vendorStores[0].id }))
    }
  }, [vendorStores, formData.storeId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setIsUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      const data = await res.json()
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }))
      }
    } finally {
      setIsUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.unit || !formData.stock || !formData.storeId || formData.cuisines.length === 0 || !formData.image) {
      return
    }

    setIsSubmitting(true)

    const newProduct = await addProduct({
      vendorId: user?.vendorId || '',
      storeId: formData.storeId,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      cuisines: formData.cuisines,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock: parseInt(formData.stock),
      image: formData.image,
      isActive: true,
      isOnOffer: formData.isOnOffer,
      originalPrice: formData.isOnOffer && formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      offerEndDate: formData.isOnOffer && formData.offerEndDate ? formData.offerEndDate : undefined,
    })

    if (newProduct) {
      router.push('/inventory')
    } else {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/inventory"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name *"
                placeholder="e.g., Premium Jollof Rice Mix"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Select
                label="Store *"
                value={formData.storeId}
                onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                options={vendorStores.map((store) => ({
                  value: store.id,
                  label: store.name,
                }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Describe your product..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Category *"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                options={CATEGORIES.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                required
              />
            </div>

            {/* Cuisines Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Find Your Flavour (Cuisines) * <span className="text-gray-500 text-xs">(Select at least one, can select multiple)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                {CUISINES.map((cuisine) => {
                  const isSelected = formData.cuisines.includes(cuisine.value)
                  return (
                    <button
                      key={cuisine.value}
                      type="button"
                      onClick={() => toggleCuisine(cuisine.value)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="font-medium">{cuisine.label}</span>
                    </button>
                  )
                })}
              </div>
              {formData.cuisines.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Please select at least one cuisine</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <Input
                label="Price (GBP) *"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />

              <Input
                label="Unit *"
                placeholder="e.g., 500g, per kg, 6 pack"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Initial Stock *"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Image *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                  <span>{isUploadingImage ? 'Uploading...' : 'Upload image'}</span>
                </button>
                {!formData.image && (
                  <p className="text-sm text-gray-500 mt-1">JPEG, PNG, WebP or GIF, max 5MB</p>
                )}
              </div>
            </div>

            {/* Preview */}
            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image Preview
                </label>
                <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=No+Image'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Offer Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Offers Ending Soon</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Add this product to the &quot;Offers ending soon&quot; section on the homepage to attract more customers.
              </p>

              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={formData.isOnOffer}
                  onChange={(e) => setFormData({ ...formData, isOnOffer: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="font-medium text-gray-700">Add to Offers Ending Soon</span>
              </label>

              {formData.isOnOffer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <Input
                    label="Original Price (before discount) *"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    required={formData.isOnOffer}
                  />
                  <Input
                    label="Offer End Date *"
                    type="date"
                    value={formData.offerEndDate}
                    onChange={(e) => setFormData({ ...formData, offerEndDate: e.target.value })}
                    required={formData.isOnOffer}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" isLoading={isSubmitting}>
                Add Product
              </Button>
              <Link href="/inventory">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
