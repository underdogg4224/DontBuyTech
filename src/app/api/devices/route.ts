import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Demo user ID for simplicity (in real app, use auth)
const DEMO_USER_ID = 'demo@dontbuytech.com'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_ID },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const devices = await prisma.device.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(devices)
  } catch (error) {
    console.error('Error fetching devices:', error)
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, purchaseDate, cost, status, notes } = body

    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_ID },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const device = await prisma.device.create({
      data: {
        userId: user.id,
        name,
        category,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        cost: cost ? parseFloat(cost) : null,
        status: status || 'active',
        notes,
      },
    })

    return NextResponse.json(device, { status: 201 })
  } catch (error) {
    console.error('Error creating device:', error)
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 })
  }
}
