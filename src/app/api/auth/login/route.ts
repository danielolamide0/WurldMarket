import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'
import { verifyPassword, hashPassword } from '@/lib/password'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { identifier, password } = body

    const email = (identifier || body.email || '').toString().toLowerCase().trim()
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter your email address to sign in' },
        { status: 400 }
      )
    }

    let user = await User.findOne({ email })

    // If no User found by email, try Vendor (contactEmail + password) for legacy vendor accounts
    if (!user) {
      const vendor = await Vendor.findOne({ contactEmail: email })
      if (vendor && vendor.password != null && vendor.password !== '') {
        const { match, migrate } = await verifyPassword(password, vendor.password)
        if (match) {
          const hashed = migrate ? await hashPassword(password) : vendor.password
          user = await User.create({
            password: hashed,
            role: 'vendor',
            name: vendor.name,
            email: vendor.contactEmail,
            phone: vendor.contactPhone || '',
            vendorId: vendor._id,
            authMethod: 'email',
            isEmailVerified: true,
          })
          if (migrate) {
            await Vendor.findByIdAndUpdate(vendor._id, { password: hashed })
          }
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    let { match: userPwMatch, migrate: needMigrate } = await verifyPassword(password, user.password)

    if (!userPwMatch && user.vendorId) {
      const vendor = await Vendor.findById(user.vendorId)
      if (vendor?.password != null && vendor.password !== '') {
        const { match: vendorMatch, migrate: vendorMigrate } = await verifyPassword(password, vendor.password)
        if (vendorMatch) {
          const hashed = vendorMigrate ? await hashPassword(password) : vendor.password
          user.password = hashed
          await user.save()
          if (vendorMigrate) {
            await Vendor.findByIdAndUpdate(vendor._id, { password: hashed })
          }
          userPwMatch = true
        }
      }
    }

    if (needMigrate && userPwMatch) {
      const hashed = await hashPassword(password)
      user.password = hashed
      await user.save()
    }

    if (!userPwMatch) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vendorId: user.vendorId?.toString(),
        authMethod: 'email',
        isEmailVerified: user.isEmailVerified ?? false,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
