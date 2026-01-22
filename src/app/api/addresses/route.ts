import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import SavedAddress from '@/models/SavedAddress'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const addressId = searchParams.get('id')

    if (addressId) {
      const address = await SavedAddress.findById(addressId)
      if (!address) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 })
      }
      return NextResponse.json({ address: formatAddress(address) })
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const addresses = await SavedAddress.find({ userId }).sort({ isPrimary: -1, createdAt: -1 })
    return NextResponse.json({ addresses: addresses.map(formatAddress) })
  } catch (error) {
    console.error('Get addresses error:', error)
    return NextResponse.json({ error: 'Failed to get addresses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { userId, label, fullAddress, city, postcode, isPrimary } = body

    if (!userId || !fullAddress || !city || !postcode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If primary, unset others
    if (isPrimary) {
      await SavedAddress.updateMany({ userId }, { isPrimary: false })
    }

    // First address becomes primary
    const count = await SavedAddress.countDocuments({ userId })
    const shouldBePrimary = isPrimary || count === 0

    const address = await SavedAddress.create({
      userId,
      label: label || 'Home',
      fullAddress,
      city,
      postcode,
      isPrimary: shouldBePrimary,
    })

    return NextResponse.json({ address: formatAddress(address) }, { status: 201 })
  } catch (error) {
    console.error('Create address error:', error)
    return NextResponse.json({ error: 'Failed to create address' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { id, isPrimary, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    if (isPrimary) {
      const addr = await SavedAddress.findById(id)
      if (addr) {
        await SavedAddress.updateMany({ userId: addr.userId }, { isPrimary: false })
      }
    }

    const address = await SavedAddress.findByIdAndUpdate(id, { ...updateData, isPrimary }, { new: true })
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    return NextResponse.json({ address: formatAddress(address) })
  } catch (error) {
    console.error('Update address error:', error)
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const addressId = searchParams.get('id')

    if (!addressId) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    const address = await SavedAddress.findByIdAndDelete(addressId)
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // If was primary, make another primary
    if (address.isPrimary) {
      const next = await SavedAddress.findOne({ userId: address.userId })
      if (next) {
        await SavedAddress.findByIdAndUpdate(next._id, { isPrimary: true })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete address error:', error)
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 })
  }
}

function formatAddress(address: InstanceType<typeof SavedAddress>) {
  return {
    id: address._id.toString(),
    userId: address.userId.toString(),
    label: address.label,
    fullAddress: address.fullAddress,
    city: address.city,
    postcode: address.postcode,
    isPrimary: address.isPrimary,
    createdAt: address.createdAt.toISOString(),
  }
}
