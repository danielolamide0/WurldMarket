'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
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

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.productId as string
  const { user } = useAuthStore()
  const { getProductById, updateProduct, fetchProducts } = useProductStore()
  const { getStoresByVendor, fetchStores } = useVendorStore()

  const product = getProductById(productId)
  const vendorStores = getStoresByVendor(user?.vendorId || '')

  // Fetch data on mount
  useEffect(() => {
    if (user?.vendorId) {
      fetchProducts({ vendorId: user.vendorId })
      fetchStores(user.vendorId)
    }
  }, [user?.vendorId, fetchProducts, fetchStores])

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
    isActive: true,
    isOnOffer: false,
    originalPrice: '',
    offerEndDate: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        cuisines: product.cuisines || [],
        price: product.price.toString(),
        unit: product.unit,
        stock: product.stock.toString(),
        storeId: product.storeId,
        image: product.image,
        isActive: product.isActive,
        isOnOffer: product.isOnOffer || false,
        originalPrice: product.originalPrice?.toString() || '',
        offerEndDate: product.offerEndDate ? product.offerEndDate.split('T')[0] : '',
      })
    }
  }, [product])

  if (!product) {
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <Link href="/inventory">
            <Button>Back to Inventory</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.unit || !formData.stock || formData.cuisines.length === 0) {
      return
    }

    setIsSubmitting(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    updateProduct(productId, {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      cuisines: formData.cuisines,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock: parseInt(formData.stock),
      storeId: formData.storeId,
      image: formData.image,
      isActive: formData.isActive,
      isOnOffer: formData.isOnOffer,
      originalPrice: formData.isOnOffer && formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      offerEndDate: formData.isOnOffer && formData.offerEndDate ? formData.offerEndDate : undefined,
    })

    router.push('/inventory')
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
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
                label="Stock Quantity *"
                type="number"
                min="0"
                placeholder="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />

              <Input
                label="Image URL"
                type="url"
                placeholder="https://..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-cream after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                Product is {formData.isActive ? 'Active' : 'Inactive'}
              </span>
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
                Save Changes
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
