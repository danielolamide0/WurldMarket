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

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      )
    }

    if (!['signup', 'password-reset', 'email-change'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid verification type' },
        { status: 400 }
      )
    }

    let normalizedEmail: string

    if (type === 'email-change') {
      // Code is sent to the user's CURRENT email to confirm they own the account
      const userId = body.userId
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required to change email' },
          { status: 400 }
        )
      }
      const currentUser = await User.findById(userId)
      if (!currentUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      const currentEmail = (currentUser.email || '').toLowerCase().trim()
      if (!currentEmail) {
        return NextResponse.json(
          { error: 'Your account has no email on file. Cannot send verification.' },
          { status: 400 }
        )
      }
      normalizedEmail = currentEmail
    } else {
      if (!email) {
        return NextResponse.json(
          { error: 'Email and type are required' },
          { status: 400 }
        )
      }
      normalizedEmail = email.toLowerCase().trim()

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(normalizedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
    }

    if (type !== 'email-change') {
      const existingUser = await User.findOne({ email: normalizedEmail })
      if (type === 'signup') {
        if (existingUser) {
          return NextResponse.json(
            { error: 'This email is already registered. Each email can only be used for one account.' },
            { status: 409 }
          )
        }
      } else if (type === 'password-reset') {
        if (!existingUser) {
          return NextResponse.json({ success: true })
        }
      }
    }

    // Rate limiting: Check for recent codes sent to this email
    const rateLimitWindow = 60000 // 60 seconds
    const recentCode = await VerificationCode.findOne({
      email: normalizedEmail,
      type,
      createdAt: { $gte: new Date(Date.now() - rateLimitWindow) },
    })

    if (recentCode) {
      const timeElapsed = Date.now() - recentCode.createdAt.getTime()
      const timeRemaining = Math.ceil((rateLimitWindow - timeElapsed) / 1000) // Remaining seconds
      return NextResponse.json(
        { 
          error: 'Please wait before requesting another code',
          timeRemaining 
        },
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
