import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import VerificationCode from '@/models/VerificationCode'

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, code, type } = body

    if (!email || !code || !type) {
      return NextResponse.json(
        { error: 'Email, code, and type are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find valid, unused, non-expired code
    const verificationCode = await VerificationCode.findOne({
      email: normalizedEmail,
      code,
      type,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark code as used
    verificationCode.used = true
    await verificationCode.save()

    return NextResponse.json({
      success: true,
      verified: true,
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}
