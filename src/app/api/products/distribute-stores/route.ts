import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import Store from '@/models/Store'

export async function POST() {
  try {
    await dbConnect()

    // Get all stores (active and inactive)
    const stores = await Store.find({})
    
    if (stores.length === 0) {
      return NextResponse.json(
        { error: 'No stores found in database' },
        { status: 400 }
      )
    }

    // Get all products
    const allProducts = await Product.find({})
    
    if (allProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No products found in database',
        stores: stores.length,
        productsUpdated: 0,
        productsTotal: 0,
      })
    }

    const storeIds = stores.map(s => s._id)
    let updatedCount = 0
    const distribution: Record<string, number> = {}
    
    // Initialize distribution counter
    storeIds.forEach(id => {
      distribution[id.toString()] = 0
    })
    
    // Distribute products evenly across stores
    for (let i = 0; i < allProducts.length; i++) {
      const product = allProducts[i]
      let needsUpdate = false
      
      // Check if product has a valid storeId
      if (!product.storeId) {
        needsUpdate = true
      } else {
        // Check if storeId exists in our stores list
        const storeExists = storeIds.some(id => id.equals(product.storeId))
        if (!storeExists) {
          needsUpdate = true
        }
      }
      
      if (needsUpdate) {
        // Assign to store in round-robin fashion for even distribution
        const assignedStoreIndex = i % storeIds.length
        const assignedStoreId = storeIds[assignedStoreIndex]
        
        await Product.findByIdAndUpdate(product._id, {
          storeId: assignedStoreId,
        })
        
        updatedCount++
        distribution[assignedStoreId.toString()] = (distribution[assignedStoreId.toString()] || 0) + 1
      } else {
        // Count existing distribution
        const storeIdStr = product.storeId.toString()
        distribution[storeIdStr] = (distribution[storeIdStr] || 0) + 1
      }
    }

    // Get store names for response
    const storeDistribution = stores.map(store => ({
      storeId: store._id.toString(),
      storeName: store.name,
      productCount: distribution[store._id.toString()] || 0,
    }))

    return NextResponse.json({
      success: true,
      message: `Verified and distributed products across ${stores.length} stores`,
      stores: stores.length,
      productsTotal: allProducts.length,
      productsUpdated: updatedCount,
      distribution: storeDistribution,
    })
  } catch (error) {
    console.error('Distribute stores error:', error)
    return NextResponse.json(
      { error: 'Failed to distribute products to stores', details: String(error) },
      { status: 500 }
    )
  }
}

// GET endpoint to check current distribution without updating
export async function GET() {
  try {
    await dbConnect()

    const stores = await Store.find({})
    const allProducts = await Product.find({})
    
    const storeIds = stores.map(s => s._id)
    const distribution: Record<string, number> = {}
    let productsWithoutStore = 0
    let productsWithInvalidStore = 0
    
    stores.forEach(store => {
      distribution[store._id.toString()] = 0
    })
    
    allProducts.forEach(product => {
      if (!product.storeId) {
        productsWithoutStore++
      } else {
        const storeExists = storeIds.some(id => id.equals(product.storeId))
        if (!storeExists) {
          productsWithInvalidStore++
        } else {
          distribution[product.storeId.toString()] = (distribution[product.storeId.toString()] || 0) + 1
        }
      }
    })
    
    const storeDistribution = stores.map(store => ({
      storeId: store._id.toString(),
      storeName: store.name,
      productCount: distribution[store._id.toString()] || 0,
    }))

    return NextResponse.json({
      success: true,
      stores: stores.length,
      productsTotal: allProducts.length,
      productsWithoutStore,
      productsWithInvalidStore,
      distribution: storeDistribution,
    })
  } catch (error) {
    console.error('Check distribution error:', error)
    return NextResponse.json(
      { error: 'Failed to check product distribution', details: String(error) },
      { status: 500 }
    )
  }
}
