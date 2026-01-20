'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Navigation, Clock, ExternalLink, Phone, ChevronRight } from 'lucide-react'
import { stores } from '@/data/stores'
import { vendors } from '@/data/users'
import { StoreLocation } from '@/types'
import { StoreMap } from '@/components/stores/StoreMap'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { calculateDistance } from '@/lib/utils'

export default function StoresPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const handleGetLocation = () => {
    setIsLocating(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsLocating(false)
      },
      (error) => {
        setLocationError('Unable to get your location. Please enable location services.')
        setIsLocating(false)
        console.error('Geolocation error:', error)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Sort stores by distance if user location is available
  const sortedStores = userLocation
    ? [...stores].sort((a, b) => {
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.coordinates.lat,
          a.coordinates.lng
        )
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.coordinates.lat,
          b.coordinates.lng
        )
        return distA - distB
      })
    : stores

  const getDistance = (store: StoreLocation) => {
    if (!userLocation) return null
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      store.coordinates.lat,
      store.coordinates.lng
    )
    return distance.toFixed(1)
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Stores Near You</h1>
          <p className="text-gray-600">Discover African supermarkets in your area</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Location Button */}
        <div className="mb-6">
          <Button
            onClick={handleGetLocation}
            isLoading={isLocating}
            variant={userLocation ? 'secondary' : 'primary'}
            className="w-full sm:w-auto"
          >
            <Navigation className="h-4 w-4 mr-2" />
            {userLocation ? 'Location Found' : 'Use My Location'}
          </Button>
          {locationError && (
            <p className="text-sm text-red-600 mt-2">{locationError}</p>
          )}
          {userLocation && (
            <p className="text-sm text-forest mt-2">
              Showing stores sorted by distance from your location
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="h-[400px] lg:h-[600px] rounded-2xl overflow-hidden shadow-lg">
            <StoreMap
              stores={stores}
              userLocation={userLocation}
              selectedStoreId={selectedStore?.id}
              onStoreSelect={(store) => setSelectedStore(store)}
            />
          </div>

          {/* Store List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {stores.length} Stores Available
            </h2>

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
              {sortedStores.map((store) => {
                const vendor = vendors.find((v) => v.id === store.vendorId)
                const distance = getDistance(store)
                const isSelected = selectedStore?.id === store.id

                return (
                  <Card
                    key={store.id}
                    className={`overflow-hidden cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-terracotta shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedStore(store)}
                  >
                    <div className="flex">
                      {/* Store Image */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 flex-shrink-0">
                        <img
                          src={store.image}
                          alt={store.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{store.name}</h3>
                            <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {store.address}, {store.postcode}
                            </p>
                          </div>
                          <Badge variant="success" size="sm">Open</Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {distance && (
                            <span className="text-terracotta font-medium">
                              {distance} miles away
                            </span>
                          )}
                          <span className="text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            9am - 9pm
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          <Link href={`/stores/${store.id}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              View Products
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
