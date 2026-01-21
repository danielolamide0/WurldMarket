import Link from 'next/link'
import { ShoppingBasket, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-forest-dark text-white hidden md:block">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-terracotta rounded-xl flex items-center justify-center">
                <ShoppingBasket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">WurldBasket</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your one-stop shop for authentic international groceries delivered to your door across the UK.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">Find Stores</Link></li>
              <li><Link href="/category/grains-rice" className="hover:text-white transition-colors">Shop by Category</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link href="/category/grains-rice" className="hover:text-white transition-colors">Grains & Rice</Link></li>
              <li><Link href="/category/spices" className="hover:text-white transition-colors">Spices</Link></li>
              <li><Link href="/category/frozen" className="hover:text-white transition-colors">Frozen Foods</Link></li>
              <li><Link href="/category/fresh-produce" className="hover:text-white transition-colors">Fresh Produce</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@wurldbasket.uk</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+44 20 1234 5678</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Serving Leeds & Southampton</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} WurldBasket. All rights reserved. Demo version.</p>
        </div>
      </div>
    </footer>
  )
}
