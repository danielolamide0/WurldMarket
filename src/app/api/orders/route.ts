import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import { GUEST_CUSTOMER_OBJECT_ID } from '@/lib/constants'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Store from '@/models/Store'
import Vendor from '@/models/Vendor'
import CustomerData from '@/models/CustomerData'
import { sendLowStockEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    const customerId = searchParams.get('customerId')
    const vendorId = searchParams.get('vendorId')
    const status = searchParams.get('status')
    const isGuestOrder = searchParams.get('isGuestOrder')

    if (orderId) {
      const order = await Order.findById(orderId)
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      return NextResponse.json({ order: formatOrder(order) })
    }

    const query: Record<string, unknown> = {}
    if (customerId) query.customerId = customerId
    if (vendorId) query.vendorId = vendorId
    if (status) query.status = status
    if (isGuestOrder === 'true') query.isGuestOrder = true
    if (isGuestOrder === 'false') query.isGuestOrder = false

    const orders = await Order.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ orders: orders.map(formatOrder) })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: 'Failed to get orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      customerId, customerName, customerPhone, vendorId, storeId, storeName,
      items, subtotal, deliveryFee, total, orderType, deliveryAddress, notes,
    } = body

    if (!customerId || !customerName || !customerPhone || !vendorId || !storeId || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Guest checkout: persist in same Order collection with sentinel ID and isGuestOrder flag
    const isGuest = customerId === 'guest'
    const orderCustomerId = isGuest
      ? new mongoose.Types.ObjectId(GUEST_CUSTOMER_OBJECT_ID)
      : customerId

    // Look up store name if not provided
    let resolvedStoreName = storeName
    if (!resolvedStoreName) {
      const store = await Store.findById(storeId)
      resolvedStoreName = store?.name || 'Unknown Store'
    }

    const order = await Order.create({
      customerId: orderCustomerId,
      customerName,
      customerPhone,
      vendorId,
      storeId,
      storeName: resolvedStoreName,
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      status: 'pending',
      orderType,
      deliveryAddress,
      notes,
      isGuestOrder: isGuest,
    })

    // Decrement stock and check low-stock alerts (don't let email break the order)
    for (const item of items) {
      const product = await Product.findById(item.productId)
      if (!product) continue
      const previousStock = product.stock
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
      const newStock = previousStock - item.quantity
      const alert = product.lowStockAlert ?? 0
      if (alert > 0 && newStock <= alert) {
        try {
          const vendor = await Vendor.findById(product.vendorId)
          if (vendor?.contactEmail) {
            await sendLowStockEmail(vendor.contactEmail, product.name, newStock, alert)
          }
        } catch (err) {
          console.error('Low stock email failed:', err)
        }
      }
    }

    // Record purchase history
    const customerData = await CustomerData.findOne({ userId: customerId })
    if (customerData) {
      const purchases = items.map((item: { productId: string; quantity: number }) => ({
        productId: item.productId,
        purchasedAt: new Date(),
        quantity: item.quantity,
      }))
      await CustomerData.findByIdAndUpdate(customerData._id, {
        $push: { purchaseHistory: { $each: purchases } },
      })
    }

    return NextResponse.json({ order: formatOrder(order) }, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { id, status, restoreInventory } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true })
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // When cancelling, optionally add each item's quantity back to product stock
    if (status === 'cancelled' && restoreInventory === true && order.items?.length) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        })
      }
    }

    return NextResponse.json({ order: formatOrder(updated) })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export function formatOrder(order: InstanceType<typeof Order>) {
  return {
    id: order._id.toString(),
    customerId: order.customerId.toString(),
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    vendorId: order.vendorId.toString(),
    storeId: order.storeId.toString(),
    storeName: order.storeName,
    items: order.items.map((item) => ({
      productId: item.productId.toString(),
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      unit: item.unit,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    status: order.status,
    orderType: order.orderType,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    isGuestOrder: !!order.isGuestOrder,
    rating: order.rating,
    review: order.review,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}
