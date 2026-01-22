import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Cart from '@/models/Cart'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = await Cart.create({ userId, items: [] })
    }

    return NextResponse.json({
      cart: {
        id: cart._id.toString(),
        userId: cart.userId.toString(),
        items: cart.items.map((item) => ({
          productId: item.productId.toString(),
          storeId: item.storeId.toString(),
          vendorId: item.vendorId.toString(),
          name: item.name,
          price: item.price,
          unit: item.unit,
          image: item.image,
          quantity: item.quantity,
          stock: item.stock,
        })),
      },
    })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json({ error: 'Failed to get cart' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { userId, items } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    let cart = await Cart.findOne({ userId })
    if (!cart) {
      cart = await Cart.create({ userId, items: items || [] })
    } else {
      cart = await Cart.findOneAndUpdate({ userId }, { items: items || [] }, { new: true })
    }

    return NextResponse.json({
      cart: {
        id: cart!._id.toString(),
        userId: cart!.userId.toString(),
        items: cart!.items.map((item) => ({
          productId: item.productId.toString(),
          storeId: item.storeId.toString(),
          vendorId: item.vendorId.toString(),
          name: item.name,
          price: item.price,
          unit: item.unit,
          image: item.image,
          quantity: item.quantity,
          stock: item.stock,
        })),
      },
    })
  } catch (error) {
    console.error('Update cart error:', error)
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    await Cart.findOneAndUpdate({ userId }, { items: [] })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Clear cart error:', error)
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}
