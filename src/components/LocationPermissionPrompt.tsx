'use client'

import { useEffect, useState } from 'react'
import { MapPin, X } from 'lucide-react'
import { useLocationStore } from '@/stores/locationStore'
import { Button } from '@/components/ui/button'

export function LocationPermissionPrompt() {
  const { permissionStatus, requestLocation, isLoading } = useLocationStore()
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed or granted/denied
    const hasInteracted = sessionStorage.getItem('location-prompt-interacted')

    if (hasInteracted) {
      setShowPrompt(false)
      return
    }

    // Show prompt after a short delay if permission is unknown or prompt
    if (permissionStatus === 'unknown' || permissionStatus === 'prompt') {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [permissionStatus])

  const handleAllow = async () => {
    await requestLocation()
    sessionStorage.setItem('location-prompt-interacted', 'true')
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem('location-prompt-interacted', 'true')
    setDismissed(true)
    setShowPrompt(false)
  }

  if (!showPrompt || dismissed || permissionStatus === 'granted' || permissionStatus === 'denied') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-cream border border-gray-200 rounded-xl shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Enable location</h3>
          <p className="text-xs text-gray-500 mt-1">
            See products from stores near you and get faster delivery estimates.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleAllow}
              disabled={isLoading}
              className="text-xs"
            >
              {isLoading ? 'Getting location...' : 'Allow'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="text-xs"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
