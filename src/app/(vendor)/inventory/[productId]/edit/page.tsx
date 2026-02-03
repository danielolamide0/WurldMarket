'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { CATEGORIES } from '@/lib/constants'
import { ProductCategory } from '@/types'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.productId as string
  const { user } = useAuthStore()
  const { getProductById, updateProduct, fetchProducts } = useProductStore()
  const { getStoresByVendor, fetchStores } = useVendorStore()
  const { addToast } = useToast()

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
    price: '',
    unit: '',
    stock: '',
    storeId: '',
    image: '',
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        unit: product.unit,
        stock: product.stock.toString(),
        storeId: product.storeId,
        image: product.image,
        isActive: product.isActive,
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

    if (!formData.name || !formData.price || !formData.unit || !formData.stock) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    setIsSubmitting(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    updateProduct(productId, {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: parseFloat(formData.price),
      unit: formData.unit,
      stock: parseInt(formData.stock),
      storeId: formData.storeId,
      image: formData.image,
      isActive: formData.isActive,
    })

    addToast('Product updated successfully!', 'success')
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
