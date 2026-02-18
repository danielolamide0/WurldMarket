'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// Cuisine types for the orbit
const CUISINES = [
  { id: 'chinese', name: 'Chinese', image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200', href: '/search?q=chinese' },
  { id: 'african', name: 'African', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=african' },
  { id: 'nigerian', name: 'Nigerian', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=nigerian' },
  { id: 'ghanaian', name: 'Ghanaian', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200', href: '/search?q=ghanaian' },
  { id: 'pakistani', name: 'Pakistani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200', href: '/search?q=pakistani' },
  { id: 'indian', name: 'Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200', href: '/search?q=indian' },
  { id: 'caribbean', name: 'Caribbean', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=200', href: '/search?q=caribbean' },
  { id: 'persian', name: 'Persian', image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200', href: '/search?q=persian' },
  { id: 'turkish', name: 'Turkish', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200', href: '/search?q=turkish' },
]

export function OrbitingGlobe() {
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startRotation, setStartRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  // Auto-rotate when not dragging
  useEffect(() => {
    if (!isDragging) {
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
  }, [isDragging])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setStartRotation(rotation)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startX
    setRotation((startRotation + deltaX * 0.5) % 360)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setStartRotation(rotation)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaX = e.touches[0].clientX - startX
    setRotation((startRotation + deltaX * 0.5) % 360)
  }

  const handleTouchEnd = () => {
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
        {/* Find Your Flavour title image */}
        <div className="flex justify-center mb-1">
          <img
            src="/find-your-flavour.png"
            alt="Find Your Flavour"
            className="h-5"
            draggable={false}
          />
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto cursor-grab active:cursor-grabbing select-none"
          style={{
            height: '260px',
            maxWidth: '400px',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Up arrow - top left */}
          <img
            src="/arrow-up.png"
            alt=""
            className="absolute top-2 left-4 w-12 h-auto opacity-60"
            draggable={false}
          />

          {/* Down arrow - bottom right */}
          <img
            src="/arrow-down.png"
            alt=""
            className="absolute bottom-4 right-4 w-12 h-auto opacity-60"
            draggable={false}
          />

          {/* Globe in center */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              width: '150px',
              height: '150px',
            }}
          >
            <img
              src="/globe.png"
              alt="Globe"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>

          {/* Orbiting cuisines */}
          {CUISINES.map((cuisine, index) => {
            const { x, y, scale, opacity, zIndex } = getOrbitPosition(index, CUISINES.length)

            return (
              <Link
                key={cuisine.id}
                href={cuisine.href}
                className="absolute left-1/2 top-1/2 transition-opacity duration-200"
                style={{
                  transform: `translate(-50%, -50%) translate(${x}%, ${y}%) scale(${scale})`,
                  opacity,
                  zIndex,
                  pointerEvents: opacity < 0.5 ? 'none' : 'auto',
                }}
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault()
                  }
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
