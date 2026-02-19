'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Banner data - update these to change the adverts
const BANNERS = [
  {
    id: 1,
    image: '/banners/banner1.jpg',
    title: 'Welcome to WurldBasket',
    subtitle: 'Fresh groceries from around the world',
    link: '/stores',
    bgColor: '#636B2F', // Primary olive green
  },
  {
    id: 2,
    image: '/banners/banner2.jpg',
    title: 'Free Delivery',
    subtitle: 'On orders over £50',
    link: '/stores',
    bgColor: '#3D4127', // Dark olive
  },
  {
    id: 3,
    image: '/banners/banner3.jpg',
    title: 'Fresh Deals Weekly',
    subtitle: 'Check out our latest offers',
    link: '/offers',
    bgColor: '#BAC095', // Light olive
  },
]

interface BannerCarouselProps {
  className?: string
}

export function BannerCarousel({ className = '' }: BannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  const totalSlides = BANNERS.length

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 5000) // Change slide every 5 seconds
  }, [totalSlides])

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }, [])

  useEffect(() => {
    startAutoPlay()
    return () => stopAutoPlay()
  }, [startAutoPlay, stopAutoPlay])

  // Touch/Mouse handlers for swiping
  const handleDragStart = (clientX: number) => {
    setIsDragging(true)
    setStartX(clientX)
    setTranslateX(0)
    stopAutoPlay()
  }

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return
    const diff = clientX - startX
    setTranslateX(diff)
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    const threshold = 50 // Minimum swipe distance to change slide

    if (translateX > threshold && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    } else if (translateX < -threshold && currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    }

    setTranslateX(0)
    startAutoPlay()
  }

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    stopAutoPlay()
    startAutoPlay()
  }

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Slides container */}
      <div
        ref={containerRef}
        className="relative h-48 md:h-64 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${currentSlide * 100}% + ${isDragging ? translateX : 0}px))`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          }}
        >
          {BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-full h-full relative"
            >
              <div
                className="w-full h-full flex flex-col items-center justify-center text-white p-6 text-center"
                style={{ backgroundColor: banner.bgColor }}
              >
                {/* Placeholder content - replace with actual banner images */}
                <h3 className="text-xl md:text-2xl font-bold mb-2">{banner.title}</h3>
                <p className="text-sm md:text-base opacity-90">{banner.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicator dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white scale-110'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
