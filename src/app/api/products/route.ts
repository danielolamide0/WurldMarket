import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')
    const vendorId = searchParams.get('vendorId')
    const storeId = searchParams.get('storeId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    if (productId) {
      const product = await Product.findById(productId)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      return NextResponse.json({
        product: {
          id: product._id.toString(),
          vendorId: product.vendorId.toString(),
          storeId: product.storeId.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          cuisines: product.cuisines || [],
          price: product.price,
          unit: product.unit,
          image: product.image,
          stock: product.stock,
          lowStockAlert: product.lowStockAlert,
          isActive: product.isActive,
          isOnOffer: product.isOnOffer || false,
          isTrending: product.isTrending || false,
          originalPrice: product.originalPrice,
          offerEndDate: product.offerEndDate?.toISOString(),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
      })
    }

    const query: Record<string, unknown> = { isActive: true }
    if (vendorId) query.vendorId = vendorId
    if (storeId) query.storeId = storeId
    if (category) query.category = category
    const cuisine = searchParams.get('cuisine')
    if (cuisine) {
      query.cuisines = { $in: [cuisine] }
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }
    // Hide out-of-stock products from customer-facing list (vendor views still see them via vendorId)
    if (!vendorId) {
      query.stock = { $gt: 0 }
    }

    const products = await Product.find(query).sort({ createdAt: -1 })

    return NextResponse.json({
      products: products.map((p) => ({
        id: p._id.toString(),
        vendorId: p.vendorId.toString(),
        storeId: p.storeId.toString(),
        name: p.name,
        description: p.description,
        category: p.category,
        cuisines: p.cuisines || [],
        price: p.price,
        unit: p.unit,
        image: p.image,
        stock: p.stock,
        lowStockAlert: p.lowStockAlert,
        isActive: p.isActive,
        isOnOffer: p.isOnOffer || false,
        isTrending: p.isTrending || false,
        originalPrice: p.originalPrice,
        offerEndDate: p.offerEndDate?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json({ error: 'Failed to get products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { vendorId, storeId, name, description, category, cuisines, price, unit, image, stock, lowStockAlert } = body

    if (!vendorId || !storeId || !name || !category || price === undefined || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!cuisines || !Array.isArray(cuisines) || cuisines.length === 0) {
      return NextResponse.json({ error: 'At least one cuisine must be selected' }, { status: 400 })
    }

    const { isOnOffer, originalPrice, offerEndDate } = body

    const product = await Product.create({
      vendorId,
      storeId,
      name,
      description: description || '',
      category,
      cuisines: cuisines || [],
      price,
      unit: unit || 'each',
      image,
      stock: stock || 0,
      lowStockAlert: lowStockAlert != null ? Number(lowStockAlert) : undefined,
      isOnOffer: isOnOffer || false,
      originalPrice: isOnOffer ? originalPrice : undefined,
      offerEndDate: isOnOffer && offerEndDate ? new Date(offerEndDate) : undefined,
    })

      return NextResponse.json({
        product: {
          id: product._id.toString(),
          vendorId: product.vendorId.toString(),
          storeId: product.storeId.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          cuisines: product.cuisines || [],
          price: product.price,
          unit: product.unit,
          image: product.image,
          stock: product.stock,
          lowStockAlert: product.lowStockAlert,
          isActive: product.isActive,
          isOnOffer: product.isOnOffer || false,
          isTrending: product.isTrending || false,
          originalPrice: product.originalPrice,
          offerEndDate: product.offerEndDate?.toISOString(),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
      }, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect()

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

      return NextResponse.json({
        product: {
          id: product._id.toString(),
          vendorId: product.vendorId.toString(),
          storeId: product.storeId.toString(),
          name: product.name,
          description: product.description,
          category: product.category,
          cuisines: product.cuisines || [],
          price: product.price,
          unit: product.unit,
          image: product.image,
          stock: product.stock,
          lowStockAlert: product.lowStockAlert,
          isActive: product.isActive,
          isOnOffer: product.isOnOffer || false,
          isTrending: product.isTrending || false,
          originalPrice: product.originalPrice,
          offerEndDate: product.offerEndDate?.toISOString(),
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
      })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('id')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const product = await Product.findByIdAndDelete(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
