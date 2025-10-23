'use client';

import { useEffect, useState } from 'react';
import { ProgressBar } from '../stats/StatsComponents';

interface QuotaData {
  calls: { used: number; limit: number };
  tokens: { used: number; limit: number };
  cost: { used: number; limit: number };
}

interface QuotaWidgetProps {
  tenantSlug: string;
}

export function QuotaWidget({ tenantSlug }: QuotaWidgetProps) {
  const [quotas, setQuotas] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotaData();
  }, []);

  const loadQuotaData = async () => {
    // Mock data - replace with actual API call
    // const result = await api.getTenantQuotas(tenantSlug, authToken);
    
    setTimeout(() => {
      setQuotas({
        calls: { used: 15847, limit: 50000 },
        tokens: { used: 2845692, limit: 10000000 },
        cost: { used: 127.45, limit: 500 }
      });
      setLoading(false);
    }, 300);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getUsageColor = (percentage: number): 'blue' | 'green' | 'purple' | 'red' => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'purple';
    return 'blue';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage Limits</h3>
        <span className="text-xs text-gray-500">Monthly quotas</span>
      </div>
      
      {quotas && (
        <div className="space-y-4">
          {/* API Calls */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">API Calls</span>
              <span className="text-gray-600">
                {formatNumber(quotas.calls.used)} / {formatNumber(quotas.calls.limit)}
              </span>
            </div>
            <ProgressBar
              label=""
              value={quotas.calls.used}
              max={quotas.calls.limit}
              color={getUsageColor((quotas.calls.used / quotas.calls.limit) * 100)}
              showPercentage={false}
            />
          </div>

          {/* Tokens */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">Tokens</span>
              <span className="text-gray-600">
                {formatNumber(quotas.tokens.used)} / {formatNumber(quotas.tokens.limit)}
              </span>
            </div>
            <ProgressBar
              label=""
              value={quotas.tokens.used}
              max={quotas.tokens.limit}
              color={getUsageColor((quotas.tokens.used / quotas.tokens.limit) * 100)}
              showPercentage={false}
            />
          </div>

          {/* Cost */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700 font-medium">Spend</span>
              <span className="text-gray-600">
                {formatCurrency(quotas.cost.used)} / {formatCurrency(quotas.cost.limit)}
              </span>
            </div>
            <ProgressBar
              label=""
              value={quotas.cost.used}
              max={quotas.cost.limit}
              color={getUsageColor((quotas.cost.used / quotas.cost.limit) * 100)}
              showPercentage={false}
            />
          </div>

          {/* Warning if approaching limits */}
          {Object.values(quotas).some(q => (q.used / q.limit) >= 0.8) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ You're approaching your monthly limits. Consider upgrading your plan.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
