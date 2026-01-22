import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import CustomerData from '@/models/CustomerData'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let data = await CustomerData.findOne({ userId })

    if (!data) {
      data = await CustomerData.create({
        userId,
        favorites: [],
        regulars: [],
        purchaseHistory: [],
      })
    }

    return NextResponse.json({
      customerData: {
        id: data._id.toString(),
        userId: data.userId.toString(),
        favorites: data.favorites.map((f) => f.toString()),
        regulars: data.regulars.map((r) => r.toString()),
        purchaseHistory: data.purchaseHistory.map((p) => ({
          productId: p.productId.toString(),
          purchasedAt: p.purchasedAt.toISOString(),
          quantity: p.quantity,
        })),
      },
    })
  } catch (error) {
    console.error('Get customer data error:', error)
    return NextResponse.json({ error: 'Failed to get customer data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { userId, action, productId, vendorId, quantity } = body

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 })
    }

    let data = await CustomerData.findOne({ userId })
    if (!data) {
      data = await CustomerData.create({
        userId,
        favorites: [],
        regulars: [],
        purchaseHistory: [],
      })
    }

    switch (action) {
      case 'addFavorite':
        if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        await CustomerData.findByIdAndUpdate(data._id, { $addToSet: { favorites: productId } })
        break

      case 'removeFavorite':
        if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        await CustomerData.findByIdAndUpdate(data._id, { $pull: { favorites: productId } })
        break

      case 'addRegular':
        if (!vendorId) return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 })
        await CustomerData.findByIdAndUpdate(data._id, { $addToSet: { regulars: vendorId } })
        break

      case 'removeRegular':
        if (!vendorId) return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 })
        await CustomerData.findByIdAndUpdate(data._id, { $pull: { regulars: vendorId } })
        break

      case 'recordPurchase':
        if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        await CustomerData.findByIdAndUpdate(data._id, {
          $push: { purchaseHistory: { productId, purchasedAt: new Date(), quantity: quantity || 1 } },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updated = await CustomerData.findOne({ userId })

    return NextResponse.json({
      customerData: {
        id: updated!._id.toString(),
        userId: updated!.userId.toString(),
        favorites: updated!.favorites.map((f) => f.toString()),
        regulars: updated!.regulars.map((r) => r.toString()),
        purchaseHistory: updated!.purchaseHistory.map((p) => ({
          productId: p.productId.toString(),
          purchasedAt: p.purchasedAt.toISOString(),
          quantity: p.quantity,
        })),
      },
    })
  } catch (error) {
    console.error('Update customer data error:', error)
    return NextResponse.json({ error: 'Failed to update customer data' }, { status: 500 })
  }
}
