import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import CustomerData from '@/models/CustomerData'
import VerificationCode from '@/models/VerificationCode'
import mongoose from 'mongoose'

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { userId, code } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Find the user first
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Only customer accounts use this endpoint; vendors use /api/vendor/delete-account
    if (user.role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customer accounts can use this endpoint' },
        { status: 403 }
      )
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Verification code is required. Request a code from your account settings.' },
        { status: 400 }
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
      type: 'delete-customer-account',
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

    // Delete customer data if exists
    await CustomerData.deleteOne({ userId: new mongoose.Types.ObjectId(userId) })

    // Delete addresses
    const db = mongoose.connection.db
    if (db) {
      await db.collection('addresses').deleteMany({ userId: userId })
      await db.collection('carts').deleteMany({ userId: userId })
    }

    // Delete the user
    await User.findByIdAndDelete(userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
