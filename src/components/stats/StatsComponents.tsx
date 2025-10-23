interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, subtitle, icon, trend }: StatCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {formatChange(change)}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

interface MiniStatProps {
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow';
}

export function MiniStat({ label, value, color = 'blue' }: MiniStatProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-3`}>
      <p className="text-xs font-medium opacity-75 mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color?: 'blue' | 'green' | 'purple' | 'red';
  showPercentage?: boolean;
}

export function ProgressBar({ label, value, max, color = 'blue', showPercentage = true }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    red: 'bg-red-600',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        {showPercentage && (
          <span className="text-gray-600">{percentage.toFixed(0)}%</span>
        )}
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface UsageChartProps {
  data: {
    label: string;
    value: number;
  }[];
  maxValue?: number;
}

export function UsageChart({ data, maxValue }: UsageChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, idx) => (
        <div key={idx}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{item.label}</span>
            <span className="text-gray-900 font-medium">
              {new Intl.NumberFormat('en-US').format(item.value)}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
