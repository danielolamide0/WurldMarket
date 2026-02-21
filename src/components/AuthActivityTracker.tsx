'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

/**
 * Tracks user activity and logs out after period of inactivity (customer and vendor).
 * Call touchSession on navigation and focus; run inactivity check on an interval.
 */
export function AuthActivityTracker() {
  const pathname = usePathname()
  const touchSession = useAuthStore((s) => s.touchSession)
  const checkInactivityAndLogout = useAuthStore((s) => s.checkInactivityAndLogout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return
    touchSession()
  }, [pathname, isAuthenticated, touchSession])

  useEffect(() => {
    if (!isAuthenticated) return
    const onFocus = () => touchSession()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [isAuthenticated, touchSession])

  useEffect(() => {
    if (!isAuthenticated) return
    const interval = setInterval(checkInactivityAndLogout, 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated, checkInactivityAndLogout])

  return null
}
