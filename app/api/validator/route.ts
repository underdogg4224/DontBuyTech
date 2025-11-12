import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { useCase, productName, budget } = body

    // Find similar products that people regret
    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: productName || '', mode: 'insensitive' } },
          { description: { contains: useCase || '', mode: 'insensitive' } },
        ],
      },
      include: {
        reviews: {
          take: 2,
          orderBy: { upvotes: 'desc' },
        },
        useCases: true,
      },
      take: 5,
    })

    // Find use cases that match
    const matchingUseCases = await prisma.useCase.findMany({
      where: {
        intendedUseCase: { contains: useCase || '', mode: 'insensitive' },
      },
      include: {
        product: true,
      },
      take: 5,
    })

    // Generate recommendation
    const recommendation = generateRecommendation(
      useCase,
      productName,
      budget,
      similarProducts,
      matchingUseCases
    )

    return NextResponse.json({
      recommendation,
      similarProducts,
      matchingUseCases,
      estimatedSavings: calculateSavings(similarProducts, budget),
    })
  } catch (error) {
    console.error('Error in use case validator:', error)
    return NextResponse.json(
      { error: 'Failed to validate use case' },
      { status: 500 }
    )
  }
}

function generateRecommendation(
  useCase: string,
  productName: string,
  budget: number,
  products: any[],
  useCases: any[]
): string {
  if (products.length === 0) {
    return `We don't have specific data on "${productName}", but here's some honest advice:\n\n` +
      `Before spending $${budget}, ask yourself:\n` +
      `• Have you been fine without this until now?\n` +
      `• Will you actually use this in 3 months?\n` +
      `• Is there a simpler, cheaper solution?\n` +
      `• Are you buying this because of marketing/hype?\n\n` +
      `Consider waiting 30 days. If you still want it, do more research.`
  }

  const avgRemorseScore =
    products.reduce((sum, p) => sum + p.remorseScore, 0) / products.length

  if (avgRemorseScore > 70) {
    return `⚠️ WARNING: High Regret Alert!\n\n` +
      `Similar products have an average regret score of ${avgRemorseScore.toFixed(0)}/100.\n\n` +
      `People who bought similar items regret it because:\n` +
      products
        .slice(0, 3)
        .map((p) => `• ${p.whyPeopleRegret}`)
        .join('\n') +
      `\n\nRecommendation: DON'T BUY. Save your $${budget} for something you'll actually use.`
  } else if (avgRemorseScore > 50) {
    return `⚡ Proceed with Caution\n\n` +
      `This category has mixed reviews (regret score: ${avgRemorseScore.toFixed(0)}/100).\n\n` +
      `Some people found value, but many didn't. Consider:\n` +
      `• Renting or borrowing first\n` +
      `• Looking for used options\n` +
      `• Cheaper alternatives\n\n` +
      `Wait at least 2 weeks before purchasing.`
  } else {
    return `✓ Lower Risk Purchase\n\n` +
      `This category has relatively lower regret scores (${avgRemorseScore.toFixed(0)}/100).\n\n` +
      `However, still consider:\n` +
      `• Do you have a specific, frequent use case?\n` +
      `• Have you researched alternatives?\n` +
      `• Is this the best value for money?\n\n` +
      `Make sure you're buying for the right reasons, not just hype.`
  }
}

function calculateSavings(products: any[], budget: number): number {
  if (products.length === 0) return budget

  const avgPrice =
    products.reduce((sum, p) => sum + p.msrp, 0) / products.length
  const avgUsefulness =
    products.reduce((sum, p) => sum + p.actualUsefulnessScore, 0) /
    products.length

  // If usefulness is very low, you'd save most of your budget
  if (avgUsefulness < 3) return budget * 0.9
  if (avgUsefulness < 5) return budget * 0.7
  return budget * 0.5
}
