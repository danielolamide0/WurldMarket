'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Wheat,
  Flame,
  Snowflake,
  Leaf,
  Cookie,
  Coffee,
  Carrot,
  Salad,
  Apple,
  Beef,
  Fish,
  Droplet,
  Droplets,
  Utensils,
  ChefHat,
  Package,
  Egg,
  Home,
  Sparkles,
  WheatOff,
  Circle
} from 'lucide-react'
import { CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Wheat,
  Flame,
  Snowflake,
  Leaf,
  Cookie,
  Coffee,
  Carrot,
  Salad,
  Apple,
  Beef,
  Fish,
  Droplet,
  Droplets,
  Utensils,
  ChefHat,
  Package,
  Egg,
  Home,
  Sparkles,
  WheatOff,
  Bean: Circle, // Fallback for Bean icon
}

export function CategoryNav() {
  const pathname = usePathname()

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 pb-2">
        {CATEGORIES.map((category) => {
          const Icon = iconMap[category.icon] || Circle
          const isActive = pathname === `/category/${category.slug}`

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-2xl min-w-[80px] transition-all',
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium whitespace-nowrap text-center">{category.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
