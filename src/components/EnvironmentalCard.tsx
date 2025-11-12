import { EnvironmentalImpact } from '@/types';
import { Leaf, Recycle, Wrench, Clock } from 'lucide-react';

interface EnvironmentalCardProps {
  impact: EnvironmentalImpact;
}

export default function EnvironmentalCard({ impact }: EnvironmentalCardProps) {
  const { carbonFootprint, sustainability } = impact;

  const getSustainabilityRating = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 65) return { label: 'Good', color: 'text-blue-600' };
    if (score >= 50) return { label: 'Average', color: 'text-yellow-600' };
    if (score >= 35) return { label: 'Poor', color: 'text-orange-600' };
    return { label: 'Very Poor', color: 'text-red-600' };
  };

  const rating = getSustainabilityRating(sustainability.score);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-2 mb-4">
        <Leaf className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Environmental Impact
        </h3>
      </div>

      {/* Sustainability Score */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sustainability Score
          </span>
          <span className={`text-lg font-bold ${rating.color}`}>
            {sustainability.score}/100 - {rating.label}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              sustainability.score >= 80
                ? 'bg-green-600'
                : sustainability.score >= 65
                ? 'bg-blue-600'
                : sustainability.score >= 50
                ? 'bg-yellow-600'
                : sustainability.score >= 35
                ? 'bg-orange-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${sustainability.score}%` }}
          />
        </div>
      </div>

      {/* Sustainability Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <Wrench className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sustainability.repairability}
            <span className="text-sm text-gray-500">/10</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Repairability
          </div>
        </div>

        <div className="text-center">
          <Recycle className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sustainability.recyclability}
            <span className="text-sm text-gray-500">%</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Recyclability
          </div>
        </div>

        <div className="text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sustainability.expectedLifespan}
            <span className="text-sm text-gray-500">y</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Expected Lifespan
          </div>
        </div>
      </div>

      {/* Carbon Footprint */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Carbon Footprint
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Manufacturing</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {carbonFootprint.manufacturing} kg CO₂
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
            <span className="text-gray-700 dark:text-gray-300">
              {carbonFootprint.shipping} kg CO₂
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Usage (per year)</span>
            <span className="text-gray-700 dark:text-gray-300">
              {carbonFootprint.usage} kg CO₂
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Disposal</span>
            <span className="text-gray-700 dark:text-gray-300">
              {carbonFootprint.disposal} kg CO₂
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
            <span className="text-gray-900 dark:text-white">Total (3 years)</span>
            <span className="text-primary-600">
              {carbonFootprint.total} kg CO₂
            </span>
          </div>
        </div>
      </div>

      {/* Comparison */}
      {impact.comparison.vsAverage !== 0 && (
        <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {impact.comparison.vsAverage > 0 ? (
              <span className="text-red-600 font-semibold">
                +{impact.comparison.vsAverage}%
              </span>
            ) : (
              <span className="text-green-600 font-semibold">
                {impact.comparison.vsAverage}%
              </span>
            )}{' '}
            vs category average
          </p>
        </div>
      )}
    </div>
  );
}
