'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ComparisonView from '@/components/ComparisonView';
import PricePredictionView from '@/components/PricePrediction';
import LongevityView from '@/components/LongevityView';
import type { Product } from '@/types';

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [product1Id, setProduct1Id] = useState('');
  const [product2Id, setProduct2Id] = useState('');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load products
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setError('Failed to load products'));
  }, []);

  const handleCompare = async () => {
    if (!product1Id || !product2Id) {
      setError('Please select both products');
      return;
    }

    if (product1Id === product2Id) {
      setError('Please select different products');
      return;
    }

    setLoading(true);
    setError('');
    setComparisonData(null);

    try {
      const response = await fetch(
        `/api/compare?product1Id=${product1Id}&product2Id=${product2Id}`
      );

      if (!response.ok) {
        throw new Error('Failed to compare products');
      }

      const data = await response.json();
      setComparisonData(data);
    } catch (err) {
      setError('Failed to load comparison');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Smart Tech Comparison</h1>

        {/* Product Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-8 p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Select First Product</label>
            <select
              value={product1Id}
              onChange={(e) => setProduct1Id(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.currentPrice}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Second Product</label>
            <select
              value={product2Id}
              onChange={(e) => setProduct2Id(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.currentPrice}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleCompare}
              disabled={loading || !product1Id || !product2Id}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Comparing...' : 'Compare Products'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Comparison Results */}
        {comparisonData && (
          <div className="space-y-8">
            {/* Main Comparison */}
            <ComparisonView
              comparison={comparisonData.comparison}
              product1={comparisonData.products.product1}
              product2={comparisonData.products.product2}
            />

            {/* Price Predictions */}
            <div className="grid md:grid-cols-2 gap-6">
              <PricePredictionView
                prediction={comparisonData.pricing.product1}
                productName={comparisonData.products.product1.name}
              />
              <PricePredictionView
                prediction={comparisonData.pricing.product2}
                productName={comparisonData.products.product2.name}
              />
            </div>

            {/* Longevity Predictions */}
            <div className="grid md:grid-cols-2 gap-6">
              <LongevityView
                prediction={comparisonData.longevity.product1Longevity}
                productName={comparisonData.products.product1.name}
              />
              <LongevityView
                prediction={comparisonData.longevity.product2Longevity}
                productName={comparisonData.products.product2.name}
              />
            </div>

            {/* Longevity Comparison Summary */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Longevity Comparison</h2>
              <p className="text-gray-700 dark:text-gray-300">
                {comparisonData.longevity.recommendation}
              </p>
            </div>

            {/* Price Difference Summary */}
            {comparisonData.pricing.priceDifference !== 0 && (
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Price Difference</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {comparisonData.products.product2.name} is{' '}
                  <span className="font-bold">
                    ${Math.abs(comparisonData.pricing.priceDifference)}
                  </span>{' '}
                  {comparisonData.pricing.priceDifference > 0 ? 'more expensive' : 'cheaper'} than{' '}
                  {comparisonData.products.product1.name}.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
