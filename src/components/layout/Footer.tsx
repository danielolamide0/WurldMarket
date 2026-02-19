'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'

export function Footer() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    help: false,
    about: false,
    support: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-50">
      {/* Expandable Sections */}
      <div className="border-t border-gray-200 bg-cream">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="space-y-0">
            {/* How can we help */}
            <div className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => toggleSection('help')}
                className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
              >
                <span className="text-base font-semibold text-gray-900">How can we help</span>
                {openSections.help ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
              {openSections.help && (
                <div className="pb-4 space-y-2">
                  <Link href="/account" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>My Account</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/orders" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>My Orders</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/help" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Help & FAQs</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/product-recall" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Product Recall</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/privacy" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Privacy Centre</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
              </div>
              )}
            </div>

            {/* About */}
            <div className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => toggleSection('about')}
                className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
              >
                <span className="text-base font-semibold text-gray-900">About</span>
                {openSections.about ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
              {openSections.about && (
                <div className="pb-4 space-y-2">
                  <Link href="/about-us" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>About Us</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/careers" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Careers</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/sustainability" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Sustainability</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/press" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Press & Media</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
          </div>

            {/* Support */}
            <div className="border-b border-gray-200 last:border-b-0">
              <button
                onClick={() => toggleSection('support')}
                className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
              >
                <span className="text-base font-semibold text-gray-900">Support</span>
                {openSections.support ? (
                  <ChevronUp className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600" />
                )}
              </button>
              {openSections.support && (
                <div className="pb-4 space-y-2">
                  <Link href="/contact" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Contact Us</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/help" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Help Centre</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/returns" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Returns & Refunds</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/delivery" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>Delivery Information</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link href="/faq" className="flex items-center justify-between text-sm text-primary hover:text-primary-dark">
                    <span>FAQs</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 rounded bg-cream hover:bg-gray-50 transition-colors text-gray-700 font-semibold text-sm"
          >
            Back To Top
            <ChevronUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Logo, Tagline, and Social Media */}
      <div className="border-t border-gray-200 py-6 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Logo and Text */}
            <div className="flex items-center gap-2">
              <img
                src="/WurldBAsketLogo.png"
                alt="WurldBasket"
                className="h-10 w-auto"
              />
              <img
                src="/WurldBasketText.png"
                alt="WurldBasket"
                className="h-6 w-auto"
              />
          </div>

            {/* Tagline */}
            <div className="text-center max-w-md">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Flavours of the World, Delivered to You
              </p>
              <p className="text-xs text-gray-600">
                Shop authentic international groceries from local stores near you.
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/wurldbasket"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="X (Twitter)"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com/wurldbasket"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com/wurldbasket"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://tiktok.com/@wurldbasket"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
          </div>

      {/* Legal Links */}
      <div className="border-t border-gray-200 py-4 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <Link href="/modern-slavery" className="hover:text-gray-900 transition-colors">Modern Slavery Statement</Link>
            <Link href="/waste-recycling" className="hover:text-gray-900 transition-colors">Electrical Waste Recycling</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms & Conditions</Link>
            <Link href="/customer-review-policy" className="hover:text-gray-900 transition-colors">Customer Review Policy</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Centre</Link>
            <Link href="/cookies" className="hover:text-gray-900 transition-colors">Cookie Settings</Link>
            <Link href="/accessibility" className="hover:text-gray-900 transition-colors">Accessibility</Link>
          </div>
          <p className="text-sm text-gray-500">&copy; WurldBasket {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-200 py-4 pb-24 md:pb-8 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Payment Methods</h4>
          <div className="flex flex-wrap items-center gap-4">
            {/* Visa */}
            <div className="h-10 w-16 flex items-center justify-center bg-cream border border-gray-200 rounded">
              <svg viewBox="0 0 100 32" className="h-6 w-full">
                <rect width="100" height="32" fill="#1434CB" rx="2"/>
                <text x="50" y="22" fontSize="14" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">VISA</text>
              </svg>
            </div>
            
            {/* Mastercard */}
            <div className="h-10 w-16 flex items-center justify-center bg-cream border border-gray-200 rounded">
              <svg viewBox="0 0 100 32" className="h-6 w-full">
                <circle cx="30" cy="16" r="12" fill="#EB001B"/>
                <circle cx="70" cy="16" r="12" fill="#F79E1B"/>
              </svg>
        </div>

            {/* American Express */}
            <div className="h-10 w-16 flex items-center justify-center bg-cream border border-gray-200 rounded">
              <svg viewBox="0 0 100 32" className="h-6 w-full">
                <rect width="100" height="32" fill="#006FCF" rx="2"/>
                <text x="50" y="20" fontSize="9" fill="white" fontWeight="bold" textAnchor="middle" fontFamily="Arial, sans-serif">AMEX</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
