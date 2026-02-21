import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

/**
 * One-time migration: remove the `username` field from all User documents in MongoDB.
 * Call POST /api/auth/migrate-remove-username once, then you can delete this route.
 */
export async function POST() {
  try {
    await dbConnect()

    const result = await User.updateMany(
      {},
      { $unset: { username: '' } }
    )

    return NextResponse.json({
      success: true,
      message: `Removed username field from ${result.modifiedCount} user(s).`,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount,
    })
  } catch (error) {
    console.error('Migrate remove username error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    )
  }
}
