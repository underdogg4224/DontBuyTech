import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const review = await prisma.review.create({
      data: {
        productId: body.productId,
        authorName: body.authorName,
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        usageDuration: body.usageDuration,
        story: body.story,
        whatTheyWanted: body.whatTheyWanted,
        whatTheyActuallyUsed: body.whatTheyActuallyUsed,
        marketingHypeRating: parseInt(body.marketingHypeRating),
        actualUsefulnessRating: parseInt(body.actualUsefulnessRating),
        remorseLevel: parseInt(body.remorseLevel),
        wouldRecommend: body.wouldRecommend === true || body.wouldRecommend === 'true',
      },
    })

    // Update product aggregate scores
    await updateProductScores(body.productId)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

async function updateProductScores(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId },
  })

  if (reviews.length === 0) return

  const totalReviews = reviews.length
  const avgMarketingHype =
    reviews.reduce((sum, r) => sum + r.marketingHypeRating, 0) / totalReviews
  const avgUsefulness =
    reviews.reduce((sum, r) => sum + r.actualUsefulnessRating, 0) / totalReviews
  const avgRemorse =
    reviews.reduce((sum, r) => sum + r.remorseLevel, 0) / totalReviews

  await prisma.product.update({
    where: { id: productId },
    data: {
      marketingHypeScore: avgMarketingHype,
      actualUsefulnessScore: avgUsefulness,
      remorseScore: avgRemorse,
      totalReviews,
    },
  })
}
