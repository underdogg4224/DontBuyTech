import { NextResponse } from 'next/server'
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

    const userChallenges = await prisma.userChallenge.findMany({
      where: { userId: user.id },
      include: {
        challenge: true,
        checkIns: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(userChallenges)
  } catch (error) {
    console.error('Error fetching user challenges:', error)
    return NextResponse.json({ error: 'Failed to fetch user challenges' }, { status: 500 })
  }
}
