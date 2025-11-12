'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product, Category } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  useEffect(() => {
    // Load products
    setLoading(true);
    const url = selectedCategory
      ? `/api/products?categoryId=${selectedCategory}`
      : '/api/products';

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, [selectedCategory]);

  return (
    <div className="min-h-screen p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Browse Products</h1>

        {/* Category Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-2">{product.brand}</p>
                {product.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {product.description}
                  </p>
                )}

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${product.currentPrice}</span>
                    {product.msrp !== product.currentPrice && (
                      <span className="text-sm text-gray-500 line-through">${product.msrp}</span>
                    )}
                  </div>
                  {product.msrp !== product.currentPrice && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Save ${product.msrp - product.currentPrice} (
                      {Math.round(((product.msrp - product.currentPrice) / product.msrp) * 100)}%
                      off)
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {product.specifications.processor && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Processor:</span>
                      <span className="font-medium">{product.specifications.processor}</span>
                    </div>
                  )}
                  {product.specifications.ram && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">RAM:</span>
                      <span className="font-medium">{product.specifications.ram}</span>
                    </div>
                  )}
                  {product.specifications.storage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Storage:</span>
                      <span className="font-medium">{product.specifications.storage}</span>
                    </div>
                  )}
                  {product.specifications.display && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Display:</span>
                      <span className="font-medium">{product.specifications.display}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Repairability:</span>
                    <span className="font-medium">{product.repairabilityScore || 'N/A'}/10</span>
                  </div>
                  {product.warrantyYears && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Warranty:</span>
                      <span className="font-medium">{product.warrantyYears} year(s)</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
