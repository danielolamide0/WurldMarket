import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Store from '@/models/Store'
import Order from '@/models/Order'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const storeId = searchParams.get('id')

    if (storeId) {
      const store = await Store.findById(storeId)
      if (!store) {
        return NextResponse.json({ error: 'Store not found' }, { status: 404 })
      }

      const ratingResult = await Order.aggregate([
        { $match: { storeId: store._id, status: 'completed', rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ])
      const averageRating = ratingResult[0] ? Math.round(ratingResult[0].avg * 10) / 10 : undefined
      const reviewCount = ratingResult[0]?.count ?? 0

      return NextResponse.json({
        store: {
          id: store._id.toString(),
          vendorId: store.vendorId.toString(),
          name: store.name,
          address: store.address,
          city: store.city,
          postcode: store.postcode,
          coordinates: store.coordinates,
          openingHours: store.openingHours,
          isActive: store.isActive,
          image: store.image,
          averageRating,
          reviewCount,
        },
      })
    }

    const query: Record<string, unknown> = {}
    if (vendorId) query.vendorId = vendorId

    const stores = await Store.find(query).sort({ createdAt: -1 })

    return NextResponse.json({
      stores: stores.map((s) => ({
        id: s._id.toString(),
        vendorId: s.vendorId.toString(),
        name: s.name,
        address: s.address,
        city: s.city,
        postcode: s.postcode,
        coordinates: s.coordinates,
        openingHours: s.openingHours,
        isActive: s.isActive,
        image: s.image,
      })),
    })
  } catch (error) {
    console.error('Get stores error:', error)
    return NextResponse.json({ error: 'Failed to get stores' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { vendorId, name, address, city, postcode, coordinates, openingHours, image } = body

    if (!vendorId || !name || !address || !city || !postcode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const store = await Store.create({
      vendorId,
      name,
      address,
      city,
      postcode,
      coordinates: coordinates || { lat: 51.5074, lng: -0.1278 },
      openingHours,
      image: image || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
    })

    return NextResponse.json({
      store: {
        id: store._id.toString(),
        vendorId: store.vendorId.toString(),
        name: store.name,
        address: store.address,
        city: store.city,
        postcode: store.postcode,
        coordinates: store.coordinates,
        openingHours: store.openingHours,
        isActive: store.isActive,
        image: store.image,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Create store error:', error)
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 })
    }

    const store = await Store.findByIdAndUpdate(id, updateData, { new: true })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({
      store: {
        id: store._id.toString(),
        vendorId: store.vendorId.toString(),
        name: store.name,
        address: store.address,
        city: store.city,
        postcode: store.postcode,
        coordinates: store.coordinates,
        openingHours: store.openingHours,
        isActive: store.isActive,
        image: store.image,
      },
    })
  } catch (error) {
    console.error('Update store error:', error)
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('id')

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 })
    }

    const store = await Store.findByIdAndDelete(storeId)
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete store error:', error)
    return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 })
  }
}
