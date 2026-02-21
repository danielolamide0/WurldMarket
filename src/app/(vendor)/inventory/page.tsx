'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { useVendorStore } from '@/stores/vendorStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { formatPrice } from '@/lib/utils'
import { CATEGORY_MAP } from '@/lib/constants'

function InventoryContent() {
  const { user } = useAuthStore()
  const searchParams = useSearchParams()
  const filterLowStock = searchParams.get('filter') === 'lowStock'

  const allProducts = useProductStore((state) =>
    user?.vendorId ? state.getProductsByVendor(user.vendorId) : []
  )
  const lowStockProducts = useProductStore((state) =>
    user?.vendorId ? state.getLowStockProducts(user.vendorId) : []
  )
  const products = filterLowStock ? lowStockProducts : allProducts

  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const deleteProduct = useProductStore((state) => state.deleteProduct)
  const updateProduct = useProductStore((state) => state.updateProduct)

  const vendorStores = useVendorStore((state) => state.getStoresByVendor(user?.vendorId || ''))
  const fetchStores = useVendorStore((state) => state.fetchStores)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editStock, setEditStock] = useState<{ id: string; stock: number } | null>(null)

  // Fetch data on mount
  useEffect(() => {
    if (user?.vendorId) {
      fetchProducts({ vendorId: user.vendorId })
      fetchStores(user.vendorId)
    }
  }, [user?.vendorId, fetchProducts, fetchStores])

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStore = selectedStore === 'all' || product.storeId === selectedStore
    return matchesSearch && matchesStore
  })

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteProduct(deleteConfirm)
      setDeleteConfirm(null)
    }
  }

  const handleUpdateStock = () => {
    if (editStock) {
      updateProduct(editStock.id, { stock: editStock.stock })
      setEditStock(null)
    }
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5 text-primary" />
        </Link>
        <Link href="/inventory/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-5 w-5" />}
            />
          </div>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-cream focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Stores</option>
            {vendorStores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Products Table/Grid */}
      {filteredProducts.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          {!filterLowStock && (
            <>
              <p className="text-gray-500 mb-6">
                {searchQuery ? 'Try a different search term' : 'Start by adding your first product'}
              </p>
              <Link href="/inventory/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </Link>
            </>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Store</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const store = vendorStores.find((s) => s.id === product.storeId)
                    const isLowStock = (product.lowStockAlert ?? 0) > 0 && product.stock <= (product.lowStockAlert ?? 0)

                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.unit}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" size="sm">
                            {CATEGORY_MAP[product.category]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {store?.name.split(' - ')[1] || store?.name}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setEditStock({ id: product.id, stock: product.stock })}
                            className="flex items-center gap-2"
                          >
                            {isLowStock ? (
                              <Badge variant="warning" size="sm">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {product.stock}
                              </Badge>
                            ) : (
                              <Badge variant="success" size="sm">{product.stock}</Badge>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/inventory/${product.id}/edit`}>
                              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                                <Edit className="h-4 w-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filteredProducts.map((product) => {
              const store = vendorStores.find((s) => s.id === product.storeId)
              const isLowStock = (product.lowStockAlert ?? 0) > 0 && product.stock <= (product.lowStockAlert ?? 0)

              return (
                <Card key={product.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.unit}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary font-medium">{formatPrice(product.price)}</span>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setEditStock({ id: product.id, stock: product.stock })}>
                          {isLowStock ? (
                            <Badge variant="warning" size="sm">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {product.stock} left
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm">{product.stock} in stock</Badge>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link href={`/inventory/${product.id}/edit`}>
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Edit Stock Modal */}
      <Modal
        isOpen={!!editStock}
        onClose={() => setEditStock(null)}
        title="Update Stock"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stock Quantity
          </label>
          <input
            type="number"
            min="0"
            value={editStock?.stock || 0}
            onChange={(e) => setEditStock(prev => prev ? { ...prev, stock: parseInt(e.target.value) || 0 } : null)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setEditStock(null)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStock}>
            Update
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-4 lg:p-8 flex items-center justify-center min-h-[200px]">Loading...</div>}>
      <InventoryContent />
    </Suspense>
  )
}
