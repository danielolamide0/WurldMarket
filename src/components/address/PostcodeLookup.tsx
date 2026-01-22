'use client'

import { useState } from 'react'
import { Search, MapPin, Loader2, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Address {
  line1: string
  line2?: string
  city: string
  postcode: string
  fullAddress: string
}

interface PostcodeLookupProps {
  onAddressSelect: (address: Address) => void
  initialPostcode?: string
}

// Simulated UK address lookup - In production, replace with real API like GetAddress.io or Ideal Postcodes
async function lookupPostcode(postcode: string): Promise<Address[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Clean postcode
  const cleanPostcode = postcode.toUpperCase().replace(/\s+/g, '')

  // Validate UK postcode format
  const postcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/
  if (!postcodeRegex.test(cleanPostcode)) {
    throw new Error('Please enter a valid UK postcode')
  }

  // Format postcode properly (e.g., SW1A1AA -> SW1A 1AA)
  const formattedPostcode = cleanPostcode.slice(0, -3) + ' ' + cleanPostcode.slice(-3)

  // Simulated addresses for demo - In production, this would come from a real API
  // Using realistic UK address patterns
  const streetNames = [
    'High Street',
    'Station Road',
    'Church Lane',
    'Victoria Road',
    'Green Lane',
    'Manor Road',
    'Park Avenue',
    'Queens Road',
    'Kings Road',
    'Mill Lane',
  ]

  const buildingTypes = [
    { prefix: '', suffix: '' },
    { prefix: 'Flat 1, ', suffix: '' },
    { prefix: 'Flat 2, ', suffix: '' },
    { prefix: '', suffix: ' House' },
    { prefix: 'Ground Floor, ', suffix: '' },
  ]

  // Determine city based on postcode area
  const postcodeArea = cleanPostcode.slice(0, 2)
  const cities: Record<string, string> = {
    'SW': 'London',
    'SE': 'London',
    'E1': 'London',
    'E2': 'London',
    'EC': 'London',
    'WC': 'London',
    'W1': 'London',
    'N1': 'London',
    'NW': 'London',
    'LS': 'Leeds',
    'M1': 'Manchester',
    'M2': 'Manchester',
    'B1': 'Birmingham',
    'B2': 'Birmingham',
    'BS': 'Bristol',
    'EH': 'Edinburgh',
    'G1': 'Glasgow',
    'G2': 'Glasgow',
    'CF': 'Cardiff',
    'SO': 'Southampton',
    'PO': 'Portsmouth',
    'OX': 'Oxford',
    'CB': 'Cambridge',
    'NG': 'Nottingham',
    'LE': 'Leicester',
    'CV': 'Coventry',
    'L1': 'Liverpool',
    'L2': 'Liverpool',
  }

  const city = cities[postcodeArea] || cities[cleanPostcode.charAt(0)] || 'London'

  // Generate realistic addresses
  const addresses: Address[] = []
  const usedNumbers = new Set<number>()

  for (let i = 0; i < 6; i++) {
    let houseNumber: number
    do {
      houseNumber = Math.floor(Math.random() * 150) + 1
    } while (usedNumbers.has(houseNumber))
    usedNumbers.add(houseNumber)

    const street = streetNames[i % streetNames.length]
    const building = buildingTypes[i % buildingTypes.length]
    const line1 = `${building.prefix}${houseNumber}${building.suffix} ${street}`

    addresses.push({
      line1,
      city,
      postcode: formattedPostcode,
      fullAddress: `${line1}, ${city} ${formattedPostcode}`,
    })
  }

  // Sort by house number
  return addresses.sort((a, b) => {
    const numA = parseInt(a.line1.match(/\d+/)?.[0] || '0')
    const numB = parseInt(b.line1.match(/\d+/)?.[0] || '0')
    return numA - numB
  })
}

export function PostcodeLookup({ onAddressSelect, initialPostcode = '' }: PostcodeLookupProps) {
  const [postcode, setPostcode] = useState(initialPostcode)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [manualEntry, setManualEntry] = useState(false)

  const handleSearch = async () => {
    if (!postcode.trim()) {
      setError('Please enter a postcode')
      return
    }

    setIsLoading(true)
    setError(null)
    setAddresses([])
    setSelectedAddress(null)

    try {
      const results = await lookupPostcode(postcode)
      setAddresses(results)
      setShowDropdown(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup postcode')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address)
    setShowDropdown(false)
    onAddressSelect(address)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* Postcode Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postcode
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={postcode}
              onChange={(e) => {
                setPostcode(e.target.value.toUpperCase())
                setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g., SW1A 1AA"
              icon={<MapPin className="h-5 w-5" />}
              className="uppercase"
            />
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>

      {/* Address Dropdown */}
      {showDropdown && addresses.length > 0 && (
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select your address
          </label>
          <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-lg max-h-64 overflow-y-auto">
            {addresses.map((address, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectAddress(address)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0 transition-colors ${
                  selectedAddress?.fullAddress === address.fullAddress ? 'bg-terracotta/5' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{address.line1}</p>
                    <p className="text-sm text-gray-500">{address.city} {address.postcode}</p>
                  </div>
                </div>
                {selectedAddress?.fullAddress === address.fullAddress && (
                  <Check className="h-5 w-5 text-terracotta flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Can't find address option */}
          <button
            type="button"
            onClick={() => {
              setManualEntry(true)
              setShowDropdown(false)
            }}
            className="w-full mt-2 text-sm text-terracotta hover:underline text-center py-2"
          >
            Can&apos;t find your address? Enter manually
          </button>
        </div>
      )}

      {/* Selected Address Display */}
      {selectedAddress && !showDropdown && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{selectedAddress.line1}</p>
                <p className="text-sm text-gray-600">{selectedAddress.city} {selectedAddress.postcode}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowDropdown(true)
              }}
              className="text-sm text-terracotta hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Notice */}
      {manualEntry && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm text-amber-800">
            Please fill in your address details below. Make sure the address is accurate for delivery.
          </p>
        </div>
      )}
    </div>
  )
}
