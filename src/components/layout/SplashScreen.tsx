'use client'

import { useState, useEffect } from 'react'

interface SplashScreenProps {
  onComplete?: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 2000)

    // Hide completely after fade animation (2.5 seconds total)
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 2500)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background Image - Spices */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&q=80')`,
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Logo Container with glassmorphism effect */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-cream/20 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/30 flex items-center gap-4">
          <img
            src="/WurldBAsketLogo.png"
            alt="WurldBasket"
            className="h-20 w-auto"
          />
          <img
            src="/WurldBasketText.png"
            alt="WurldBasket"
            className="h-12 w-auto"
          />
        </div>
        {/* Loading indicator */}
        <div className="flex gap-1.5 mt-6">
          <div className="w-2.5 h-2.5 bg-cream rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-cream rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-cream rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
