import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function POST() {
  try {
    await dbConnect()

    // Get all unique vendors
    const vendors = await Product.distinct('vendorId')

    const updatedProducts = []

    // For each vendor, pick one product and make it an offer
    for (const vendorId of vendors) {
      // Find one active product from this vendor that isn't already on offer
      const product = await Product.findOne({
        vendorId,
        isActive: true,
        isOnOffer: { $ne: true },
      })

      if (product) {
        // Set offer details
        const originalPrice = parseFloat((product.price * 1.25).toFixed(2)) // 25% higher than current
        const offerEndDate = new Date()
        offerEndDate.setDate(offerEndDate.getDate() + 14) // Offer valid for 14 days

        await Product.findByIdAndUpdate(product._id, {
          isOnOffer: true,
          originalPrice,
          offerEndDate,
        })

        updatedProducts.push({
          id: product._id.toString(),
          name: product.name,
          vendorId: vendorId.toString(),
          originalPrice,
          currentPrice: product.price,
          offerEndDate: offerEndDate.toISOString(),
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Set up offers for ${updatedProducts.length} products`,
      products: updatedProducts,
    })
  } catch (error) {
    console.error('Setup offers error:', error)
    return NextResponse.json({ error: 'Failed to setup offers' }, { status: 500 })
  }
}
