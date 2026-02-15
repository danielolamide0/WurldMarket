import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Vendor from '@/models/Vendor'
import Store from '@/models/Store'
import Product from '@/models/Product'

const MAIN_URL = 'https://wurldbasket.com'

export async function POST() {
  try {
    await dbConnect()

    // Fetch all data from main
    const [vendorsRes, storesRes, productsRes] = await Promise.all([
      fetch(`${MAIN_URL}/api/vendors`),
      fetch(`${MAIN_URL}/api/stores`),
      fetch(`${MAIN_URL}/api/products`),
    ])

    const vendorsData = await vendorsRes.json()
    const storesData = await storesRes.json()
    const productsData = await productsRes.json()

    const vendors = vendorsData.vendors || []
    const stores = storesData.stores || []
    const products = productsData.products || []

    let syncedVendors = 0
    let syncedStores = 0
    let syncedProducts = 0

    // Sync vendors
    for (const vendor of vendors) {
      await Vendor.findByIdAndUpdate(
        vendor.id,
        {
          _id: vendor.id,
          name: vendor.name,
          slug: vendor.slug,
          description: vendor.description,
          logo: vendor.logo,
          contactEmail: vendor.contactEmail,
          contactPhone: vendor.contactPhone,
          isLive: vendor.isLive,
        },
        { upsert: true, new: true }
      )
      syncedVendors++
    }

    // Sync stores
    for (const store of stores) {
      await Store.findByIdAndUpdate(
        store.id,
        {
          _id: store.id,
          vendorId: store.vendorId,
          name: store.name,
          address: store.address,
          city: store.city,
          postcode: store.postcode,
          coordinates: store.coordinates,
          openingHours: store.openingHours,
          isActive: store.isActive,
          image: store.image,
        },
        { upsert: true, new: true }
      )
      syncedStores++
    }

    // Sync products
    for (const product of products) {
      await Product.findByIdAndUpdate(
        product.id,
        {
          _id: product.id,
          vendorId: product.vendorId,
          storeId: product.storeId,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          unit: product.unit,
          image: product.image,
          stock: product.stock,
          isActive: product.isActive,
          isOnOffer: product.isOnOffer,
          originalPrice: product.originalPrice,
          offerEndDate: product.offerEndDate ? new Date(product.offerEndDate) : undefined,
        },
        { upsert: true, new: true }
      )
      syncedProducts++
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      synced: {
        vendors: syncedVendors,
        stores: syncedStores,
        products: syncedProducts,
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 })
  }
}
