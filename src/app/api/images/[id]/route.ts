import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import ProductImage from '@/models/ProductImage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return new NextResponse('Bad Request', { status: 400 })
    }
    await dbConnect()
    const doc = await ProductImage.findById(id)
    if (!doc) {
      return new NextResponse('Not Found', { status: 404 })
    }
    return new NextResponse(doc.data, {
      status: 200,
      headers: {
        'Content-Type': doc.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image serve error:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
