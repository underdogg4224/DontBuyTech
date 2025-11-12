'use client';

import type { LongevityPrediction } from '@/types';

interface LongevityViewProps {
  prediction: LongevityPrediction;
  productName: string;
}

export default function LongevityView({ prediction, productName }: LongevityViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6.5) return 'text-blue-600 dark:text-blue-400';
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <div className="p-6 bg-purple-50 dark:bg-purple-950 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-purple-900 dark:text-purple-100">
        Longevity Prediction - {productName}
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Longevity Score</p>
          <p className={`text-3xl font-bold ${getScoreColor(prediction.longevityScore)}`}>
            {prediction.longevityScore}/10
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Expected Lifespan</p>
          <p className="text-3xl font-bold">{prediction.expectedLifespan} years</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">Official Support</p>
          <p className="text-3xl font-bold">{prediction.supportLifespan} years</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Repairability Score</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                prediction.repairabilityScore >= 7
                  ? 'bg-green-600'
                  : prediction.repairabilityScore >= 5
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${(prediction.repairabilityScore / 10) * 100}%` }}
            />
          </div>
          <span className="font-bold">{prediction.repairabilityScore}/10</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Recommendation</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">{prediction.recommendation}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
            Positive Factors
          </h3>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {prediction.factors.positive.map((factor, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
        {prediction.factors.negative.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">
              Concerns
            </h3>
            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {prediction.factors.negative.map((factor, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400">✗</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
