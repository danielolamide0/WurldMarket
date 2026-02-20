import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

// Map product names/categories to cuisines
function getCuisinesForProduct(name: string, category: string): string[] {
  const nameLower = name.toLowerCase()
  const categoryLower = category.toLowerCase()

  const cuisines: string[] = []

  // African indicators
  const africanKeywords = [
    'jollof', 'egusi', 'suya', 'fufu', 'garri', 'plantain', 'palm oil', 'ogbono',
    'stockfish', 'pounded yam', 'chin chin', 'puff puff', 'scotch bonnet',
    'shito', 'kelewele', 'kenkey', 'banku', 'waakye', 'tilapia', 'crayfish',
    'dawadawa', 'locust bean', 'african', 'nigerian', 'ghanaian', 'cameroon',
    'cassava', 'yam', 'okra', 'bitter leaf', 'ugu', 'ewedu', 'amala'
  ]

  // Caribbean indicators
  const caribbeanKeywords = [
    'jerk', 'caribbean', 'jamaican', 'plantain', 'scotch bonnet', 'ackee',
    'saltfish', 'callaloo', 'sorrel', 'ginger beer', 'rum', 'coconut',
    'grace', 'supermalt', 'malta', 'trinidad', 'barbados', 'reggae',
    'patty', 'bammy', 'festival', 'dumpling', 'curry goat', 'oxtail'
  ]

  // South Asian indicators
  const southAsianKeywords = [
    'basmati', 'garam masala', 'curry', 'turmeric', 'cumin', 'coriander',
    'ghee', 'chapati', 'roti', 'naan', 'paneer', 'dal', 'lentil', 'chickpea',
    'chana', 'biryani', 'tandoori', 'masala', 'indian', 'pakistani',
    'bangladeshi', 'sri lankan', 'atta', 'goat', 'samosa', 'chutney'
  ]

  // East Asian indicators
  const eastAsianKeywords = [
    'soy sauce', 'sesame', 'rice noodle', 'tofu', 'miso', 'nori', 'wasabi',
    'teriyaki', 'sriracha', 'hoisin', 'oyster sauce', 'fish sauce',
    'chinese', 'japanese', 'korean', 'vietnamese', 'thai', 'wok',
    'dumpling', 'spring roll', 'kimchi', 'ramen', 'udon', 'soba'
  ]

  // Middle Eastern indicators
  const middleEasternKeywords = [
    'tahini', 'hummus', 'falafel', 'shawarma', 'kebab', 'pita', 'za\'atar',
    'sumac', 'pomegranate', 'rose water', 'baklava', 'halva', 'couscous',
    'lebanese', 'turkish', 'persian', 'arab', 'middle eastern', 'halal',
    'lamb', 'basmati', 'saffron', 'cardamom', 'bulgur', 'freekeh'
  ]

  // Eastern European indicators
  const easternEuropeanKeywords = [
    'pierogi', 'kielbasa', 'sauerkraut', 'borscht', 'buckwheat', 'kasha',
    'polish', 'russian', 'ukrainian', 'hungarian', 'czech', 'paprika',
    'smetana', 'sour cream', 'dill', 'beetroot', 'cabbage', 'pickle',
    'rye', 'vodka', 'kvass', 'kompot', 'pelmeni', 'blini'
  ]

  // Check name against keywords
  for (const keyword of africanKeywords) {
    if (nameLower.includes(keyword)) {
      if (!cuisines.includes('african')) cuisines.push('african')
      break
    }
  }

  for (const keyword of caribbeanKeywords) {
    if (nameLower.includes(keyword)) {
      if (!cuisines.includes('caribbean')) cuisines.push('caribbean')
      break
    }
  }

  for (const keyword of southAsianKeywords) {
    if (nameLower.includes(keyword)) {
      if (!cuisines.includes('south-asian')) cuisines.push('south-asian')
      break
    }
  }

  for (const keyword of eastAsianKeywords) {
    if (nameLower.includes(keyword)) {
      if (!cuisines.includes('east-asian')) cuisines.push('east-asian')
      break
    }
  }

  for (const keyword of middleEasternKeywords) {
    if (nameLower.includes(keyword)) {
      if (!cuisines.includes('middle-eastern')) cuisines.push('middle-eastern')
      break
    }
  }

  for (const keyword of easternEuropeanKeywords) {
    if (nameLower.includes(keyword)) {
      if (!cuisines.includes('eastern-european')) cuisines.push('eastern-european')
      break
    }
  }

  // Default to african if no cuisine matched (most products are African based on the store focus)
  if (cuisines.length === 0) {
    cuisines.push('african')
  }

  return cuisines
}

export async function POST() {
  try {
    await dbConnect()

    // Get all products
    const products = await Product.find({})

    let updatedCount = 0
    const updates: { id: string; name: string; cuisines: string[] }[] = []

    for (const product of products) {
      const cuisines = getCuisinesForProduct(product.name, product.category)

      // Update product with cuisines
      await Product.findByIdAndUpdate(product._id, { cuisines })
      updatedCount++
      updates.push({
        id: product._id.toString(),
        name: product.name,
        cuisines
      })
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedCount} products with cuisines`,
      updates
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
