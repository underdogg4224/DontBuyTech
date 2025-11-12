import { NeedAssessment } from '@/types';
import { AlertCircle, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';

interface NeedAssessmentCardProps {
  assessment: NeedAssessment;
}

export default function NeedAssessmentCard({
  assessment,
}: NeedAssessmentCardProps) {
  const { score, verdict, reasons } = assessment;

  const getVerdictConfig = () => {
    switch (verdict) {
      case 'essential':
        return {
          icon: CheckCircle2,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Essential',
        };
      case 'beneficial':
        return {
          icon: CheckCircle2,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          label: 'Beneficial',
        };
      case 'optional':
        return {
          icon: HelpCircle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: 'Optional',
        };
      case 'unnecessary':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Unnecessary',
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
          <Icon className={`w-8 h-8 ${config.color}`} />
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Need Assessment
            </h3>
            <p className={`text-lg font-medium ${config.color}`}>
              {config.label}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {score}
            <span className="text-lg text-gray-500">/100</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              score >= 75
                ? 'bg-green-600'
                : score >= 55
                ? 'bg-blue-600'
                : score >= 35
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold text-gray-900 dark:text-white">
          Key Factors:
        </h4>
        <ul className="space-y-2">
          {reasons.map((reason, index) => (
            <li
              key={index}
              className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
