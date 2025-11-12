'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PricePredictionView from '@/components/PricePrediction';
import type { Product, PriceHistory } from '@/types';

export default function PriceTrackerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Failed to load products:', err));
  }, []);

  const handleProductSelect = async (productId: string) => {
    setSelectedProductId(productId);
    if (!productId) {
      setPriceHistory([]);
      setPrediction(null);
      return;
    }

    setLoading(true);
    try {
      // Fetch price history
      const historyResponse = await fetch(`/api/price-history/${productId}`);
      const historyData = await historyResponse.json();
      setPriceHistory(historyData);

      // Generate prediction (we'll do this client-side for now)
      const product = products.find((p) => p.id === productId);
      if (product && historyData.length > 0) {
        // For demo purposes, create a simple prediction
        const prices = historyData.map((h: PriceHistory) => h.price);
        const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);

        setPrediction({
          currentPrice: product.currentPrice,
          predictedLowPrice: Math.round(minPrice * 0.95),
          predictedHighPrice: Math.round(product.msrp),
          bestTimeToBuy:
            product.currentPrice <= avgPrice * 1.05
              ? 'Good time to buy - price is near historical average'
              : 'Wait for a sale - price is above average',
          confidence: 'medium' as const,
          reasoning: `Based on ${historyData.length} price points, the current price is ${
            product.currentPrice < avgPrice ? 'below' : 'above'
          } the historical average of $${Math.round(avgPrice)}.`,
        });
      }
    } catch (err) {
      console.error('Failed to load price data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="min-h-screen p-8 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8">Price Tracker</h1>

        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-800 rounded-lg">
          <label className="block text-sm font-medium mb-2">Select Product</label>
          <select
            value={selectedProductId}
            onChange={(e) => handleProductSelect(e.target.value)}
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

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading price data...</p>
          </div>
        )}

        {selectedProduct && prediction && (
          <div className="space-y-8">
            <PricePredictionView
              prediction={prediction}
              productName={selectedProduct.name}
            />

            {priceHistory.length > 0 && (
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Price History</h2>
                <div className="space-y-2">
                  {priceHistory.map((history) => (
                    <div
                      key={history.id}
                      className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded"
                    >
                      <div>
                        <span className="font-medium">${history.price}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          at {history.source}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(history.recordedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <h2 className="text-xl font-bold mb-4 text-yellow-900 dark:text-yellow-100">
                Seasonal Buying Tips
              </h2>
              <ul className="space-y-2 text-sm text-yellow-900 dark:text-yellow-100">
                <li>• <strong>Black Friday/Cyber Monday</strong> (November): Best time for tech deals, typically 20-40% off</li>
                <li>• <strong>Amazon Prime Day</strong> (July): Second-best time for deep discounts</li>
                <li>• <strong>Back to School</strong> (August-September): Good for laptops and tablets</li>
                <li>• <strong>New Model Release</strong>: Previous models drop 15-30% in price</li>
                <li>• <strong>End of Quarter</strong>: Retailers clear inventory with additional sales</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
