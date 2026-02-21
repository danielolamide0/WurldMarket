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

    console.log('[Login DEBUG] identifier (normalized):', JSON.stringify(normalizedIdentifier), 'isEmail:', isEmail, 'passwordLength:', password?.length)

    let user = null
    if (isEmail) {
      user = await User.findOne({ email: normalizedIdentifier })
      console.log('[Login DEBUG] User lookup by email:', user ? `found id=${user._id}` : 'not found')
    } else {
      user = await User.findOne({ username: normalizedIdentifier })
      console.log('[Login DEBUG] User lookup by username:', user ? `found id=${user._id}` : 'not found')
    }

    // If no User found by email, try Vendor (contactEmail + password) for legacy vendor accounts
    if (!user && isEmail) {
      const vendor = await Vendor.findOne({
        contactEmail: normalizedIdentifier,
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
      console.log('[Login DEBUG] No user -> 401 Invalid')
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
        { status: 401 }
      )
    }

    const userPwMatch = user.password === password
    console.log('[Login DEBUG] User password check: userPwLength=', String(user.password ?? '').length, 'inputPwLength=', String(password ?? '').length, 'match=', userPwMatch)
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
