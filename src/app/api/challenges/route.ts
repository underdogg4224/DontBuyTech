import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo@dontbuytech.com'

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(challenges)
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { challengeId } = body

    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_ID },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + challenge.duration)

    const userChallenge = await prisma.userChallenge.create({
      data: {
        userId: user.id,
        challengeId: challenge.id,
        startDate: new Date(),
        endDate,
        status: 'active',
        progress: 0,
      },
    })

    return NextResponse.json(userChallenge, { status: 201 })
  } catch (error) {
    console.error('Error joining challenge:', error)
    return NextResponse.json({ error: 'Failed to join challenge' }, { status: 500 })
  }
}
