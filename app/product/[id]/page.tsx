'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  category: string
  manufacturer: string
  msrp: number
  imageUrl: string | null
  description: string
  whyPeopleRegret: string
  marketingHypeScore: number
  actualUsefulnessScore: number
  remorseScore: number
  totalReviews: number
  reviews: Review[]
  useCases: UseCase[]
}

interface Review {
  id: string
  authorName: string
  purchasePrice: number | null
  purchaseDate: string | null
  usageDuration: string
  story: string
  whatTheyWanted: string
  whatTheyActuallyUsed: string
  marketingHypeRating: number
  actualUsefulnessRating: number
  remorseLevel: number
  wouldRecommend: boolean
  upvotes: number
  createdAt: string
}

interface UseCase {
  id: string
  intendedUseCase: string
  recommendation: string
  alternatives: string
  moneySaved: number | null
}

export default function ProductDetail() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
        <Link href="/" className="text-red-600 hover:text-red-700">
          Return to Home
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/" className="text-red-600 hover:text-red-700 mb-4 inline-block">
        ← Back to All Products
      </Link>

      {/* Product Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-gray-600">
              {product.manufacturer} • {product.category}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">${product.msrp}</p>
            <p className="text-sm text-gray-600">MSRP</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">{product.description}</p>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
            <p className="text-sm text-red-800 font-semibold mb-1">REGRET SCORE</p>
            <p className="text-4xl font-bold text-red-600">
              {product.remorseScore.toFixed(0)}
            </p>
            <p className="text-sm text-red-700">out of 100</p>
          </div>

          <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 text-center">
            <p className="text-sm text-orange-800 font-semibold mb-1">MARKETING HYPE</p>
            <p className="text-4xl font-bold text-orange-600">
              {product.marketingHypeScore.toFixed(1)}
            </p>
            <p className="text-sm text-orange-700">out of 10</p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-800 font-semibold mb-1">ACTUAL USEFULNESS</p>
            <p className="text-4xl font-bold text-yellow-600">
              {product.actualUsefulnessScore.toFixed(1)}
            </p>
            <p className="text-sm text-yellow-700">out of 10</p>
          </div>
        </div>

        {/* Why People Regret */}
        <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            ⚠️ Why People Regret Buying This:
          </h3>
          <p className="text-red-800">{product.whyPeopleRegret}</p>
        </div>
      </div>

      {/* Use Cases */}
      {product.useCases && product.useCases.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Honest Use Case Analysis
          </h2>
          {product.useCases.map((useCase) => (
            <div key={useCase.id} className="border-l-4 border-blue-500 pl-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>What people wanted:</strong>
              </p>
              <p className="text-gray-800 mb-3">{useCase.intendedUseCase}</p>

              <p className="text-sm text-gray-600 mb-1">
                <strong>Our recommendation:</strong>
              </p>
              <p className="text-gray-800 mb-3">{useCase.recommendation}</p>

              <p className="text-sm text-gray-600 mb-1">
                <strong>Better alternatives:</strong>
              </p>
              <p className="text-gray-800 mb-3">{useCase.alternatives}</p>

              {useCase.moneySaved && (
                <p className="text-sm font-semibold text-green-600">
                  Potential savings: ${useCase.moneySaved.toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          User Reviews ({product.totalReviews})
        </h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{review.authorName}</p>
                    <p className="text-sm text-gray-600">
                      Used for {review.usageDuration}
                      {review.purchasePrice && ` • Paid $${review.purchasePrice}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">
                      {review.remorseLevel}
                    </p>
                    <p className="text-xs text-gray-600">Regret Level</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-gray-800 italic">"{review.story}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">What they wanted:</p>
                    <p className="text-sm text-gray-800">{review.whatTheyWanted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">What they actually used:</p>
                    <p className="text-sm text-gray-800">{review.whatTheyActuallyUsed}</p>
                  </div>
                </div>

                <div className="flex gap-4 text-sm">
                  <span className="text-gray-600">
                    Marketing Hype: <strong>{review.marketingHypeRating}/10</strong>
                  </span>
                  <span className="text-gray-600">
                    Actual Usefulness: <strong>{review.actualUsefulnessRating}/10</strong>
                  </span>
                  <span className={review.wouldRecommend ? 'text-green-600' : 'text-red-600'}>
                    {review.wouldRecommend ? '✓ Would Recommend' : '✗ Would Not Recommend'}
                  </span>
                  <span className="text-gray-600">
                    👍 {review.upvotes} upvotes
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </div>
  )
}
