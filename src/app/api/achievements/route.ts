import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEMO_USER_ID = 'demo@dontbuytech.com'

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: DEMO_USER_ID },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const allAchievements = await prisma.achievement.findMany()

    const achievementsWithStatus = allAchievements.map((achievement: any) => {
      const userAchievement = user.achievements.find(
        (ua: any) => ua.achievementId === achievement.id
      )

      return {
        ...achievement,
        earned: !!userAchievement,
        earnedAt: userAchievement?.earnedAt || null,
      }
    })

    return NextResponse.json(achievementsWithStatus)
  } catch (error) {
    console.error('Error fetching achievements:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}
