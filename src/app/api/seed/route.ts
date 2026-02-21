import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'
import Store from '@/models/Store'
import Product from '@/models/Product'

export async function POST() {
  try {
    await dbConnect()

    // Check if already seeded
    const existingVendor = await Vendor.findOne({ slug: 'abu-bakr' })
    if (existingVendor) {
      return NextResponse.json({ message: 'Database already seeded', alreadySeeded: true })
    }

    console.log('🌱 Starting database seed...')

    // 1. Create Vendors
    const abubakrVendor = await Vendor.create({
      name: 'Abu Bakr Supermarket',
      slug: 'abu-bakr',
      description: 'Authentic African and Asian groceries serving Leeds since 2005. Fresh produce, spices, and frozen goods.',
      logo: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=200',
      contactEmail: 'info@abubakr.com',
      contactPhone: '+44 113 123 4567',
      isLive: true,
    })

    const sunnydayVendor = await Vendor.create({
      name: 'Sunnyday International Foods',
      slug: 'sunnyday',
      description: 'Your one-stop shop for African, Caribbean, and Asian groceries in Southampton.',
      logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=200',
      contactEmail: 'info@sunnyday.com',
      contactPhone: '+44 23 8012 3456',
      isLive: true,
    })

    console.log('✅ Vendors created')

    // 2. Create Stores
    const kirkstallStore = await Store.create({
      vendorId: abubakrVendor._id,
      name: 'Abu Bakr Supermarket - Kirkstall Road',
      address: '330 Kirkstall Rd, Burley',
      city: 'Leeds',
      postcode: 'LS4 2DN',
      coordinates: { lat: 53.8067, lng: -1.5788 },
      openingHours: {
        monday: { open: '09:00', close: '21:00' },
        tuesday: { open: '09:00', close: '21:00' },
        wednesday: { open: '09:00', close: '21:00' },
        thursday: { open: '09:00', close: '21:00' },
        friday: { open: '09:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '10:00', close: '18:00' },
      },
      isActive: true,
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    })

    const queensStore = await Store.create({
      vendorId: abubakrVendor._id,
      name: "Abu Bakr Supermarket - Queens Road",
      address: "37 Queen's Rd, Burley",
      city: 'Leeds',
      postcode: 'LS6 1NY',
      coordinates: { lat: 53.81, lng: -1.5699 },
      openingHours: {
        monday: { open: '09:00', close: '20:00' },
        tuesday: { open: '09:00', close: '20:00' },
        wednesday: { open: '09:00', close: '20:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '20:00' },
        saturday: { open: '09:00', close: '20:00' },
        sunday: { open: '10:00', close: '17:00' },
      },
      isActive: true,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
    })

    const sunnydayStore = await Store.create({
      vendorId: sunnydayVendor._id,
      name: 'Sunnyday International Foods',
      address: '111 Shirley High St, Shirley',
      city: 'Southampton',
      postcode: 'SO16 4EY',
      coordinates: { lat: 50.9217, lng: -1.4343 },
      openingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '20:00' },
        saturday: { open: '08:00', close: '19:00' },
        sunday: { open: '09:00', close: '17:00' },
      },
      isActive: true,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    })

    console.log('✅ Stores created')

    // 3. Create Users (vendor accounts; email-only auth)
    await User.create({
      password: 'abubakr',
      role: 'vendor',
      name: 'Abu Bakr Admin',
      email: 'admin@abubakr.com',
      vendorId: abubakrVendor._id,
      authMethod: 'email',
      isEmailVerified: true,
    })

    await User.create({
      password: 'sunday',
      role: 'vendor',
      name: 'Sunday Admin',
      email: 'admin@sunnyday.com',
      vendorId: sunnydayVendor._id,
      authMethod: 'email',
      isEmailVerified: true,
    })

    console.log('✅ Users created')

    // 4. Create Products
    const kirkstallProducts = [
      { name: 'Premium Jollof Rice Mix', description: 'Authentic Nigerian jollof rice spice blend with tomatoes and peppers', category: 'grains-rice', price: 6.99, unit: '500g', image: 'https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=400', stock: 50 },
      { name: 'Nigerian Palm Oil', description: 'Pure red palm oil, perfect for traditional soups and stews', category: 'spices', price: 8.49, unit: '1L', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', stock: 30 },
      { name: 'Fresh Plantains', description: 'Ripe plantains, perfect for frying or boiling', category: 'fresh-produce', price: 3.99, unit: 'per kg', image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400', stock: 100 },
      { name: 'Egusi Seeds (Ground)', description: 'Finely ground melon seeds for egusi soup', category: 'spices', price: 7.99, unit: '400g', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', stock: 25 },
      { name: 'Garri (White)', description: 'Premium quality white garri, finely processed', category: 'grains-rice', price: 5.49, unit: '1kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', stock: 80 },
      { name: 'Frozen Tilapia Fish', description: 'Whole frozen tilapia, cleaned and ready to cook', category: 'frozen', price: 12.99, unit: 'per kg', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', stock: 20 },
      { name: 'Chin Chin', description: 'Crunchy fried dough snack, lightly sweetened', category: 'snacks', price: 4.99, unit: '250g', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', stock: 40 },
      { name: 'Malta Guinness', description: 'Classic malt drink, pack of 6 bottles', category: 'beverages', price: 9.99, unit: '6 pack', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', stock: 35 },
    ]

    const queensProducts = [
      { name: 'Basmati Rice', description: 'Premium long grain basmati rice', category: 'grains-rice', price: 15.99, unit: '5kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', stock: 60 },
      { name: 'Scotch Bonnet Peppers', description: 'Fresh hot scotch bonnet peppers', category: 'fresh-produce', price: 2.99, unit: '200g', image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=400', stock: 45 },
      { name: 'Suya Spice Mix', description: 'Authentic Nigerian suya pepper blend', category: 'spices', price: 5.49, unit: '150g', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', stock: 55 },
      { name: 'Frozen Stockfish', description: 'Dried and frozen stockfish, ready to soak', category: 'frozen', price: 18.99, unit: '500g', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400', stock: 15 },
      { name: 'Pounded Yam Flour', description: 'Instant pounded yam flour, easy preparation', category: 'grains-rice', price: 8.99, unit: '2kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', stock: 40 },
      { name: 'Frozen Goat Meat', description: 'Premium cut frozen goat meat', category: 'frozen', price: 14.99, unit: 'per kg', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400', stock: 25 },
    ]

    const sunnydayProducts = [
      { name: 'Kelewele Spice', description: 'Ghanaian spice blend for kelewele (spiced plantain)', category: 'spices', price: 3.99, unit: '100g', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', stock: 30 },
      { name: 'Fresh Cassava', description: 'Fresh cassava roots, peeled and ready to cook', category: 'fresh-produce', price: 4.49, unit: 'per kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', stock: 50 },
      { name: 'Supermalt', description: 'Refreshing malt drink, pack of 4', category: 'beverages', price: 6.99, unit: '4 pack', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400', stock: 60 },
      { name: 'Shito (Hot Pepper Sauce)', description: 'Ghanaian hot pepper sauce with dried fish and shrimp', category: 'spices', price: 7.49, unit: '250ml', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400', stock: 35 },
      { name: 'Ogbono Seeds', description: 'Whole ogbono seeds for traditional Nigerian soup', category: 'spices', price: 6.49, unit: '300g', image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400', stock: 20 },
      { name: 'Frozen Crayfish', description: 'Dried crayfish, ground and ready to use', category: 'frozen', price: 9.99, unit: '200g', image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400', stock: 25 },
      { name: 'Jollof Rice Seasoning', description: 'All-in-one jollof rice seasoning cube', category: 'spices', price: 2.99, unit: '10 cubes', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400', stock: 100 },
      { name: 'Plantain Chips', description: 'Crispy plantain chips, lightly salted', category: 'snacks', price: 3.49, unit: '150g', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400', stock: 45 },
    ]

    // Insert products
    for (const p of kirkstallProducts) {
      await Product.create({ ...p, vendorId: abubakrVendor._id, storeId: kirkstallStore._id, isActive: true })
    }
    for (const p of queensProducts) {
      await Product.create({ ...p, vendorId: abubakrVendor._id, storeId: queensStore._id, isActive: true })
    }
    for (const p of sunnydayProducts) {
      await Product.create({ ...p, vendorId: sunnydayVendor._id, storeId: sunnydayStore._id, isActive: true })
    }

    console.log('✅ Products created')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        vendors: 2,
        users: 3,
        stores: 3,
        products: kirkstallProducts.length + queensProducts.length + sunnydayProducts.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to seed the database',
    credentials: {
      vendor1: { email: 'admin@abubakr.com', password: 'abubakr' },
      vendor2: { email: 'admin@sunnyday.com', password: 'sunday' },
    }
  })
}
