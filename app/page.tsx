'use client'

import { useState, useEffect } from 'react'
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
}

interface Review {
  id: string
  authorName: string
  story: string
  remorseLevel: number
  upvotes: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('remorseScore')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [category, sortBy, searchQuery])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.append('category', category)
      params.append('sortBy', sortBy)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUsefulnessColor = (score: number) => {
    if (score >= 7) return 'text-green-600'
    if (score >= 5) return 'text-yellow-600'
    if (score >= 3) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Tech Products People Regret Buying
        </h1>
        <p className="text-lg text-gray-600">
          A community-driven database to help you avoid buyer's remorse
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, brand, or description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="Smart Home">Smart Home</option>
              <option value="Wearables">Wearables</option>
              <option value="Audio">Audio</option>
              <option value="Computing">Computing</option>
              <option value="Gaming">Gaming</option>
              <option value="Photography">Photography</option>
              <option value="Kitchen Tech">Kitchen Tech</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="remorseScore">Highest Regret</option>
              <option value="marketingHype">Most Overhyped</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <p className="text-gray-600">No products found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.manufacturer} • {product.category}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    ${product.msrp}
                  </span>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {product.description}
                </p>

                {/* Scores */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Regret Score:</span>
                    <span className={`text-lg font-bold ${getScoreColor(product.remorseScore)}`}>
                      {product.remorseScore.toFixed(0)}/100
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Marketing Hype:</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {product.marketingHypeScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Actual Usefulness:</span>
                    <span className={`text-sm font-semibold ${getUsefulnessColor(product.actualUsefulnessScore)}`}>
                      {product.actualUsefulnessScore.toFixed(1)}/10
                    </span>
                  </div>
                </div>

                {/* Why people regret */}
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                  <p className="text-xs font-semibold text-red-800 mb-1">
                    Why People Regret This:
                  </p>
                  <p className="text-sm text-red-700 line-clamp-3">
                    {product.whyPeopleRegret}
                  </p>
                </div>

                {/* Reviews count */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>{product.totalReviews} reviews</span>
                </div>

                {/* Top review */}
                {product.reviews && product.reviews.length > 0 && (
                  <div className="border-t pt-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Top Review:</p>
                    <p className="text-sm text-gray-700 italic line-clamp-2">
                      "{product.reviews[0].story}"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      - {product.reviews[0].authorName} • {product.reviews[0].upvotes} upvotes
                    </p>
                  </div>
                )}

                <Link
                  href={`/product/${product.id}`}
                  className="block w-full text-center bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
