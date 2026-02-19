import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LocationState {
  // Geolocation data
  coordinates: { lat: number; lng: number } | null
  city: string | null
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown'
  isLoading: boolean
  error: string | null

  // Actions
  requestLocation: () => Promise<void>
  setPermissionStatus: (status: 'prompt' | 'granted' | 'denied' | 'unknown') => void
  clearLocation: () => void
}

// Reverse geocode to get city from coordinates
async function getCityFromCoordinates(lat: number, lng: number): Promise<string | null> {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key needed)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: {
          'User-Agent': 'WurldBasket/1.0',
        },
      }
    )
    const data = await response.json()

    // Try to get city from various fields
    const city = data.address?.city ||
                 data.address?.town ||
                 data.address?.village ||
                 data.address?.municipality ||
                 data.address?.county ||
                 null

    return city
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return null
  }
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      coordinates: null,
      city: null,
      permissionStatus: 'unknown',
      isLoading: false,
      error: null,

      requestLocation: async () => {
        if (!navigator.geolocation) {
          set({ error: 'Geolocation is not supported by your browser', permissionStatus: 'denied' })
          return
        }

        set({ isLoading: true, error: null })

        try {
          // Check permission status first
          if (navigator.permissions) {
            const permission = await navigator.permissions.query({ name: 'geolocation' })
            set({ permissionStatus: permission.state as 'prompt' | 'granted' | 'denied' })

            // Listen for permission changes
            permission.onchange = () => {
              set({ permissionStatus: permission.state as 'prompt' | 'granted' | 'denied' })
            }
          }

          // Request position
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 300000, // 5 minutes cache
            })
          })

          const { latitude: lat, longitude: lng } = position.coords
          const city = await getCityFromCoordinates(lat, lng)

          set({
            coordinates: { lat, lng },
            city,
            permissionStatus: 'granted',
            isLoading: false,
            error: null,
          })
        } catch (error) {
          const geoError = error as GeolocationPositionError
          let errorMessage = 'Failed to get location'
          let status: 'denied' | 'unknown' = 'unknown'

          if (geoError.code === geoError.PERMISSION_DENIED) {
            errorMessage = 'Location permission denied'
            status = 'denied'
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            errorMessage = 'Location unavailable'
          } else if (geoError.code === geoError.TIMEOUT) {
            errorMessage = 'Location request timed out'
          }

          set({
            error: errorMessage,
            permissionStatus: status,
            isLoading: false,
          })
        }
      },

      setPermissionStatus: (status) => {
        set({ permissionStatus: status })
      },

      clearLocation: () => {
        set({
          coordinates: null,
          city: null,
          permissionStatus: 'unknown',
          error: null,
        })
      },
    }),
    {
      name: 'wurldbasket-location',
      partialize: (state) => ({
        coordinates: state.coordinates,
        city: state.city,
        permissionStatus: state.permissionStatus,
      }),
    }
  )
)

// Helper hook to get active location (primary address for logged in, geolocation for guests)
export function useActiveLocation(
  isAuthenticated: boolean,
  primaryAddress?: { city: string; coordinates?: { lat: number; lng: number } } | null
) {
  const { city: geoCity, coordinates: geoCoordinates } = useLocationStore()

  if (isAuthenticated && primaryAddress) {
    return {
      city: primaryAddress.city,
      coordinates: primaryAddress.coordinates || null,
      source: 'primary-address' as const,
    }
  }

  if (geoCity && geoCoordinates) {
    return {
      city: geoCity,
      coordinates: geoCoordinates,
      source: 'geolocation' as const,
    }
  }

  return {
    city: null,
    coordinates: null,
    source: null,
  }
}
