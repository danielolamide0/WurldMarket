import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** Store-like shape needed for effective-city calculation */
type StoreWithCity = { id: string; city: string; coordinates?: { lat: number; lng: number } | null }

/**
 * Get the city to use for filtering stores/products.
 * If the user's city has no stores, returns the closest city that has stores (by distance from user coordinates).
 */
export function getEffectiveCityForStores(
  userCity: string | null,
  userCoordinates: { lat: number; lng: number } | null,
  stores: StoreWithCity[]
): { city: string | null; isFallback: boolean } {
  if (!stores.length) return { city: null, isFallback: false }
  if (!userCity && !userCoordinates) return { city: null, isFallback: false }

  const userCityLower = userCity?.toLowerCase() ?? ''
  const hasStoresInUserCity = userCityLower && stores.some((s) => s.city.toLowerCase() === userCityLower)
  if (hasStoresInUserCity) return { city: userCity!, isFallback: false }

  if (!userCoordinates) return { city: null, isFallback: false }
  const withCoords = stores.filter(
    (s) => s.coordinates && typeof s.coordinates.lat === 'number' && typeof s.coordinates.lng === 'number'
  )
  if (!withCoords.length) return { city: null, isFallback: false }

  const { lat, lng } = userCoordinates
  const closest = withCoords.slice().sort((a, b) => {
    const distA = calculateDistance(lat, lng, a.coordinates!.lat, a.coordinates!.lng)
    const distB = calculateDistance(lat, lng, b.coordinates!.lat, b.coordinates!.lng)
    return distA - distB
  })[0]
  return { city: closest.city, isFallback: true }
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Calculate estimated delivery time range based on distance
 * Returns a formatted string like "10-20 mins" or "1-1.5hrs"
 */
export function calculateDeliveryTime(distanceInMiles: number): string {
  // Average delivery speed: 20-30 mph in urban areas (range for variability)
  const minSpeedMph = 20
  const maxSpeedMph = 30
  // Base preparation time: 8-12 minutes (variable)
  const minPrepMinutes = 8
  const maxPrepMinutes = 12
  
  // Calculate travel time ranges
  const minTravelMinutes = (distanceInMiles / maxSpeedMph) * 60 // Faster speed = less time
  const maxTravelMinutes = (distanceInMiles / minSpeedMph) * 60 // Slower speed = more time
  
  // Total time ranges
  const minTotalMinutes = minPrepMinutes + minTravelMinutes
  const maxTotalMinutes = maxPrepMinutes + maxTravelMinutes
  
  // Round to nearest 5 minutes for cleaner display
  const minRounded = Math.max(5, Math.round(minTotalMinutes / 5) * 5)
  const maxRounded = Math.round(maxTotalMinutes / 5) * 5
  
  // Format based on time range
  if (maxRounded < 60) {
    // Both under 60 minutes - show as "X-Y mins"
    return `${minRounded}-${maxRounded} mins`
  } else if (minRounded >= 60) {
    // Both over 60 minutes - show as hours
    const minHours = minRounded / 60
    const maxHours = maxRounded / 60
    // Round to nearest 0.5 hours
    const minHoursRounded = Math.round(minHours * 2) / 2
    const maxHoursRounded = Math.round(maxHours * 2) / 2
    
    if (minHoursRounded === maxHoursRounded) {
      return `${minHoursRounded}hr${minHoursRounded !== 1 ? 's' : ''}`
    }
    return `${minHoursRounded}-${maxHoursRounded}hrs`
  } else {
    // Mixed - min is under 60, max is over 60
    const maxHours = maxRounded / 60
    const maxHoursRounded = Math.round(maxHours * 2) / 2
    return `${minRounded} mins-${maxHoursRounded}hrs`
  }
}
