import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'
import CustomerData from '@/models/CustomerData'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { username, password, name, email, phone, role = 'customer', companyName } = body

    if (!username || !password || !name) {
      return NextResponse.json({ error: 'Username, password, and name are required' }, { status: 400 })
    }

    // Check if username exists
    const existingUser = await User.findOne({ username: username.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }

    let vendorId = undefined

    // For vendor signup
    if (role === 'vendor') {
      if (!companyName) {
        return NextResponse.json({ error: 'Company name is required for vendor signup' }, { status: 400 })
      }

      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const existingVendor = await Vendor.findOne({ slug })
      if (existingVendor) {
        return NextResponse.json({ error: 'A vendor with this company name already exists' }, { status: 409 })
      }

      const vendor = await Vendor.create({
        name: companyName,
        slug,
        description: '',
        contactEmail: email || '',
        contactPhone: phone || '',
        isLive: false,
      })
      vendorId = vendor._id
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      password,
      role,
      name,
      email,
      phone,
      vendorId,
    })

    // Create CustomerData for customers
    if (role === 'customer') {
      await CustomerData.create({
        userId: user._id,
        favorites: [],
        regulars: [],
        purchaseHistory: [],
      })
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vendorId: vendorId?.toString(),
        createdAt: user.createdAt.toISOString(),
      },
      vendorId: vendorId?.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
