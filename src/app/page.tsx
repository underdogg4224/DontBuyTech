'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { sampleProducts, searchProducts } from '@/lib/data/sampleProducts';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(sampleProducts);
  const router = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredProducts(sampleProducts);
    } else {
      setFilteredProducts(searchProducts(query));
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/analyze/${productId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Think Before You Buy
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Get honest analysis, find better alternatives, and understand the true
          cost of tech products before making a purchase.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">🤔</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Do You Really Need It?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Honest assessment of whether a product fits your actual needs
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            True Cost Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calculate total cost of ownership including accessories and maintenance
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="text-3xl mb-3">🌱</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Environmental Impact
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compare carbon footprint and sustainability metrics
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for a product to analyze..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {searchQuery ? 'Search Results' : 'Popular Products'}
        </h2>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No products found. Try a different search term.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
                showAnalyzeButton
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
