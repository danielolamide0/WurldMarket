'use client'

import { MapPin, Clock, ExternalLink, Package } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useProductStore } from '@/stores/productStore'
import { stores } from '@/data/stores'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function VendorStoresPage() {
  const { user } = useAuthStore()
  const vendorStores = stores.filter((s) => s.vendorId === user?.vendorId)
  const products = useProductStore((state) =>
    user?.vendorId ? state.getProductsByVendor(user.vendorId) : []
  )

  const getStoreProductCount = (storeId: string) => {
    return products.filter((p) => p.storeId === storeId).length
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Stores</h1>
        <p className="text-gray-600">{vendorStores.length} store location{vendorStores.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Stores Grid */}
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
                    9am - 9pm
                  </span>
                </div>

                {/* Opening Hours */}
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Opening Hours</h4>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {Object.entries(store.openingHours).slice(0, 4).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-gray-600">
                        <span className="capitalize">{day.slice(0, 3)}</span>
                        <span>
                          {typeof hours === 'string' ? hours : `${hours.open}-${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
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
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="mt-6 p-4 bg-blue-50 border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>Need to update store details?</strong> Contact our support team to modify your store information, add new locations, or update opening hours.
        </p>
      </Card>
    </div>
  )
}
