import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import CustomerData from '@/models/CustomerData'
import mongoose from 'mongoose'

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { userId } = body

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
