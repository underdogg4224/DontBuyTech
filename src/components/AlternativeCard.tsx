import { Alternative } from '@/types';
import { TrendingDown, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import ProductCard from './ProductCard';

interface AlternativeCardProps {
  alternative: Alternative;
  onSelect?: () => void;
}

export default function AlternativeCard({
  alternative,
  onSelect,
}: AlternativeCardProps) {
  const { product, comparisonScore, priceComparison, prosAndCons, recommendationReason } =
    alternative;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {product.brand}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${product.price.toLocaleString()}
          </div>
          {priceComparison.savings !== 0 && (
            <div
              className={`flex items-center space-x-1 text-sm ${
                priceComparison.savings > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {priceComparison.savings > 0 ? (
                <TrendingDown className="w-4 h-4" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              <span>
                {priceComparison.savings > 0 ? 'Save' : 'Extra'} $
                {Math.abs(priceComparison.savings).toFixed(2)} (
                {Math.abs(priceComparison.percentage).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Match Score
          </span>
          <span className="text-sm font-bold text-primary-600">
            {comparisonScore.toFixed(0)}/100
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${comparisonScore}%` }}
          />
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 italic">
          {recommendationReason}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            Pros
          </h4>
          <ul className="space-y-1">
            {prosAndCons.pros.map((pro, index) => (
              <li
                key={index}
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                • {pro}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center">
            <XCircle className="w-4 h-4 mr-1" />
            Cons
          </h4>
          <ul className="space-y-1">
            {prosAndCons.cons.map((con, index) => (
              <li
                key={index}
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                • {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {onSelect && (
        <button
          onClick={onSelect}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          View Full Analysis
        </button>
      )}
    </div>
  );
}
