import { TotalCostOfOwnership } from '@/types';
import { DollarSign, TrendingDown } from 'lucide-react';

interface CostBreakdownProps {
  tco: TotalCostOfOwnership;
}

export default function CostBreakdown({ tco }: CostBreakdownProps) {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Total Cost of Ownership
      </h3>

      <div className="space-y-6">
        {/* Initial Costs */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Initial Costs
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Product Price</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(tco.initialCost)}
              </span>
            </div>

            {tco.accessories.length > 0 && (
              <>
                {tco.accessories.map((acc, index) => (
                  <div key={index} className="flex justify-between text-sm pl-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {acc.name}
                      <span className="text-xs ml-2 text-gray-500">
                        ({acc.necessity})
                      </span>
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatCurrency(acc.cost)}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Maintenance */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Maintenance (Annual)
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Extended Warranty</span>
              <span className="text-gray-700 dark:text-gray-300">
                {formatCurrency(tco.maintenance.warranty)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Estimated Repairs</span>
              <span className="text-gray-700 dark:text-gray-300">
                {formatCurrency(tco.maintenance.repairs)}
              </span>
            </div>
            {tco.maintenance.insurance && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatCurrency(tco.maintenance.insurance)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Operating Costs */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Operating Costs (Annual)
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Electricity</span>
              <span className="text-gray-700 dark:text-gray-300">
                {formatCurrency(tco.operatingCosts.electricity)}
              </span>
            </div>
            {tco.operatingCosts.subscription && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subscription (monthly)
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatCurrency(tco.operatingCosts.subscription)}/mo
                </span>
              </div>
            )}
            {tco.operatingCosts.cloudStorage && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Cloud Storage (monthly)
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {formatCurrency(tco.operatingCosts.cloudStorage)}/mo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Depreciation */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Depreciation
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Year 1</span>
              <span className="text-red-600">
                -{formatCurrency(tco.depreciation.year1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Resale Value (after 3 years)
              </span>
              <span className="text-green-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                {formatCurrency(tco.depreciation.resaleValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Total Cost Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900 dark:text-white">First Year Total</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(tco.totalFirstYear)}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900 dark:text-white">3-Year Total</span>
            <span className="text-primary-600">
              {formatCurrency(tco.totalThreeYears)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">5-Year Total</span>
            <span className="text-gray-700 dark:text-gray-300">
              {formatCurrency(tco.totalFiveYears)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
