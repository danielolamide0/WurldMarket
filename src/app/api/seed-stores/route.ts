import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'
import Store from '@/models/Store'
import Product from '@/models/Product'
import { CATEGORIES } from '@/lib/constants'

// Store data with coordinates (geocoded)
const STORES_DATA = [
  // London
  {
    name: 'Oseyo Soho',
    address: '73-75 Charing Cross Rd',
    city: 'London',
    postcode: 'WC2H 0BF',
    coordinates: { lat: 51.5115, lng: -0.1281 },
    vendorName: 'Oseyo',
    vendorSlug: 'oseyo-soho',
    description: 'Korean and Asian grocery store in the heart of Soho',
  },
  {
    name: 'Eden Store - African Food',
    address: '60 W Green Rd, South Tottenham',
    city: 'London',
    postcode: 'N15 5NR',
    coordinates: { lat: 51.5854, lng: -0.0724 },
    vendorName: 'Eden Store',
    vendorSlug: 'eden-store',
    description: 'Authentic African food and groceries in North London',
  },
  {
    name: 'Wing Yip Superstore - Cricklewood',
    address: '395 Edgware Rd, Cricklewood',
    city: 'London',
    postcode: 'NW2 6LN',
    coordinates: { lat: 51.5581, lng: -0.2134 },
    vendorName: 'Wing Yip',
    vendorSlug: 'wing-yip-cricklewood',
    description: 'Large Asian supermarket with extensive product range',
  },
  {
    name: 'Kumasi Market',
    address: '41-45 Peckham High St',
    city: 'London',
    postcode: 'SE15 5EB',
    coordinates: { lat: 51.4707, lng: -0.0703 },
    vendorName: 'Kumasi Market',
    vendorSlug: 'kumasi-market',
    description: 'West African and Caribbean groceries in Peckham',
  },
  {
    name: 'New Loon Moon',
    address: '9A Gerrard St, Chinatown',
    city: 'London',
    postcode: 'W1D 5PH',
    coordinates: { lat: 51.5120, lng: -0.1302 },
    vendorName: 'New Loon Moon',
    vendorSlug: 'new-loon-moon',
    description: 'Chinese supermarket in the heart of Chinatown',
  },
  // Manchester
  {
    name: 'Manchester Superstore',
    address: '382-386 Cheetham Hill Rd',
    city: 'Manchester',
    postcode: 'M8 9LS',
    coordinates: { lat: 53.5019, lng: -2.2344 },
    vendorName: 'Manchester Superstore',
    vendorSlug: 'manchester-superstore',
    description: 'International food supermarket serving Manchester',
  },
  {
    name: 'Wing Yip Superstore - Ancoats',
    address: 'Oldham Rd, Ancoats',
    city: 'Manchester',
    postcode: 'M4 5HU',
    coordinates: { lat: 53.4814, lng: -2.2261 },
    vendorName: 'Wing Yip Manchester',
    vendorSlug: 'wing-yip-manchester',
    description: 'Asian supermarket chain in Manchester',
  },
  {
    name: 'Venus Foods',
    address: '45-49 Anson Road',
    city: 'Manchester',
    postcode: 'M14 5DE',
    coordinates: { lat: 53.4486, lng: -2.2253 },
    vendorName: 'Venus Foods',
    vendorSlug: 'venus-foods',
    description: 'International grocery store in Rusholme',
  },
  {
    name: 'Worldwide Foods',
    address: '401 Great Western Street',
    city: 'Manchester',
    postcode: 'M14 4AH',
    coordinates: { lat: 53.4481, lng: -2.2234 },
    vendorName: 'Worldwide Foods',
    vendorSlug: 'worldwide-foods',
    description: 'Global food products and ingredients',
  },
  {
    name: 'Fresh Save',
    address: '718 Wilmslow Rd, Didsbury',
    city: 'Manchester',
    postcode: 'M20 2DW',
    coordinates: { lat: 53.4106, lng: -2.2301 },
    vendorName: 'Fresh Save',
    vendorSlug: 'fresh-save',
    description: 'Fresh produce and international groceries',
  },
  // Birmingham
  {
    name: 'Samis Online Wholesale',
    address: '82, 89 Cecil St',
    city: 'Birmingham',
    postcode: 'B19 3SU',
    coordinates: { lat: 52.4904, lng: -1.9024 },
    vendorName: 'Samis Wholesale',
    vendorSlug: 'samis-wholesale',
    description: 'Wholesale international food distributor',
  },
  {
    name: 'Day In Oriental Supermarket',
    address: 'Pershore St',
    city: 'Birmingham',
    postcode: 'B5 6ND',
    coordinates: { lat: 52.4759, lng: -1.8994 },
    vendorName: 'Day In Oriental',
    vendorSlug: 'day-in-oriental',
    description: 'Oriental and Asian food supermarket',
  },
  {
    name: 'Pak Foods',
    address: '171-175 Lozells Rd',
    city: 'Birmingham',
    postcode: 'B19 1SL',
    coordinates: { lat: 52.4972, lng: -1.9094 },
    vendorName: 'Pak Foods',
    vendorSlug: 'pak-foods',
    description: 'Pakistani and South Asian groceries',
  },
  {
    name: 'Seoul Plaza',
    address: '550 Bristol Rd, Selly Oak',
    city: 'Birmingham',
    postcode: 'B29 6BD',
    coordinates: { lat: 52.4419, lng: -1.9367 },
    vendorName: 'Seoul Plaza',
    vendorSlug: 'seoul-plaza',
    description: 'Korean and Asian food specialist',
  },
  {
    name: 'Jennies Wholesale',
    address: '195 New Town Row',
    city: 'Birmingham',
    postcode: 'B6 4QZ',
    coordinates: { lat: 52.4964, lng: -1.8889 },
    vendorName: 'Jennies Wholesale',
    vendorSlug: 'jennies-wholesale',
    description: 'Wholesale international food products',
  },
  // Leeds
  {
    name: 'Sing-Kee Oriental',
    address: '26–28 Woodhouse Ln',
    city: 'Leeds',
    postcode: 'LS2 8LX',
    coordinates: { lat: 53.8008, lng: -1.5491 },
    vendorName: 'Sing-Kee Oriental',
    vendorSlug: 'sing-kee-oriental',
    description: 'Oriental supermarket in Leeds city centre',
  },
  {
    name: 'Hang Sing Hong',
    address: '117-119 Vicar Lane',
    city: 'Leeds',
    postcode: 'LS1 6PJ',
    coordinates: { lat: 53.7979, lng: -1.5414 },
    vendorName: 'Hang Sing Hong',
    vendorSlug: 'hang-sing-hong',
    description: 'Chinese and Asian food supermarket',
  },
  {
    name: 'CC Continental',
    address: '10 Chapeltown Rd',
    city: 'Leeds',
    postcode: 'LS7 3AL',
    coordinates: { lat: 53.8101, lng: -1.5367 },
    vendorName: 'CC Continental',
    vendorSlug: 'cc-continental',
    description: 'Continental and international groceries',
  },
  // Southampton
  {
    name: 'Yau Brothers',
    address: 'Y B Building, Princes St',
    city: 'Southampton',
    postcode: 'SO14 5RP',
    coordinates: { lat: 50.9097, lng: -1.4044 },
    vendorName: 'Yau Brothers',
    vendorSlug: 'yau-brothers',
    description: 'Chinese and Asian food specialist in Southampton',
  },
]

// Product templates by category
const PRODUCT_TEMPLATES = {
  'fresh-produce': [
    { name: 'Fresh Plantains', description: 'Ripe plantains, perfect for frying', price: 3.99, unit: 'per kg', stock: 50, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400' },
    { name: 'Fresh Cassava', description: 'Fresh cassava roots, peeled and ready', price: 4.49, unit: 'per kg', stock: 40 },
    { name: 'Scotch Bonnet Peppers', description: 'Fresh hot scotch bonnet peppers', price: 2.99, unit: '200g', stock: 45 },
    { name: 'Fresh Yams', description: 'Premium yams, perfect for traditional dishes', price: 5.99, unit: 'per kg', stock: 35 },
    { name: 'Fresh Okra', description: 'Fresh okra, ideal for soups and stews', price: 3.49, unit: '500g', stock: 30 },
  ],
  'tubers-roots': [
    { name: 'Sweet Potatoes', description: 'Fresh sweet potatoes', price: 2.99, unit: 'per kg', stock: 60 },
    { name: 'Cocoyam', description: 'Fresh cocoyam roots', price: 4.99, unit: 'per kg', stock: 25 },
    { name: 'Taro Root', description: 'Fresh taro root', price: 5.49, unit: 'per kg', stock: 20 },
  ],
  'fresh-vegetables': [
    { name: 'Fresh Spinach', description: 'Fresh leafy spinach', price: 1.99, unit: '250g', stock: 50 },
    { name: 'Fresh Kale', description: 'Fresh kale leaves', price: 2.49, unit: '250g', stock: 40 },
    { name: 'Fresh Cabbage', description: 'Fresh white cabbage', price: 1.79, unit: 'each', stock: 45 },
  ],
  'fresh-fruits': [
    { name: 'Fresh Mangoes', description: 'Ripe tropical mangoes', price: 4.99, unit: 'per kg', stock: 30 },
    { name: 'Fresh Pineapples', description: 'Sweet pineapples', price: 2.99, unit: 'each', stock: 25 },
    { name: 'Fresh Papaya', description: 'Ripe papaya', price: 3.99, unit: 'each', stock: 20 },
  ],
  'fresh-meat': [
    { name: 'Fresh Goat Meat', description: 'Premium cut goat meat', price: 14.99, unit: 'per kg', stock: 25 },
    { name: 'Fresh Beef', description: 'Quality beef cuts', price: 12.99, unit: 'per kg', stock: 40 },
    { name: 'Fresh Chicken', description: 'Whole fresh chicken', price: 8.99, unit: 'each', stock: 35 },
  ],
  'fresh-fish-seafood': [
    { name: 'Fresh Tilapia', description: 'Whole fresh tilapia', price: 12.99, unit: 'per kg', stock: 20 },
    { name: 'Fresh Prawns', description: 'Fresh prawns', price: 15.99, unit: '500g', stock: 15 },
    { name: 'Fresh Mackerel', description: 'Fresh mackerel fish', price: 9.99, unit: 'per kg', stock: 25 },
  ],
  'smoked-dried-fish-meat': [
    { name: 'Frozen Stockfish', description: 'Dried stockfish, ready to soak', price: 18.99, unit: '500g', stock: 15 },
    { name: 'Dried Crayfish', description: 'Ground dried crayfish', price: 9.99, unit: '200g', stock: 25 },
    { name: 'Smoked Fish', description: 'Traditional smoked fish', price: 12.99, unit: '500g', stock: 20 },
  ],
  'frozen-foods': [
    { name: 'Frozen Goat Meat', description: 'Premium frozen goat meat', price: 14.99, unit: 'per kg', stock: 25 },
    { name: 'Frozen Tilapia', description: 'Whole frozen tilapia', price: 11.99, unit: 'per kg', stock: 30 },
    { name: 'Frozen Plantain', description: 'Frozen plantain slices', price: 4.99, unit: '500g', stock: 40 },
  ],
  'rice-grains': [
    { name: 'Basmati Rice', description: 'Premium long grain basmati rice', price: 15.99, unit: '5kg', stock: 60 },
    { name: 'Jasmine Rice', description: 'Fragrant jasmine rice', price: 14.99, unit: '5kg', stock: 55 },
    { name: 'Garri (White)', description: 'Premium white garri', price: 5.49, unit: '1kg', stock: 80 },
    { name: 'Garri (Yellow)', description: 'Yellow garri with palm oil', price: 5.99, unit: '1kg', stock: 70 },
  ],
  'flour-meal': [
    { name: 'Cassava Flour', description: 'Fine cassava flour', price: 6.99, unit: '1kg', stock: 50 },
    { name: 'Yam Flour', description: 'Instant yam flour', price: 7.99, unit: '1kg', stock: 40 },
    { name: 'Cornmeal', description: 'Fine cornmeal', price: 4.99, unit: '1kg', stock: 45 },
  ],
  'beans-lentils-pulses': [
    { name: 'Black-eyed Peas', description: 'Dried black-eyed peas', price: 3.99, unit: '500g', stock: 60 },
    { name: 'Red Kidney Beans', description: 'Dried red kidney beans', price: 3.49, unit: '500g', stock: 55 },
    { name: 'Chickpeas', description: 'Dried chickpeas', price: 3.99, unit: '500g', stock: 50 },
  ],
  'spices-seasonings': [
    { name: 'Curry Powder', description: 'Authentic curry powder blend', price: 2.99, unit: '100g', stock: 80 },
    { name: 'Garam Masala', description: 'Traditional garam masala', price: 3.49, unit: '100g', stock: 70 },
    { name: 'Suya Spice', description: 'Nigerian suya pepper blend', price: 5.49, unit: '150g', stock: 55 },
    { name: 'Jollof Rice Seasoning', description: 'All-in-one jollof seasoning', price: 2.99, unit: '10 cubes', stock: 100 },
  ],
  'sauces-pastes': [
    { name: 'Tomato Paste', description: 'Concentrated tomato paste', price: 1.99, unit: '200g', stock: 90 },
    { name: 'Palm Oil', description: 'Pure red palm oil', price: 8.49, unit: '1L', stock: 30 },
    { name: 'Groundnut Paste', description: 'Smooth groundnut paste', price: 4.99, unit: '400g', stock: 40 },
  ],
  'cooking-oils-fats': [
    { name: 'Groundnut Oil', description: 'Pure groundnut oil', price: 7.99, unit: '1L', stock: 50 },
    { name: 'Vegetable Oil', description: 'Refined vegetable oil', price: 3.99, unit: '1L', stock: 80 },
    { name: 'Coconut Oil', description: 'Virgin coconut oil', price: 9.99, unit: '500ml', stock: 35 },
  ],
  'noodles-pasta': [
    { name: 'Indomie Noodles', description: 'Instant noodles, pack of 5', price: 3.99, unit: '5 pack', stock: 100 },
    { name: 'Spaghetti', description: 'Italian spaghetti', price: 1.99, unit: '500g', stock: 80 },
    { name: 'Macaroni', description: 'Elbow macaroni', price: 1.79, unit: '500g', stock: 75 },
  ],
  'ready-to-cook-foods': [
    { name: 'Jollof Rice Mix', description: 'Ready-to-cook jollof rice', price: 6.99, unit: '500g', stock: 50 },
    { name: 'Fried Rice Mix', description: 'Ready-to-cook fried rice', price: 6.49, unit: '500g', stock: 45 },
  ],
  'packaged-canned-foods': [
    { name: 'Canned Tomatoes', description: 'Whole canned tomatoes', price: 1.49, unit: '400g', stock: 90 },
    { name: 'Canned Sardines', description: 'Canned sardines in oil', price: 2.99, unit: '125g', stock: 70 },
    { name: 'Corned Beef', description: 'Canned corned beef', price: 3.99, unit: '340g', stock: 60 },
  ],
  'snacks-sweets': [
    { name: 'Chin Chin', description: 'Crunchy fried dough snack', price: 4.99, unit: '250g', stock: 40 },
    { name: 'Plantain Chips', description: 'Crispy plantain chips', price: 3.49, unit: '150g', stock: 45 },
    { name: 'Biscuits', description: 'Assorted biscuits', price: 2.99, unit: '200g', stock: 60 },
  ],
  'drinks-beverages': [
    { name: 'Malta Guinness', description: 'Malt drink, pack of 6', price: 9.99, unit: '6 pack', stock: 35 },
    { name: 'Supermalt', description: 'Malt drink, pack of 4', price: 6.99, unit: '4 pack', stock: 60 },
    { name: 'Fanta Orange', description: 'Orange soft drink, pack of 6', price: 4.99, unit: '6 pack', stock: 80 },
  ],
  'dairy-eggs': [
    { name: 'Fresh Eggs', description: 'Free-range eggs', price: 3.99, unit: '12 pack', stock: 50 },
    { name: 'Full Cream Milk', description: 'Fresh full cream milk', price: 2.49, unit: '1L', stock: 40 },
    { name: 'Butter', description: 'Salted butter', price: 3.99, unit: '250g', stock: 35 },
  ],
  'household-essentials': [
    { name: 'Washing Powder', description: 'Laundry detergent', price: 8.99, unit: '3kg', stock: 30 },
    { name: 'Dish Soap', description: 'Liquid dish soap', price: 2.99, unit: '750ml', stock: 50 },
  ],
}

// Generate random products for a store
function generateProductsForStore(storeName: string, vendorId: any, storeId: any) {
  const products: any[] = []
  const categoryKeys = Object.keys(PRODUCT_TEMPLATES) as Array<keyof typeof PRODUCT_TEMPLATES>
  
  // Select 8-12 random categories
  const selectedCategories = categoryKeys.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 8)
  
  selectedCategories.forEach((category) => {
    const templates = PRODUCT_TEMPLATES[category]
    // Select 1-3 products from each category
    const selectedProducts = templates.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)
    
    selectedProducts.forEach((template) => {
      // Add some variation to prices (±20%)
      const priceVariation = 1 + (Math.random() * 0.4 - 0.2)
      const finalPrice = Math.round(template.price * priceVariation * 100) / 100
      
      // Add some variation to stock
      const stockVariation = Math.floor(Math.random() * 20) - 10
      const finalStock = Math.max(10, template.stock + stockVariation)
      
      // Get appropriate image based on category
      const categoryImages: Record<string, string> = {
        'fresh-produce': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
        'tubers-roots': 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=400',
        'fresh-vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
        'fresh-fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
        'fresh-meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400',
        'fresh-fish-seafood': 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400',
        'smoked-dried-fish-meat': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        'frozen-foods': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400',
        'rice-grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
        'flour-meal': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
        'beans-lentils-pulses': 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=400',
        'spices-seasonings': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400',
        'sauces-pastes': 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400',
        'cooking-oils-fats': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
        'noodles-pasta': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400',
        'ready-to-cook-foods': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
        'packaged-canned-foods': 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400',
        'snacks-sweets': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',
        'drinks-beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
        'dairy-eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
        'household-essentials': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400',
      }

      products.push({
        vendorId,
        storeId,
        name: template.name,
        description: template.description,
        category: category,
        price: finalPrice,
        unit: template.unit,
        stock: finalStock,
        image: (template as any).image || categoryImages[category] || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400',
        isActive: true,
      })
    })
  })
  
  return products
}

export async function POST() {
  try {
    await dbConnect()

    console.log('🌱 Starting store seed...')

    const createdVendors: any[] = []
    const createdStores: any[] = []
    const createdProducts: any[] = []
    const createdUsers: any[] = []

    for (const storeData of STORES_DATA) {
      // Create vendor
      const vendor = await Vendor.create({
        name: storeData.vendorName,
        slug: storeData.vendorSlug,
        description: storeData.description,
        logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200',
        contactEmail: `info@${storeData.vendorSlug.replace(/-/g, '')}.com`,
        contactPhone: `+44 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        isLive: true,
      })
      createdVendors.push(vendor)

      // Create store
      const store = await Store.create({
        vendorId: vendor._id,
        name: storeData.name,
        address: storeData.address,
        city: storeData.city,
        postcode: storeData.postcode,
        coordinates: storeData.coordinates,
        openingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '21:00' },
          saturday: { open: '09:00', close: '20:00' },
          sunday: { open: '10:00', close: '18:00' },
        },
        isActive: true,
        image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
      })
      createdStores.push(store)

      // Create vendor user (email-only auth)
      const user = await User.create({
        password: storeData.vendorSlug.replace(/-/g, ''),
        role: 'vendor',
        name: `${storeData.vendorName} Admin`,
        email: `admin@${storeData.vendorSlug.replace(/-/g, '')}.com`,
        vendorId: vendor._id,
        authMethod: 'email',
        isEmailVerified: true,
      })
      createdUsers.push(user)

      // Generate products
      const products = generateProductsForStore(storeData.name, vendor._id, store._id)
      for (const product of products) {
        const created = await Product.create(product)
        createdProducts.push(created)
      }

      console.log(`✅ Created ${storeData.name} with ${products.length} products`)
    }

    return NextResponse.json({
      success: true,
      message: 'Stores seeded successfully!',
      data: {
        vendors: createdVendors.length,
        stores: createdStores.length,
        users: createdUsers.length,
        products: createdProducts.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed stores', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed stores',
    stores: STORES_DATA.length,
  })
}
