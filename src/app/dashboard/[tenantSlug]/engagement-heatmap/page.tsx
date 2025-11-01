'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

interface HeatmapData {
  [date: string]: {
    attendance: string;
    lms_minutes: number;
    lms_activities: number;
    sentiment: number;
    engagement_level: string;
  };
}

interface EngagementHeatmap {
  id: number;
  heatmap_number: string;
  student_name: string;
  time_period: string;
  start_date: string;
  end_date: string;
  overall_engagement_score: number;
  attendance_score: number;
  lms_activity_score: number;
  sentiment_score: number;
  risk_level: string;
  risk_flags: string[];
  heatmap_data: HeatmapData;
  engagement_trend: string;
  change_percentage: number;
  alerts_triggered: number;
}

interface EngagementAlert {
  id: number;
  alert_number: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  trigger_metrics: any;
  recommended_actions: string[];
  status: string;
  created_at: string;
}

export default function EngagementHeatmapPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('heatmap');
  const [loading, setLoading] = useState(false);

  // Form state
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timePeriod, setTimePeriod] = useState('weekly');

  // Results state
  const [heatmap, setHeatmap] = useState<EngagementHeatmap | null>(null);
  const [alerts, setAlerts] = useState<EngagementAlert[]>([]);

  // Stats
  const [stats, setStats] = useState({
    atRisk: 8,
    activeAlerts: 12,
    avgEngagement: 72,
    criticalCases: 3,
  });

  const handleGenerateHeatmap = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/engagement-heatmap/heatmaps/generate_heatmap/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            student_name: studentName,
            start_date: startDate,
            end_date: endDate,
            time_period: timePeriod,
          }),
        }
      );
      const data = await response.json();
      setHeatmap(data.heatmap);
      setActiveTab('visual');
    } catch (error) {
      console.error('Error generating heatmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      engaged: 'bg-green-100 text-green-800 border-green-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      critical: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getEngagementColor = (level: string) => {
    const colors: Record<string, string> = {
      high: 'bg-green-500',
      medium: 'bg-yellow-500',
      low: 'bg-orange-500',
      none: 'bg-gray-300',
    };
    return colors[level] || 'bg-gray-300';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'stable':
        return '➡️';
      case 'declining':
        return '📉';
      case 'critical_decline':
        return '🚨';
      default:
        return '➡️';
    }
  };

  const renderHeatmapGrid = () => {
    if (!heatmap || !heatmap.heatmap_data) return null;

    const dates = Object.keys(heatmap.heatmap_data).sort();

    return (
      <div className="overflow-x-auto">
        <div className="inline-grid grid-cols-7 gap-2 min-w-full">
          {dates.map(date => {
            const data = heatmap.heatmap_data[date];
            const engagementColor = getEngagementColor(data.engagement_level);

            return (
              <div
                key={date}
                className={`${engagementColor} rounded-lg p-3 text-white text-center hover:shadow-lg transition-shadow cursor-pointer`}
                title={`${date}: ${data.engagement_level}`}
              >
                <div className="text-xs font-semibold">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs mt-1">
                  {data.attendance === 'present' ? '✓' : data.attendance === 'absent' ? '✗' : '-'}
                </div>
                <div className="text-xs">{data.lms_activities}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-orange-600 to-amber-600 rounded-xl shadow-lg">
            <span className="text-4xl">📊</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Engagement Heatmap</h1>
            <p className="text-lg text-gray-600 mt-1">
              Track attendance, LMS use, discussion tone • Visual risk dashboard
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-600">At-Risk Students</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.atRisk}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-600">Active Alerts</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.activeAlerts}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Avg Engagement</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.avgEngagement}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600">Critical Cases</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.criticalCases}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'heatmap', label: '🔥 Generate Heatmap', icon: '📊' },
                { id: 'visual', label: '📊 Visual Dashboard', icon: '📈' },
                { id: 'attendance', label: '✓ Attendance', icon: '📋' },
                { id: 'lms', label: '💻 LMS Activity', icon: '🖥️' },
                { id: 'sentiment', label: '💬 Discussion Sentiment', icon: '😊' },
                { id: 'alerts', label: '🚨 Risk Alerts', icon: '⚠️' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-600 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Generate Heatmap */}
            {activeTab === 'heatmap' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-6 border border-orange-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🔥 Generate Engagement Heatmap
                  </h3>
                  <p className="text-sm text-gray-700">
                    Comprehensive analysis of attendance, LMS activity, and discussion sentiment
                    with visual risk indicators.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., STU-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Period
                    </label>
                    <select
                      value={timePeriod}
                      onChange={e => setTimePeriod(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="semester">Semester</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateHeatmap}
                  disabled={loading || !studentId || !studentName || !startDate || !endDate}
                  className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? '🔄 Generating Heatmap...' : '🔥 Generate Engagement Heatmap'}
                </button>
              </div>
            )}

            {/* Tab: Visual Dashboard */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg p-6 border border-amber-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📊 Visual Risk Dashboard
                  </h3>
                  <p className="text-sm text-gray-700">
                    Interactive heatmap showing daily engagement patterns across attendance, LMS,
                    and sentiment.
                  </p>
                </div>

                {!heatmap ? (
                  <div className="text-center py-12">
                    <span className="text-6xl">📊</span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-4">
                      No Heatmap Generated
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Generate an engagement heatmap from the &quot;Generate Heatmap&quot; tab
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Student Info & Overall Score */}
                    <div className="bg-white rounded-lg border-2 border-orange-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            {heatmap.student_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {heatmap.start_date} to {heatmap.end_date} ({heatmap.time_period})
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-orange-600">
                            {heatmap.overall_engagement_score.toFixed(0)}%
                          </div>
                          <div
                            className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold border-2 ${getRiskLevelColor(heatmap.risk_level)}`}
                          >
                            {heatmap.risk_level.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Attendance</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {heatmap.attendance_score.toFixed(0)}%
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">LMS Activity</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {heatmap.lms_activity_score.toFixed(0)}%
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-sm text-gray-600">Sentiment</p>
                          <p className="text-2xl font-bold text-green-600">
                            {heatmap.sentiment_score.toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getTrendIcon(heatmap.engagement_trend)}</span>
                          <span className="text-sm font-medium text-gray-700">
                            {heatmap.engagement_trend.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({heatmap.change_percentage >= 0 ? '+' : ''}
                            {heatmap.change_percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          🚨 {heatmap.alerts_triggered} alerts triggered
                        </div>
                      </div>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Daily Engagement Heatmap</h4>
                      <div className="mb-4 flex gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span>High</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                          <span>Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-orange-500 rounded"></div>
                          <span>Low</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-300 rounded"></div>
                          <span>None</span>
                        </div>
                      </div>
                      {renderHeatmapGrid()}
                    </div>

                    {/* Risk Flags */}
                    {heatmap.risk_flags.length > 0 && (
                      <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">⚠️ Risk Indicators</h4>
                        <div className="space-y-2">
                          {heatmap.risk_flags.map((flag, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-red-700"
                            >
                              <span className="text-red-600">•</span>
                              <span>{flag.replace('_', ' ').toUpperCase()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Attendance */}
            {activeTab === 'attendance' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-6 border border-blue-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ✓ Attendance Tracking
                  </h3>
                  <p className="text-sm text-gray-700">
                    Monitor daily attendance, participation levels, and punctuality metrics.
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Recent Attendance Records</h4>
                  <div className="space-y-3">
                    {[
                      {
                        date: '2024-10-24',
                        status: 'present',
                        session: 'Data Analysis 101',
                        participation: 'high',
                        late: 0,
                      },
                      {
                        date: '2024-10-23',
                        status: 'present',
                        session: 'Python Programming',
                        participation: 'medium',
                        late: 5,
                      },
                      {
                        date: '2024-10-22',
                        status: 'absent',
                        session: 'Machine Learning',
                        participation: 'none',
                        late: 0,
                      },
                      {
                        date: '2024-10-21',
                        status: 'late',
                        session: 'Statistics',
                        participation: 'low',
                        late: 15,
                      },
                    ].map((record, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <div className="text-sm font-medium text-gray-600">{record.date}</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{record.session}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                record.status === 'present'
                                  ? 'bg-green-200 text-green-800'
                                  : record.status === 'late'
                                    ? 'bg-yellow-200 text-yellow-800'
                                    : 'bg-red-200 text-red-800'
                              }`}
                            >
                              {record.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-600">
                              Participation: {record.participation}
                            </span>
                            {record.late > 0 && (
                              <span className="text-xs text-orange-600">
                                {record.late} min late
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: LMS Activity */}
            {activeTab === 'lms' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-6 border border-purple-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    💻 LMS Activity Analysis
                  </h3>
                  <p className="text-sm text-gray-700">
                    Track logins, content views, assignments, and platform engagement metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Total Activities</p>
                    <p className="text-3xl font-bold text-purple-600">247</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    <p className="text-sm text-gray-600 mb-1">Time Spent</p>
                    <p className="text-3xl font-bold text-indigo-600">42.5 hrs</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Daily Average</p>
                    <p className="text-3xl font-bold text-blue-600">8.5 activities</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Activity Breakdown</h4>
                  <div className="space-y-3">
                    {[
                      { type: 'Video Watch', count: 45, time: 680 },
                      { type: 'Assignment Submit', count: 12, time: 240 },
                      { type: 'Forum Post', count: 28, time: 140 },
                      { type: 'Quiz Attempt', count: 15, time: 180 },
                      { type: 'Content View', count: 87, time: 320 },
                    ].map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{activity.type}</p>
                          <p className="text-sm text-gray-600">
                            {activity.count} activities • {activity.time} minutes
                          </p>
                        </div>
                        <div className="text-2xl">
                          {activity.type.includes('Video')
                            ? '🎥'
                            : activity.type.includes('Assignment')
                              ? '✍️'
                              : activity.type.includes('Forum')
                                ? '💬'
                                : activity.type.includes('Quiz')
                                  ? '📝'
                                  : '📖'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Sentiment */}
            {activeTab === 'sentiment' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border border-green-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    💬 Discussion Sentiment Analysis
                  </h3>
                  <p className="text-sm text-gray-700">
                    NLP-powered analysis of discussion tone, emotions, and engagement quality.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Avg Sentiment</p>
                    <p className="text-3xl font-bold text-green-600">+0.42</p>
                    <p className="text-xs text-gray-500 mt-1">Positive</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Messages Analyzed</p>
                    <p className="text-3xl font-bold text-blue-600">156</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Positive Ratio</p>
                    <p className="text-3xl font-bold text-purple-600">68%</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Recent Discussion Analysis</h4>
                  <div className="space-y-3">
                    {[
                      {
                        message: 'Great explanation! This really helped me understand...',
                        sentiment: 0.8,
                        emotion: 'joy',
                        label: 'very_positive',
                      },
                      {
                        message: "I'm still confused about the implementation...",
                        sentiment: -0.2,
                        emotion: 'confusion',
                        label: 'negative',
                      },
                      {
                        message: 'Thanks for sharing this resource!',
                        sentiment: 0.6,
                        emotion: 'interest',
                        label: 'positive',
                      },
                      {
                        message: "This is challenging but I'm making progress",
                        sentiment: 0.1,
                        emotion: 'interest',
                        label: 'neutral',
                      },
                    ].map((msg, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 mb-2">&quot;{msg.message}&quot;</p>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              msg.label === 'very_positive' || msg.label === 'positive'
                                ? 'bg-green-200 text-green-800'
                                : msg.label === 'negative'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            {msg.label.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-600">
                            Score: {msg.sentiment.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-600">Emotion: {msg.emotion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Alerts */}
            {activeTab === 'alerts' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-6 border border-red-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🚨 Engagement Risk Alerts
                  </h3>
                  <p className="text-sm text-gray-700">
                    Automated alerts for attendance issues, LMS inactivity, and negative sentiment
                    patterns.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      type: 'attendance',
                      severity: 'high',
                      title: 'Low Attendance Warning',
                      description: 'Student has attended only 45% of sessions in the past week',
                      actions: [
                        'Contact student',
                        'Review absence reasons',
                        'Provide attendance plan',
                      ],
                    },
                    {
                      type: 'lms_inactivity',
                      severity: 'medium',
                      title: 'LMS Inactivity Alert',
                      description: 'No LMS activity recorded in the past 3 days',
                      actions: ['Check technical access', 'Send reminder', 'Monitor submissions'],
                    },
                    {
                      type: 'negative_sentiment',
                      severity: 'medium',
                      title: 'Negative Sentiment Detected',
                      description: 'Recent discussion posts show frustration and confusion',
                      actions: ['Schedule check-in', 'Assess wellbeing', 'Connect with support'],
                    },
                  ].map((alert, index) => (
                    <div key={index} className="bg-white rounded-lg border-2 border-orange-200 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`}
                            ></span>
                            <h4 className="font-bold text-gray-900">{alert.title}</h4>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                        </div>
                      </div>

                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Recommended Actions:
                        </p>
                        <ul className="space-y-1">
                          {alert.actions.map((action, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-orange-600">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-all text-sm">
                          Acknowledge
                        </button>
                        <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
