'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UsageStats {
  period: string;
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
    change: number;
  };
  tokens: {
    total: number;
    prompt: number;
    completion: number;
    change: number;
  };
  costs: {
    total: number;
    breakdown: {
      model: string;
      cost: number;
      calls: number;
    }[];
    change: number;
  };
  topModels: {
    model: string;
    calls: number;
    tokens: number;
    cost: number;
  }[];
  dailyUsage: {
    date: string;
    calls: number;
    tokens: number;
    cost: number;
  }[];
}

export default function UsageStatsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }
    loadUsageStats();
  }, [period]);

  const loadUsageStats = async () => {
    setLoading(true);
    
    // Mock data - replace with actual API call
    // const data = await api.getUsageStats(tenantSlug, authToken, period);
    
    setTimeout(() => {
      setStats({
        period: period,
        apiCalls: {
          total: 15847,
          successful: 15203,
          failed: 644,
          change: 12.5
        },
        tokens: {
          total: 2845692,
          prompt: 1523847,
          completion: 1321845,
          change: 8.3
        },
        costs: {
          total: 127.45,
          breakdown: [
            { model: 'gpt-4', cost: 78.30, calls: 2450 },
            { model: 'gpt-3.5-turbo', cost: 32.15, calls: 8920 },
            { model: 'claude-3', cost: 17.00, calls: 4477 }
          ],
          change: -3.2
        },
        topModels: [
          { model: 'gpt-3.5-turbo', calls: 8920, tokens: 1245000, cost: 32.15 },
          { model: 'gpt-4', calls: 2450, tokens: 980000, cost: 78.30 },
          { model: 'claude-3-opus', calls: 2200, tokens: 420000, cost: 12.50 },
          { model: 'claude-3-sonnet', calls: 2277, tokens: 200692, cost: 4.50 }
        ],
        dailyUsage: [
          { date: '2025-10-17', calls: 1920, tokens: 345000, cost: 15.30 },
          { date: '2025-10-18', calls: 2100, tokens: 378000, cost: 16.80 },
          { date: '2025-10-19', calls: 1850, tokens: 332000, cost: 14.70 },
          { date: '2025-10-20', calls: 2300, tokens: 412000, cost: 18.30 },
          { date: '2025-10-21', calls: 2450, tokens: 440000, cost: 19.50 },
          { date: '2025-10-22', calls: 2150, tokens: 386000, cost: 17.10 },
          { date: '2025-10-23', calls: 3077, tokens: 552692, cost: 24.75 }
        ]
      });
      setLoading(false);
    }, 500);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
    return <span className={color}>{sign}{change.toFixed(1)}%</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${tenantSlug}`} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Usage Statistics</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Usage Analytics</h2>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* API Calls */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">API Calls</h3>
                  {formatChange(stats.apiCalls.change)}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.apiCalls.total)}
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-green-600">✓ {formatNumber(stats.apiCalls.successful)}</span>
                  </div>
                  <div>
                    <span className="text-red-600">✗ {formatNumber(stats.apiCalls.failed)}</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Success rate: {((stats.apiCalls.successful / stats.apiCalls.total) * 100).toFixed(1)}%
                </div>
              </div>

              {/* Tokens */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Tokens Used</h3>
                  {formatChange(stats.tokens.change)}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatNumber(stats.tokens.total)}
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">↑ {formatNumber(stats.tokens.prompt)} prompt</span>
                  </div>
                  <div>
                    <span className="text-purple-600">↓ {formatNumber(stats.tokens.completion)} completion</span>
                  </div>
                </div>
              </div>

              {/* Costs */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Cost</h3>
                  {formatChange(stats.costs.change)}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {formatCurrency(stats.costs.total)}
                </p>
                <div className="text-sm text-gray-600">
                  Avg per call: {formatCurrency(stats.costs.total / stats.apiCalls.total)}
                </div>
              </div>
            </div>

            {/* Daily Usage Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage Trend</h3>
              <div className="space-y-3">
                {stats.dailyUsage.map((day, idx) => {
                  const maxCalls = Math.max(...stats.dailyUsage.map(d => d.calls));
                  const width = (day.calls / maxCalls) * 100;
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {formatNumber(day.calls)} calls • {formatCurrency(day.cost)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top Models */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Models</h3>
                <div className="space-y-4">
                  {stats.topModels.map((model, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{model.model}</h4>
                          <p className="text-sm text-gray-600">
                            {formatNumber(model.calls)} calls • {formatNumber(model.tokens)} tokens
                          </p>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(model.cost)}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                          {((model.calls / stats.apiCalls.total) * 100).toFixed(1)}% of calls
                        </span>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                          {((model.tokens / stats.tokens.total) * 100).toFixed(1)}% of tokens
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown</h3>
                <div className="space-y-4">
                  {stats.costs.breakdown.map((item, idx) => {
                    const percentage = (item.cost / stats.costs.total) * 100;
                    
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-900 font-medium">{item.model}</span>
                          <span className="text-gray-900 font-semibold">{formatCurrency(item.cost)}</span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatNumber(item.calls)} API calls
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-semibold">Total Spend</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.costs.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Insights */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Usage Insights</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Your most cost-effective model is <strong>{stats.costs.breakdown.reduce((min, curr) => 
                  (curr.cost / curr.calls) < (min.cost / min.calls) ? curr : min
                ).model}</strong> at {formatCurrency(
                  stats.costs.breakdown.reduce((min, curr) => 
                    (curr.cost / curr.calls) < (min.cost / min.calls) ? curr : min
                  ).cost / stats.costs.breakdown.reduce((min, curr) => 
                    (curr.cost / curr.calls) < (min.cost / min.calls) ? curr : min
                  ).calls
                )} per call</li>
                <li>• Your API success rate is {((stats.apiCalls.successful / stats.apiCalls.total) * 100).toFixed(1)}%
                  {stats.apiCalls.failed > 100 && ' - consider investigating failed requests'}</li>
                <li>• Peak usage day: <strong>{new Date(stats.dailyUsage.reduce((max, curr) => 
                  curr.calls > max.calls ? curr : max
                ).date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong> with {formatNumber(
                  stats.dailyUsage.reduce((max, curr) => curr.calls > max.calls ? curr : max).calls
                )} calls</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
