'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ValidationResult {
  recommendation: string
  similarProducts: any[]
  matchingUseCases: any[]
  estimatedSavings: number
}

export default function UseCaseValidator() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [formData, setFormData] = useState({
    productName: '',
    useCase: '',
    budget: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/validator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: formData.productName,
          useCase: formData.useCase,
          budget: parseFloat(formData.budget) || 0,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        throw new Error('Failed to validate use case')
      }
    } catch (error) {
      console.error('Error validating use case:', error)
      alert('Failed to validate use case. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Use Case Validator
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Thinking of buying something? Get honest advice before you spend your money.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="space-y-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              What are you thinking of buying? *
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              required
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g., Smart Mirror, VR Headset, Premium Earbuds"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to use it for? *
            </label>
            <textarea
              id="useCase"
              name="useCase"
              required
              rows={3}
              value={formData.useCase}
              onChange={handleChange}
              placeholder="Be specific about what problem you're trying to solve or what you want to accomplish..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              How much are you planning to spend? *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-600">$</span>
              <input
                type="number"
                id="budget"
                name="budget"
                required
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                placeholder="299.99"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Get Honest Advice'}
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Recommendation */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Honest Recommendation
            </h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded whitespace-pre-line">
              <p className="text-gray-800">{result.recommendation}</p>
            </div>

            {result.estimatedSavings > 0 && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-lg font-semibold text-green-800">
                  💰 Potential Savings: ${result.estimatedSavings.toFixed(2)}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  That's money you can save or spend on something more useful!
                </p>
              </div>
            )}
          </div>

          {/* Similar Products */}
          {result.similarProducts && result.similarProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Similar Products People Regret
              </h2>
              <div className="space-y-4">
                {result.similarProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border-l-4 border-red-500 pl-4 py-2"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {product.manufacturer} • ${product.msrp}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">
                          {product.remorseScore.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600">Regret Score</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {product.whyPeopleRegret}
                    </p>
                    <Link
                      href={`/product/${product.id}`}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      View Full Details →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions to Consider */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questions to Ask Yourself
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-3">1.</span>
                <span>Have you been perfectly fine without this product until now?</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-3">2.</span>
                <span>Will you realistically still be using this in 6 months?</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-3">3.</span>
                <span>Is there a simpler, cheaper way to accomplish the same thing?</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-3">4.</span>
                <span>Are you buying this because of clever marketing or real need?</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-600 font-bold mr-3">5.</span>
                <span>If you wait 30 days, will you still want it?</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setResult(null)
                setFormData({ productName: '', useCase: '', budget: '' })
              }}
              className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-gray-700 transition-colors"
            >
              Check Another Product
            </button>
            <Link
              href="/"
              className="flex-1 text-center bg-red-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-red-700 transition-colors"
            >
              Browse All Regrets
            </Link>
          </div>
        </div>
      )}

      {/* Info Box */}
      {!result && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How This Works</h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>We analyze our database of products people regret buying</li>
            <li>We match your use case against real user experiences</li>
            <li>We provide honest, unbiased advice (no affiliate links, no ads)</li>
            <li>We help you avoid buyer's remorse and save money</li>
          </ul>
        </div>
      )}
    </div>
  )
}
