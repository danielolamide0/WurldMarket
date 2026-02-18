'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'

// Reduced cuisine types - 6 regions equidistant
const CUISINES = [
  { id: 'african', name: 'African', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=african' },
  { id: 'east-asian', name: 'East Asian', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200', href: '/search?q=chinese' },
  { id: 'caribbean', name: 'Caribbean', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200', href: '/search?q=caribbean' },
  { id: 'middle-eastern', name: 'Middle Eastern', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200', href: '/search?q=middle+eastern' },
  { id: 'south-asian', name: 'South Asian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200', href: '/search?q=indian' },
  { id: 'eastern-european', name: 'Eastern European', image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=200', href: '/search?q=eastern+european' },
]

export function OrbitingGlobe() {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startRotation, setStartRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const buttonAnimationRef = useRef<number | null>(null)
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-rotate when not dragging, not using buttons, and not paused
  useEffect(() => {
    if (!isDragging && !isButtonPressed && !isPaused) {
      const animate = () => {
        setRotation(prev => (prev + 0.3) % 360)
        animationRef.current = requestAnimationFrame(animate)
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isDragging, isButtonPressed, isPaused])

  // Button press animation - both arrows rotate anticlockwise
  useEffect(() => {
    if (isButtonPressed) {
      const animate = () => {
        // Both arrows rotate anticlockwise (decrease rotation)
        setRotation(prev => (prev - 1.5 + 360) % 360)
        buttonAnimationRef.current = requestAnimationFrame(animate)
      }
      buttonAnimationRef.current = requestAnimationFrame(animate)
    }
    return () => {
      if (buttonAnimationRef.current) {
        cancelAnimationFrame(buttonAnimationRef.current)
      }
    }
  }, [isButtonPressed])

  const handleButtonDown = useCallback(() => {
    // Clear any pending resume timeout
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }
    setIsPaused(false)
    setIsButtonPressed(true)
  }, [])

  const handleButtonUp = useCallback(() => {
    setIsButtonPressed(false)
    // Pause auto-rotation for 3 seconds after releasing button
    setIsPaused(true)
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false)
    }, 3000)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current)
      }
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on a link
    if ((e.target as HTMLElement).closest('a')) return
    setIsDragging(true)
    setStartX(e.clientX)
    setStartRotation(rotation)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    // Swipe left = clockwise (increase), swipe right = anticlockwise (decrease)
    setRotation((startRotation - deltaX * 0.5 + 360) % 360)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start dragging if touching a link
    if ((e.target as HTMLElement).closest('a')) return
    // Prevent page scrolling immediately
    e.preventDefault()
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setStartRotation(rotation)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // Always prevent page scrolling when touching the globe area
    e.preventDefault()
    if (!isDragging) return
    const deltaX = e.touches[0].clientX - startX
    // Swipe left = clockwise (increase), swipe right = anticlockwise (decrease)
    setRotation((startRotation - deltaX * 0.5 + 360) % 360)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Calculate position for each cuisine - orbit from top-right to bottom-left
  const getOrbitPosition = (index: number, total: number) => {
    const angleOffset = (360 / total) * index
    const angle = ((rotation + angleOffset) % 360) * (Math.PI / 180)

    // Ellipse parameters
    const radiusX = 160
    const radiusY = 80

    // Calculate base position on ellipse
    const baseX = Math.cos(angle) * radiusX
    const baseY = Math.sin(angle) * radiusY

    // Apply -45 degree tilt (from top-right to bottom-left)
    const tiltAngle = -45 * (Math.PI / 180)
    const x = baseX * Math.cos(tiltAngle) - baseY * Math.sin(tiltAngle)
    const y = baseX * Math.sin(tiltAngle) + baseY * Math.cos(tiltAngle)

    // Z-depth for 3D effect
    const z = Math.sin(angle)

    // Scale based on depth
    const scale = 0.65 + (z + 1) * 0.2

    // Opacity - fade out when going behind globe
    const opacity = z < -0.2 ? 0 : z < 0.1 ? (z + 0.2) / 0.3 : 1

    // Z-index
    const zIndex = z > 0 ? 30 : 5

    return { x, y, scale, opacity, zIndex, z }
  }

  return (
    <section className="py-1 overflow-hidden md:hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div
          ref={containerRef}
          className="relative select-none"
          style={{
            height: '260px',
          }}
        >
          {/* Touch area for globe/orbit - covers right 70% where globe and orbits are */}
          <div
            className="absolute z-10"
            style={{
              top: 0,
              right: 0,
              width: '75%',
              height: '100%',
              touchAction: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Up arrow - above "Find Your Flavour" text */}
          <button
            className="absolute z-40 p-2 select-none"
            style={{ top: '10%', left: '20%', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
            onMouseDown={handleButtonDown}
            onMouseUp={handleButtonUp}
            onMouseLeave={handleButtonUp}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleButtonDown(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleButtonUp(); }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <img
              src="/arrow-up.png"
              alt=""
              className={`w-10 h-auto transition-opacity pointer-events-none ${isButtonPressed ? 'opacity-100' : 'opacity-60'}`}
              draggable={false}
              style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
            />
          </button>

          {/* Find Your Flavour - horizontal, left side, aligned with globe center */}
          <div
            className="absolute left-0 z-10"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <img
              src="/find-your-flavour.png"
              alt="Find Your Flavour"
              className="h-4"
              draggable={false}
            />
          </div>

          {/* Down arrow - bottom right */}
          <button
            className="absolute bottom-2 right-4 z-40 p-2 select-none"
            style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}
            onMouseDown={handleButtonDown}
            onMouseUp={handleButtonUp}
            onMouseLeave={handleButtonUp}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); handleButtonDown(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); handleButtonUp(); }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <img
              src="/arrow-down.png"
              alt=""
              className={`w-10 h-auto transition-opacity pointer-events-none ${isButtonPressed ? 'opacity-100' : 'opacity-60'}`}
              draggable={false}
              style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
            />
          </button>

          {/* Globe - positioned to the right */}
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              width: '150px',
              height: '150px',
              top: '50%',
              left: '55%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src="/globe.png"
              alt="Globe"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>

          {/* Orbiting cuisines - orbit around globe position (55% from left) */}
          {CUISINES.map((cuisine, index) => {
            const { x, y, scale, opacity, zIndex } = getOrbitPosition(index, CUISINES.length)

            return (
              <Link
                key={cuisine.id}
                href={cuisine.href}
                className="absolute transition-opacity duration-200"
                style={{
                  left: '55%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${x}%, ${y}%) scale(${scale})`,
                  opacity,
                  zIndex,
                  pointerEvents: opacity < 0.5 ? 'none' : 'auto',
                }}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 bg-white shadow-lg">
                    <img
                      src={cuisine.image}
                      alt={cuisine.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                    {cuisine.name}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
