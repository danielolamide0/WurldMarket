import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const existingUser = await User.findOne({ username })
    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error('Check username error:', error)
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 })
  }
}
