import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'
import CustomerData from '@/models/CustomerData'
import VerificationCode from '@/models/VerificationCode'
import { hashPassword } from '@/lib/password'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const {
      email,
      verificationCode,
      password,
      name,
      phone,
      role = 'customer',
      companyName
    } = body

    // Email-based signup (new users)
    if (!email || !verificationCode || !password || !name) {
      return NextResponse.json(
        { error: 'Email, verification code, password, and name are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify the code
    const validCode = await VerificationCode.findOne({
      email: normalizedEmail,
      code: verificationCode,
      type: 'signup',
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!validCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new code.' },
        { status: 400 }
      )
    }

    // Email can only be used once (one account per email, customer or vendor)
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered. Sign in or recover your password.' },
        { status: 409 }
      )
    }

    let vendorId = undefined

    // For vendor signup
    if (role === 'vendor') {
      if (!companyName) {
        return NextResponse.json(
          { error: 'Company name is required for vendor signup' },
          { status: 400 }
        )
      }

      const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

      const existingVendor = await Vendor.findOne({ slug })
      if (existingVendor) {
        return NextResponse.json(
          { error: 'A vendor with this company name already exists' },
          { status: 409 }
        )
      }

      const vendor = await Vendor.create({
        name: companyName,
        slug,
        description: '',
        contactEmail: normalizedEmail,
        contactPhone: phone || '',
        isLive: false,
      })
      vendorId = vendor._id
    }

    const hashedPassword = await hashPassword(password)

    // Create user with email-based auth (email only, no username)
    const user = await User.create({
      password: hashedPassword,
      role,
      name,
      email: normalizedEmail,
      phone,
      vendorId,
      authMethod: 'email',
      isEmailVerified: true,
    })

    // Mark verification code as used
    validCode.used = true
    await validCode.save()

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
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vendorId: vendorId?.toString(),
        authMethod: 'email',
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
      },
      vendorId: vendorId?.toString(),
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
