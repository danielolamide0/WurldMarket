import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function POST() {
  try {
    await dbConnect()

    // Get some active products from different stores to mark as trending
    const products = await Product.find({ isActive: true }).limit(20)

    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 })
    }

    // Mark first 8 products as trending (or fewer if less available)
    const productsToMark = products.slice(0, Math.min(8, products.length))

    const updatePromises = productsToMark.map(product =>
      Product.findByIdAndUpdate(product._id, { isTrending: true })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `Marked ${productsToMark.length} products as trending`,
      productIds: productsToMark.map(p => p._id.toString())
    })
  } catch (error) {
    console.error('Seed trending error:', error)
    return NextResponse.json({ error: 'Failed to seed trending products' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await dbConnect()

    // Remove trending flag from all products
    await Product.updateMany({}, { isTrending: false })

    return NextResponse.json({
      success: true,
      message: 'Removed trending flag from all products'
    })
  } catch (error) {
    console.error('Clear trending error:', error)
    return NextResponse.json({ error: 'Failed to clear trending products' }, { status: 500 })
  }
}
