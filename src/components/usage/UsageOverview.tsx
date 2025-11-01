'use client';

import { useEffect, useState } from 'react';
import { MiniStat } from '../stats/StatsComponents';
import Link from 'next/link';

interface MiniUsageData {
  calls: number;
  tokens: number;
  cost: number;
  successRate: number;
}

interface UsageOverviewProps {
  tenantSlug: string;
}

export function UsageOverview({ tenantSlug }: UsageOverviewProps) {
  const [data, setData] = useState<MiniUsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    // Mock data - replace with actual API call
    // const result = await api.getMiniUsageStats(tenantSlug, authToken);

    setTimeout(() => {
      setData({
        calls: 15847,
        tokens: 2845692,
        cost: 127.45,
        successRate: 95.9,
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
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Usage Overview</h3>
        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
          This Month
        </span>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <MiniStat label="API Calls" value={formatNumber(data.calls)} color="blue" />
            <MiniStat label="Tokens" value={formatNumber(data.tokens)} color="purple" />
            <MiniStat label="Cost" value={formatCurrency(data.cost)} color="green" />
            <MiniStat label="Success Rate" value={`${data.successRate}%`} color="blue" />
          </div>

          <Link href={`/dashboard/${tenantSlug}/usage`}>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              View Detailed Analytics →
            </button>
          </Link>
        </>
      )}
    </div>
  );
}
