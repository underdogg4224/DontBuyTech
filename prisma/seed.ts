import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@dontbuytech.com' },
    update: {},
    create: {
      email: 'demo@dontbuytech.com',
      name: 'Demo User',
    },
  })

  console.log('✅ Created user:', user.email)

  // Create sample devices
  const devices = await Promise.all([
    prisma.device.create({
      data: {
        userId: user.id,
        name: 'iPhone 12',
        category: 'smartphone',
        purchaseDate: new Date('2021-01-15'),
        cost: 799,
        status: 'active',
      },
    }),
    prisma.device.create({
      data: {
        userId: user.id,
        name: 'MacBook Pro',
        category: 'laptop',
        purchaseDate: new Date('2020-08-10'),
        cost: 2399,
        status: 'active',
      },
    }),
    prisma.device.create({
      data: {
        userId: user.id,
        name: 'iPad Air',
        category: 'tablet',
        purchaseDate: new Date('2022-03-20'),
        cost: 599,
        status: 'sold',
        notes: 'Sold on eBay for $400',
      },
    }),
  ])

  console.log('✅ Created', devices.length, 'devices')

  // Create sample avoided purchases
  const avoidedPurchases = await Promise.all([
    prisma.avoidedPurchase.create({
      data: {
        userId: user.id,
        itemName: 'Apple Watch Series 8',
        category: 'smartwatch',
        estimatedCost: 399,
        reason: "Realized I don't need another screen on my wrist",
        avoidedDate: new Date('2024-01-10'),
      },
    }),
    prisma.avoidedPurchase.create({
      data: {
        userId: user.id,
        itemName: 'Sony WH-1000XM5',
        category: 'headphones',
        estimatedCost: 349,
        reason: 'My current headphones work fine',
        avoidedDate: new Date('2024-02-15'),
      },
    }),
    prisma.avoidedPurchase.create({
      data: {
        userId: user.id,
        itemName: 'iPad Pro',
        category: 'tablet',
        estimatedCost: 1099,
        reason: 'Already have a laptop and phone',
        avoidedDate: new Date('2024-03-05'),
      },
    }),
  ])

  console.log('✅ Created', avoidedPurchases.length, 'avoided purchases')

  // Create challenges
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        name: '30 Days No Tech Purchases',
        description: 'Go 30 days without buying any new tech gadgets or accessories',
        duration: 30,
        type: 'no_purchases',
        difficulty: 'medium',
      },
    }),
    prisma.challenge.create({
      data: {
        name: 'Device Declutter',
        description: 'Reduce your tech devices by at least 2 items through selling, donating, or recycling',
        duration: 60,
        type: 'device_reduction',
        difficulty: 'easy',
      },
    }),
    prisma.challenge.create({
      data: {
        name: '90 Days Tech Minimalist',
        description: 'Complete mindful tech usage goals for 90 days',
        duration: 90,
        type: 'mindful_usage',
        difficulty: 'hard',
      },
    }),
  ])

  console.log('✅ Created', challenges.length, 'challenges')

  // Create user challenge
  const thirtyDayChallenge = challenges[0]
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30)

  const userChallenge = await prisma.userChallenge.create({
    data: {
      userId: user.id,
      challengeId: thirtyDayChallenge.id,
      startDate: new Date(),
      endDate: endDate,
      status: 'active',
      progress: 40,
    },
  })

  console.log('✅ User enrolled in challenge:', thirtyDayChallenge.name)

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: 'First Step',
        description: 'Avoided your first tech purchase',
        icon: '🎯',
        category: 'savings',
        requirement: JSON.stringify({ type: 'avoided_purchases', value: 1 }),
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Saving Streak',
        description: 'Saved $1000 by avoiding purchases',
        icon: '💰',
        category: 'savings',
        requirement: JSON.stringify({ type: 'total_saved', value: 1000 }),
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Challenge Champion',
        description: 'Completed your first challenge',
        icon: '🏆',
        category: 'challenges',
        requirement: JSON.stringify({ type: 'challenges_completed', value: 1 }),
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Minimalist Master',
        description: 'Reduced your device count by 5 or more',
        icon: '✨',
        category: 'devices',
        requirement: JSON.stringify({ type: 'devices_reduced', value: 5 }),
      },
    }),
    prisma.achievement.create({
      data: {
        name: '30 Day Warrior',
        description: 'Stayed committed for 30 days',
        icon: '⚡',
        category: 'mindfulness',
        requirement: JSON.stringify({ type: 'days_active', value: 30 }),
      },
    }),
  ])

  console.log('✅ Created', achievements.length, 'achievements')

  // Award first achievement to user
  await prisma.userAchievement.create({
    data: {
      userId: user.id,
      achievementId: achievements[0].id,
    },
  })

  console.log('✅ Awarded achievement to user')

  // Create a goal
  await prisma.goal.create({
    data: {
      userId: user.id,
      type: 'save_money',
      target: 5000,
      current: 1847, // Sum of avoided purchases
      status: 'active',
    },
  })

  console.log('✅ Created user goal')

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
