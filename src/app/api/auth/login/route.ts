import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Vendor from '@/models/Vendor'

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

    console.log('[Login DEBUG] email:', JSON.stringify(email), 'passwordLength:', password?.length)

    let user = await User.findOne({ email })
    console.log('[Login DEBUG] User lookup by email:', user ? `found id=${user._id}` : 'not found')

    // If no User found by email, try Vendor (contactEmail + password) for legacy vendor accounts
    if (!user) {
      const vendor = await Vendor.findOne({
        contactEmail: email,
      })
      console.log('[Login DEBUG] Vendor lookup by contactEmail:', vendor ? `found id=${vendor._id} name=${vendor.name}` : 'not found')
      if (vendor) {
        const hasPassword = vendor.password !== undefined && vendor.password !== null
        const vendorPw = String(vendor.password ?? '')
        const inputPw = String(password ?? '')
        const match = vendorPw === inputPw
        const matchTrimmed = vendorPw.trim() === inputPw.trim()
        console.log('[Login DEBUG] Vendor auth: hasPassword=', hasPassword, 'vendorPwLength=', vendorPw.length, 'inputPwLength=', inputPw.length, 'match=', match, 'matchTrimmed=', matchTrimmed)
      }
      const vendorPwOk = vendor?.password !== undefined && vendor?.password !== null
      const passwordMatches = vendorPwOk && (String(vendor.password) === String(password) || String(vendor.password).trim() === String(password).trim())
      if (vendor && vendorPwOk && passwordMatches) {
        console.log('[Login DEBUG] Vendor password matched -> creating User for vendor id=', vendor._id)
        user = await User.create({
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
      console.log('[Login DEBUG] No user -> 401 Invalid')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    let userPwMatch = user.password === password
    const userPwTrimmed = String(user.password ?? '').trim() === String(password ?? '').trim()
    if (!userPwMatch && userPwTrimmed) userPwMatch = true
    console.log('[Login DEBUG] User password check: userPwLength=', String(user.password ?? '').length, 'inputPwLength=', String(password ?? '').length, 'match=', userPwMatch)

    // User exists but wrong password: if they're a vendor, try Vendor's password (sync User to Vendor)
    if (!userPwMatch && user.vendorId) {
      const vendor = await Vendor.findById(user.vendorId)
      if (vendor?.password !== undefined && vendor?.password !== null) {
        const vendorPw = String(vendor.password).trim()
        const inputPw = String(password).trim()
        if (vendorPw === inputPw) {
          console.log('[Login DEBUG] User password wrong but Vendor password matched -> syncing User.password to Vendor')
          user.password = vendor.password
          await user.save()
          userPwMatch = true
        }
      }
    }

    if (!userPwMatch) {
      console.log('[Login DEBUG] Password mismatch -> 401 Incorrect password')
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
