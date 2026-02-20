import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

// Mapping of product keywords to cuisines
const CUISINE_KEYWORDS: Record<string, string[]> = {
  'african': [
    'jollof', 'palm oil', 'egusi', 'garri', 'plantain', 'yam', 'cassava', 'fufu',
    'suya', 'pepper soup', 'banga', 'bitter leaf', 'okra', 'ogbono', 'stockfish',
    'crayfish', 'palm kernel', 'groundnut', 'cocoyam', 'taro', 'black-eyed peas',
    'red beans', 'akara', 'moin moin', 'chin chin', 'puff puff', 'buns', 'agege bread'
  ],
  'caribbean': [
    'jerk', 'supermalt', 'plantain', 'ackee', 'saltfish', 'callaloo', 'dasheen',
    'breadfruit', 'yam', 'cassava', 'coconut', 'rum', 'sorrel', 'ginger beer',
    'curry goat', 'rice and peas', 'festival', 'bammy', 'johnny cake', 'roti',
    'doubles', 'pholourie', 'chow mein', 'pelau'
  ],
  'south-asian': [
    'basmati', 'garam masala', 'ghee', 'chapati', 'naan', 'dal', 'lentil',
    'curry', 'tikka', 'biryani', 'samosa', 'pakora', 'bhaji', 'roti', 'paratha',
    'paneer', 'tandoori', 'masala', 'cumin', 'coriander', 'turmeric', 'cardamom',
    'fenugreek', 'asafoetida', 'tamarind', 'mango pickle', 'lime pickle'
  ],
  'east-asian': [
    'soy sauce', 'rice noodle', 'sesame oil', 'miso', 'sake', 'mirin', 'dashi',
    'wasabi', 'ginger', 'garlic chive', 'bok choy', 'napa cabbage', 'kimchi',
    'gochujang', 'doenjang', 'tofu', 'ramen', 'udon', 'soba', 'dumpling',
    'wonton', 'spring roll', 'hoisin', 'oyster sauce', 'sriracha', 'sambal'
  ],
  'middle-eastern': [
    'tahini', 'za\'atar', 'sumac', 'pomegranate', 'mint', 'parsley', 'coriander',
    'cumin', 'cardamom', 'cinnamon', 'allspice', 'baharat', 'ras el hanout',
    'harissa', 'labneh', 'halloumi', 'feta', 'pita', 'flatbread', 'hummus',
    'baba ganoush', 'falafel', 'shawarma', 'kebab', 'kofta', 'dolma', 'baklava'
  ],
  'eastern-european': [
    'buckwheat', 'sauerkraut', 'pierogi', 'kielbasa', 'sausage', 'cabbage',
    'beetroot', 'dill', 'sour cream', 'cottage cheese', 'rye bread', 'borscht',
    'goulash', 'paprika', 'potato', 'mushroom', 'dumpling', 'pelmeni', 'vareniki',
    'blini', 'pancake', 'kvass', 'vodka'
  ],
}

function assignCuisinesToProduct(productName: string, description: string, category: string): string[] {
  const text = `${productName} ${description} ${category}`.toLowerCase()
  const assignedCuisines: string[] = []

  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      assignedCuisines.push(cuisine)
    }
  }

  // If no cuisine matched, assign based on category
  if (assignedCuisines.length === 0) {
    // Default assignments for common categories
    if (category.includes('rice') || category.includes('grain')) {
      assignedCuisines.push('south-asian', 'east-asian')
    } else if (category.includes('spice')) {
      assignedCuisines.push('south-asian', 'middle-eastern')
    } else if (category.includes('frozen') || category.includes('fish')) {
      assignedCuisines.push('african', 'caribbean', 'east-asian')
    } else {
      // Default to African and Caribbean for general products
      assignedCuisines.push('african', 'caribbean')
    }
  }

  return assignedCuisines
}

export async function POST() {
  try {
    await dbConnect()

    const products = await Product.find({})
    let updatedCount = 0
    const cuisineCounts: Record<string, number> = {
      'african': 0,
      'caribbean': 0,
      'south-asian': 0,
      'east-asian': 0,
      'middle-eastern': 0,
      'eastern-european': 0,
    }

    for (const product of products) {
      const cuisines = assignCuisinesToProduct(
        product.name,
        product.description || '',
        product.category
      )

      if (cuisines.length > 0) {
        product.cuisines = cuisines
        await product.save()
        updatedCount++

        cuisines.forEach(cuisine => {
          cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Assigned cuisines to ${updatedCount} products`,
      updatedCount,
      cuisineDistribution: cuisineCounts,
    })
  } catch (error) {
    console.error('Assign cuisines error:', error)
    return NextResponse.json(
      { error: 'Failed to assign cuisines', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await dbConnect()

    const totalProducts = await Product.countDocuments({})
    const productsWithCuisines = await Product.countDocuments({
      cuisines: { $exists: true, $ne: [] }
    })
    const productsWithoutCuisines = totalProducts - productsWithCuisines

    const cuisineCounts: Record<string, number> = {}
    const products = await Product.find({ cuisines: { $exists: true, $ne: [] } })
    
    products.forEach(product => {
      if (product.cuisines && Array.isArray(product.cuisines)) {
        product.cuisines.forEach(cuisine => {
          cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1
        })
      }
    })

    return NextResponse.json({
      totalProducts,
      productsWithCuisines,
      productsWithoutCuisines,
      cuisineDistribution: cuisineCounts,
    })
  } catch (error) {
    console.error('Get cuisine stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get cuisine stats', details: String(error) },
      { status: 500 }
    )
  }
}
