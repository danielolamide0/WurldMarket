import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import { formatOrder } from '../route'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    await dbConnect()

    const { orderId } = await params
    const body = await request.json()
    const { customerId, rating, review } = body

    if (!orderId || !customerId) {
      return NextResponse.json(
        { error: 'Order ID and customer ID are required' },
        { status: 400 }
      )
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.customerId.toString() !== customerId) {
      return NextResponse.json(
        { error: 'You can only add a review to your own order' },
        { status: 403 }
      )
    }

    if (order.status !== 'completed') {
      return NextResponse.json(
        { error: 'You can only review completed orders' },
        { status: 400 }
      )
    }

    const ratingNum = rating != null ? Number(rating) : undefined
    if (ratingNum !== undefined && (ratingNum < 0 || ratingNum > 5 || !Number.isInteger(ratingNum))) {
      return NextResponse.json(
        { error: 'Rating must be an integer from 0 to 5' },
        { status: 400 }
      )
    }

    const update: { rating?: number; review?: string } = {}
    if (ratingNum !== undefined) update.rating = ratingNum
    if (review !== undefined) update.review = typeof review === 'string' ? review.trim() : ''

    const updated = await Order.findByIdAndUpdate(
      orderId,
      { $set: update },
      { new: true }
    )

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order: formatOrder(updated) })
  } catch (error) {
    console.error('Update order review error:', error)
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    )
  }
}
