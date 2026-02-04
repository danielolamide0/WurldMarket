import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import VerificationCode from '@/models/VerificationCode'
import { sendVerificationEmail } from '@/lib/email'

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, type } = body

    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email and type are required' },
        { status: 400 }
      )
    }

    if (!['signup', 'password-reset'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid verification type' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check user existence based on type
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (type === 'signup') {
      // For signup, email should NOT already be registered
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }
    } else if (type === 'password-reset') {
      // For password reset, email MUST exist
      if (!existingUser) {
        // Return success anyway to prevent email enumeration
        return NextResponse.json({ success: true })
      }
    }

    // Rate limiting: Check for recent codes sent to this email
    const recentCode = await VerificationCode.findOne({
      email: normalizedEmail,
      type,
      createdAt: { $gte: new Date(Date.now() - 60000) }, // Within last minute
    })

    if (recentCode) {
      return NextResponse.json(
        { error: 'Please wait before requesting another code' },
        { status: 429 }
      )
    }

    // Invalidate any existing unused codes for this email/type
    await VerificationCode.updateMany(
      { email: normalizedEmail, type, used: false },
      { $set: { used: true } }
    )

    // Generate new code
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Save code to database
    await VerificationCode.create({
      email: normalizedEmail,
      code,
      type,
      expiresAt,
      used: false,
    })

    // Send email
    const emailResult = await sendVerificationEmail(normalizedEmail, code, type)

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    )
  }
}
