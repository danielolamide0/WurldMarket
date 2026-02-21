import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { identifier, password } = body

    const loginIdentifier = identifier || body.username
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase().trim()
    const isEmail = normalizedIdentifier.includes('@')

    let user = null
    if (isEmail) {
      user = await User.findOne({ email: normalizedIdentifier })
    } else {
      user = await User.findOne({ username: normalizedIdentifier })
    }

    // If no User found by email, try Vendor (contactEmail + password) for legacy vendor accounts
    if (!user && isEmail) {
      const vendor = await Vendor.findOne({
        contactEmail: normalizedIdentifier,
      })
      if (vendor?.password !== undefined && vendor.password !== null && String(vendor.password) === String(password)) {
        const emailPrefix = normalizedIdentifier.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'vendor'
        let username = emailPrefix
        let counter = 0
        while (await User.findOne({ username })) {
          counter++
          username = `${emailPrefix}${counter}`
        }
        user = await User.create({
          username,
          password: vendor.password,
          role: 'vendor',
          name: vendor.name,
          email: vendor.contactEmail,
          phone: vendor.contactPhone || '',
          vendorId: vendor._id,
          authMethod: 'email',
          isEmailVerified: true,
        })
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      )
    }

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
