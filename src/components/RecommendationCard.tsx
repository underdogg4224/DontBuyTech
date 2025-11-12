import { Recommendation } from '@/types';
import { CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const { verdict, confidence, summary, keyPoints } = recommendation;

  const getVerdictConfig = () => {
    switch (verdict) {
      case 'buy':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: '✓ Recommended Purchase',
        };
      case 'consider_alternatives':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: '⚠ Consider Alternatives',
        };
      case 'wait':
        return {
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          label: '⏱ Wait for Better Options',
        };
      case 'skip':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: '✗ Skip This Purchase',
        };
    }
  };

  const config = getVerdictConfig();
  const Icon = config.icon;

  return (
    <div
      className={`border rounded-lg p-6 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`w-10 h-10 ${config.color}`} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {config.label}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Confidence: {confidence}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              confidence >= 75
                ? 'bg-green-600'
                : confidence >= 50
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${confidence}%` }}
          />
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
        {summary}
      </p>

      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          Key Considerations:
        </h3>
        <ul className="space-y-2">
          {keyPoints.map((point, index) => (
            <li
              key={index}
              className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="text-primary-600 font-bold">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
