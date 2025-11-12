'use client';

import type { Product, SpecComparison, MarketingGimmick, RealImprovement } from '@/types';

interface ComparisonViewProps {
  comparison: {
    specComparisons: SpecComparison[];
    marketingGimmicks: MarketingGimmick[];
    realImprovements: RealImprovement[];
    upgradeRecommendation: string;
    upgradeScore: number;
    isYearOverYear: boolean;
  };
  product1: Product;
  product2: Product;
}

export default function ComparisonView({ comparison, product1, product2 }: ComparisonViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6.5) return 'text-blue-600 dark:text-blue-400';
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 3) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation.includes('Highly')) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
    if (recommendation.includes('Recommended')) return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    if (recommendation.includes('Consider')) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
    if (recommendation.includes('Not Worth')) return 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200';
    return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-3xl font-bold mb-4">Smart Comparison</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="font-semibold text-lg">{product1.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{product1.brand}</p>
            <p className="text-2xl font-bold mt-2">${product1.currentPrice}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
            <h2 className="font-semibold text-lg">{product2.name}</h2>
            <p className="text-gray-600 dark:text-gray-400">{product2.brand}</p>
            <p className="text-2xl font-bold mt-2">${product2.currentPrice}</p>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="p-6 border-2 border-gray-300 dark:border-gray-700 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Overall Recommendation</h2>
          <div className={`text-4xl font-bold ${getScoreColor(comparison.upgradeScore)}`}>
            {comparison.upgradeScore}/10
          </div>
        </div>
        <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getRecommendationColor(comparison.upgradeRecommendation)}`}>
          {comparison.upgradeRecommendation}
        </div>
        {comparison.isYearOverYear && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            This is a year-over-year comparison of similar models
          </p>
        )}
      </div>

      {/* Real Improvements */}
      {comparison.realImprovements.length > 0 && (
        <div className="p-6 bg-green-50 dark:bg-green-950 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-green-900 dark:text-green-100">
            Real Improvements ({comparison.realImprovements.length})
          </h2>
          <div className="space-y-3">
            {comparison.realImprovements.map((improvement, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold capitalize text-green-700 dark:text-green-300">
                  {improvement.feature}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {improvement.practicalBenefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketing Gimmicks */}
      {comparison.marketingGimmicks.length > 0 && (
        <div className="p-6 bg-red-50 dark:bg-red-950 rounded-lg">
          <h2 className="text-xl font-bold mb-4 text-red-900 dark:text-red-100">
            Marketing Gimmicks Detected ({comparison.marketingGimmicks.length})
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            These features sound impressive but offer minimal real-world benefit
          </p>
          <div className="space-y-3">
            {comparison.marketingGimmicks.map((gimmick, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold capitalize text-red-700 dark:text-red-300">
                  {gimmick.feature}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  {gimmick.reason}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Actual impact: {gimmick.actualImpact}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Spec Comparison */}
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Detailed Spec Comparison</h2>
        <div className="space-y-4">
          {comparison.specComparisons
            .filter((sc) => sc.improvementType !== 'none')
            .map((spec, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  spec.isMarketingGimmick
                    ? 'bg-red-100 dark:bg-red-950 border-l-4 border-red-500'
                    : spec.improvementType === 'significant'
                    ? 'bg-green-100 dark:bg-green-950 border-l-4 border-green-500'
                    : 'bg-white dark:bg-gray-800 border-l-4 border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold capitalize">{spec.specName}</h3>
                  <span className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    {spec.improvementType}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{product1.name}: </span>
                    <span className="font-medium">{String(spec.product1Value)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">{product2.name}: </span>
                    <span className="font-medium">{String(spec.product2Value)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{spec.explanation}</p>
                {spec.isMarketingGimmick && (
                  <p className="text-xs text-red-700 dark:text-red-300 mt-2 font-semibold">
                    Marketing Gimmick: {spec.gimmickReason}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
