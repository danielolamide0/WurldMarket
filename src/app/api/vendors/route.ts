import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Vendor from '@/models/Vendor'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const liveOnly = searchParams.get('live') === 'true'
    const vendorId = searchParams.get('id')

    if (vendorId) {
      const vendor = await Vendor.findById(vendorId)
      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }
      return NextResponse.json({
        vendor: {
          id: vendor._id.toString(),
          name: vendor.name,
          slug: vendor.slug,
          description: vendor.description,
          logo: vendor.logo,
          contactEmail: vendor.contactEmail,
          contactPhone: vendor.contactPhone,
          isLive: vendor.isLive,
          createdAt: vendor.createdAt.toISOString(),
        },
      })
    }

    const query = liveOnly ? { isLive: true } : {}
    const vendors = await Vendor.find(query).sort({ createdAt: -1 })

    return NextResponse.json({
      vendors: vendors.map((v) => ({
        id: v._id.toString(),
        name: v.name,
        slug: v.slug,
        description: v.description,
        logo: v.logo,
        contactEmail: v.contactEmail,
        contactPhone: v.contactPhone,
        isLive: v.isLive,
        createdAt: v.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Get vendors error:', error)
    return NextResponse.json({ error: 'Failed to get vendors' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 })
    }

    const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true })
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json({
      vendor: {
        id: vendor._id.toString(),
        name: vendor.name,
        slug: vendor.slug,
        description: vendor.description,
        logo: vendor.logo,
        contactEmail: vendor.contactEmail,
        contactPhone: vendor.contactPhone,
        isLive: vendor.isLive,
        createdAt: vendor.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Update vendor error:', error)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}
