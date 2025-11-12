'use client';

import type { PricePrediction } from '@/types';

interface PricePredictionProps {
  prediction: PricePrediction;
  productName: string;
}

export default function PricePredictionView({ prediction, productName }: PricePredictionProps) {
  const getConfidenceColor = (confidence: string) => {
    if (confidence === 'high') return 'text-green-600 dark:text-green-400';
    if (confidence === 'medium') return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-100">
        Price Prediction - {productName}
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
          <p className="text-2xl font-bold">${prediction.currentPrice}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Predicted Low</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${prediction.predictedLowPrice}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Predicted High</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${prediction.predictedHighPrice}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Best Time to Buy</h3>
          <span className={`text-sm font-semibold uppercase ${getConfidenceColor(prediction.confidence)}`}>
            {prediction.confidence} confidence
          </span>
        </div>
        <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
          {prediction.bestTimeToBuy}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{prediction.reasoning}</p>
      </div>
    </div>
  );
}
