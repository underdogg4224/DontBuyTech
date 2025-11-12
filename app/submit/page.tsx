'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SubmitProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Smart Home',
    manufacturer: '',
    msrp: '',
    description: '',
    whyPeopleRegret: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const product = await response.json()
        alert('Product submitted successfully! Thank you for contributing.')
        router.push(`/product/${product.id}`)
      } else {
        throw new Error('Failed to submit product')
      }
    } catch (error) {
      console.error('Error submitting product:', error)
      alert('Failed to submit product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Submit a Product
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Help others avoid buyer's remorse by sharing products you regret purchasing
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Before submitting:</strong> Make sure this product isn't already in our database.
          Search for it on the home page first. If it exists, you can add your review to the existing product page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Smart Juice Press Pro"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="Smart Home">Smart Home</option>
              <option value="Wearables">Wearables</option>
              <option value="Audio">Audio</option>
              <option value="Computing">Computing</option>
              <option value="Gaming">Gaming</option>
              <option value="Photography">Photography</option>
              <option value="Kitchen Tech">Kitchen Tech</option>
            </select>
          </div>

          {/* Manufacturer */}
          <div>
            <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-2">
              Manufacturer/Brand *
            </label>
            <input
              type="text"
              id="manufacturer"
              name="manufacturer"
              required
              value={formData.manufacturer}
              onChange={handleChange}
              placeholder="e.g., JuiceCorp"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* MSRP */}
          <div>
            <label htmlFor="msrp" className="block text-sm font-medium text-gray-700 mb-2">
              Original Price (MSRP) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-600">$</span>
              <input
                type="number"
                id="msrp"
                name="msrp"
                required
                min="0"
                step="0.01"
                value={formData.msrp}
                onChange={handleChange}
                placeholder="699.99"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Product Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of what the product claims to do..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Why People Regret */}
          <div>
            <label htmlFor="whyPeopleRegret" className="block text-sm font-medium text-gray-700 mb-2">
              Why Do You Regret Buying This? *
            </label>
            <textarea
              id="whyPeopleRegret"
              name="whyPeopleRegret"
              required
              rows={4}
              value={formData.whyPeopleRegret}
              onChange={handleChange}
              placeholder="Be honest and specific. What were the issues? Was it overpriced, poor quality, unnecessary, etc.?"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-600 mt-1">
              This helps others understand the real problems with this product
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Product'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Your product will be added to the database immediately</li>
          <li>Other users can add their reviews and experiences</li>
          <li>The regret scores will update as more people share their stories</li>
          <li>You're helping others make better purchasing decisions!</li>
        </ul>
      </div>
    </div>
  )
}
