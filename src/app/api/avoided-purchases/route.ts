import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo@dontbuytech.com'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_ID },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const purchases = await prisma.avoidedPurchase.findMany({
      where: { userId: user.id },
      orderBy: { avoidedDate: 'desc' },
    })

    // Calculate statistics
    const totalSaved = purchases.reduce((sum: number, p: any) => sum + p.estimatedCost, 0)
    const thisMonth = purchases.filter((p: any) => {
      const now = new Date()
      const purchaseDate = new Date(p.avoidedDate)
      return purchaseDate.getMonth() === now.getMonth() &&
             purchaseDate.getFullYear() === now.getFullYear()
    }).reduce((sum: number, p: any) => sum + p.estimatedCost, 0)

    const thisYear = purchases.filter((p: any) => {
      const now = new Date()
      const purchaseDate = new Date(p.avoidedDate)
      return purchaseDate.getFullYear() === now.getFullYear()
    }).reduce((sum: number, p: any) => sum + p.estimatedCost, 0)

    return NextResponse.json({
      purchases,
      stats: {
        totalSaved,
        purchasesAvoided: purchases.length,
        averageSavings: purchases.length > 0 ? totalSaved / purchases.length : 0,
        thisMonth,
        thisYear,
      },
    })
  } catch (error) {
    console.error('Error fetching avoided purchases:', error)
    return NextResponse.json({ error: 'Failed to fetch avoided purchases' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemName, category, estimatedCost, reason, notes } = body

    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_ID },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const purchase = await prisma.avoidedPurchase.create({
      data: {
        userId: user.id,
        itemName,
        category,
        estimatedCost: parseFloat(estimatedCost),
        reason,
        notes,
      },
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error creating avoided purchase:', error)
    return NextResponse.json({ error: 'Failed to create avoided purchase' }, { status: 500 })
  }
}
