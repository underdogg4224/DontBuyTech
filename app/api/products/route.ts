import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const sortBy = searchParams.get('sortBy') || 'remorseScore'
    const search = searchParams.get('search')

    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ]
    }

    let orderBy: any = {}
    if (sortBy === 'remorseScore') {
      orderBy = { remorseScore: 'desc' }
    } else if (sortBy === 'marketingHype') {
      orderBy = { marketingHypeScore: 'desc' }
    } else if (sortBy === 'recent') {
      orderBy = { createdAt: 'desc' }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        reviews: {
          take: 3,
          orderBy: { upvotes: 'desc' },
        },
      },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        category: body.category,
        manufacturer: body.manufacturer,
        msrp: parseFloat(body.msrp),
        imageUrl: body.imageUrl || null,
        description: body.description,
        whyPeopleRegret: body.whyPeopleRegret,
        marketingHypeScore: 0,
        actualUsefulnessScore: 0,
        remorseScore: 0,
        totalReviews: 0,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
