import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { identifier, password } = body

    // Support both 'identifier' (new) and 'username' (legacy) field names
    const loginIdentifier = identifier || body.username

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase().trim()

    // Check if identifier looks like an email
    const isEmail = normalizedIdentifier.includes('@')

    // Find user by email or username
    let user
    if (isEmail) {
      user = await User.findOne({ email: normalizedIdentifier })
    } else {
      user = await User.findOne({ username: normalizedIdentifier })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      )
    }

    // In production, use bcrypt.compare
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vendorId: user.vendorId?.toString(),
        authMethod: user.authMethod || 'username',
        isEmailVerified: user.isEmailVerified || false,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
