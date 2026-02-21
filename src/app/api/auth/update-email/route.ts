import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import VerificationCode from '@/models/VerificationCode'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { userId, newEmail, code } = body

    if (!userId || !newEmail || !code) {
      return NextResponse.json(
        { error: 'User ID, new email, and verification code are required' },
        { status: 400 }
      )
    }

    const normalizedNewEmail = newEmail.toLowerCase().trim()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const currentEmail = (user.email || '').toLowerCase().trim()
    if (!currentEmail) {
      return NextResponse.json(
        { error: 'Account has no email on file.' },
        { status: 400 }
      )
    }

    // Code was sent to current email; verify it
    const verificationCode = await VerificationCode.findOne({
      email: currentEmail,
      code,
      type: 'email-change',
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    if (normalizedNewEmail === currentEmail) {
      return NextResponse.json(
        { error: 'New email is the same as your current email' },
        { status: 400 }
      )
    }

    // Ensure no other user has taken this email since the code was sent
    const existingOther = await User.findOne({
      email: normalizedNewEmail,
      _id: { $ne: userId },
    })
    if (existingOther) {
      return NextResponse.json(
        { error: 'This email is already registered by another account.' },
        { status: 409 }
      )
    }

    user.email = normalizedNewEmail
    await user.save()

    verificationCode.used = true
    await verificationCode.save()

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vendorId: user.vendorId?.toString(),
        authMethod: 'email',
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Update email error:', error)
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    )
  }
}
