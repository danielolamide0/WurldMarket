import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'
import Store from '@/models/Store'
import Product from '@/models/Product'
import Order from '@/models/Order'
import VerificationCode from '@/models/VerificationCode'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { userId, code } = body

    if (!userId || !code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'User ID and verification code are required' },
        { status: 400 }
      )
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'vendor' || !user.vendorId) {
      return NextResponse.json(
        { error: 'Only vendor accounts can use this' },
        { status: 403 }
      )
    }

    const email = (user.email || '').toLowerCase().trim()
    if (!email) {
      return NextResponse.json(
        { error: 'Account has no email on file' },
        { status: 400 }
      )
    }

    const verificationCode = await VerificationCode.findOne({
      email,
      code: code.trim(),
      type: 'delete-vendor-account',
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired code. Request a new code from your account page.' },
        { status: 400 }
      )
    }

    await VerificationCode.updateOne(
      { _id: verificationCode._id },
      { $set: { used: true } }
    )

    const vendorId = user.vendorId

    // Delete in order: products (ref store/vendor), orders (ref vendor/store), stores, vendor, then downgrade user
    await Product.deleteMany({ vendorId })
    await Order.deleteMany({ vendorId })
    await Store.deleteMany({ vendorId })
    await Vendor.findByIdAndDelete(vendorId)

    await User.findByIdAndUpdate(userId, {
      $unset: { vendorId: 1 },
      $set: { role: 'customer' },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vendor delete account error:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor account' },
      { status: 500 }
    )
  }
}
