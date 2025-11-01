'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface ModerationSession {
  id: number;
  session_number: string;
  name: string;
  description: string;
  assessment_type: string;
  assessment_title: string;
  total_submissions: number;
  assessors_count: number;
  outliers_detected: number;
  bias_flags_raised: number;
  decisions_compared: number;
  average_agreement_rate: number;
  fairness_score: number;
  status: string;
}

interface OutlierDetection {
  id: number;
  outlier_number: string;
  outlier_type: string;
  severity: string;
  z_score: number;
  deviation_percentage: number;
  expected_score: number;
  actual_score: number;
  explanation: string;
  confidence_score: number;
  is_resolved: boolean;
  decision_details: {
    student_id: string;
    student_name: string;
    assessor_name: string;
  };
}

interface BiasScore {
  id: number;
  bias_number: string;
  assessor_id: string;
  assessor_name: string;
  bias_type: string;
  bias_score: number;
  severity_level: number;
  severity_label: string;
  sample_size: number;
  mean_difference: number;
  recommendation: string;
  is_validated: boolean;
}

export default function ModerationToolPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [sessions, setSessions] = useState<ModerationSession[]>([]);
  const [outliers, setOutliers] = useState<OutlierDetection[]>([]);
  const [biasScores, setBiasScores] = useState<BiasScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assessment_type: 'exam',
    assessment_title: '',
    total_submissions: '',
    assessors_count: '',
    outlier_threshold: '2.0',
    bias_sensitivity: '5',
  });

  useEffect(() => {
    fetchDashboardData();
  }, [tenantSlug]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const sessionsRes = await fetch(`/api/tenants/${tenantSlug}/moderation-tool/sessions/`);
      const sessionsData = await sessionsRes.json();
      setSessions(sessionsData.results || sessionsData || []);

      const outliersRes = await fetch(
        `/api/tenants/${tenantSlug}/moderation-tool/outliers/?limit=20`
      );
      const outliersData = await outliersRes.json();
      setOutliers(outliersData.results || outliersData || []);

      const biasRes = await fetch(
        `/api/tenants/${tenantSlug}/moderation-tool/bias-scores/?limit=20`
      );
      const biasData = await biasRes.json();
      setBiasScores(biasData.results || biasData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/tenants/${tenantSlug}/moderation-tool/sessions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          total_submissions: parseInt(formData.total_submissions) || 0,
          assessors_count: parseInt(formData.assessors_count) || 0,
          outlier_threshold: parseFloat(formData.outlier_threshold),
          bias_sensitivity: parseInt(formData.bias_sensitivity),
        }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          assessment_type: 'exam',
          assessment_title: '',
          total_submissions: '',
          assessors_count: '',
          outlier_threshold: '2.0',
          bias_sensitivity: '5',
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleDetectOutliers = async (sessionId: number) => {
    try {
      const res = await fetch(
        `/api/tenants/${tenantSlug}/moderation-tool/sessions/${sessionId}/detect_outliers/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error detecting outliers:', error);
    }
  };

  const handleCalculateBias = async (sessionId: number) => {
    try {
      const res = await fetch(
        `/api/tenants/${tenantSlug}/moderation-tool/sessions/${sessionId}/calculate_bias/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      );

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error calculating bias:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getBiasColor = (biasScore: number) => {
    if (biasScore >= 0.7) return 'text-red-600';
    if (biasScore >= 0.4) return 'text-orange-600';
    if (biasScore >= 0.2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getFairnessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalOutliers = sessions.reduce((sum, s) => sum + s.outliers_detected, 0);
  const totalBiasFlags = sessions.reduce((sum, s) => sum + s.bias_flags_raised, 0);
  const avgFairness =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.fairness_score || 0), 0) / sessions.length
      : 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Moderation Tool</h2>
          <p className="text-gray-600 mt-2">
            Compare assessor decisions • Outlier detection + bias scoring • Validation & fairness
            evidence
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-md font-semibold"
        >
          ⚖️ New Session
        </button>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Moderation Sessions</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{sessions.length}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Outliers Detected</div>
          <div className="text-3xl font-bold text-orange-600 mt-2">{totalOutliers}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Bias Flags</div>
          <div className="text-3xl font-bold text-red-600 mt-2">{totalBiasFlags}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Avg Fairness Score</div>
          <div className={`text-3xl font-bold mt-2 ${getFairnessColor(avgFairness)}`}>
            {avgFairness.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Create Session Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-emerald-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Create Moderation Session</h3>
          <form onSubmit={handleCreateSession} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Session Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Final Exam Moderation 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assessment Type
                </label>
                <select
                  value={formData.assessment_type}
                  onChange={e => setFormData({ ...formData, assessment_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                  <option value="project">Project</option>
                  <option value="practical">Practical</option>
                  <option value="portfolio">Portfolio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assessment Title *
              </label>
              <input
                type="text"
                required
                value={formData.assessment_title}
                onChange={e => setFormData({ ...formData, assessment_title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Submissions
                </label>
                <input
                  type="number"
                  value={formData.total_submissions}
                  onChange={e => setFormData({ ...formData, total_submissions: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Assessors Count
                </label>
                <input
                  type="number"
                  value={formData.assessors_count}
                  onChange={e => setFormData({ ...formData, assessors_count: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 space-y-4">
              <h4 className="font-bold text-gray-900 mb-4">⚙️ Detection Settings</h4>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Outlier Threshold: {formData.outlier_threshold} std dev
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={formData.outlier_threshold}
                  onChange={e => setFormData({ ...formData, outlier_threshold: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5</span>
                  <span>2.5</span>
                  <span>5.0</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bias Sensitivity: {formData.bias_sensitivity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.bias_sensitivity}
                  onChange={e => setFormData({ ...formData, bias_sensitivity: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low (1)</span>
                  <span>Medium (5)</span>
                  <span>High (10)</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all font-semibold"
              >
                Create Session
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Moderation Sessions */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Moderation Sessions</h3>

        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">⚖️</div>
            <p>No moderation sessions yet. Create one to start analyzing fairness!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div
                key={session.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-emerald-300 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-gray-900">{session.name}</h4>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                        {session.session_number}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        {session.assessment_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{session.assessment_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDetectOutliers(session.id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all text-sm font-semibold"
                    >
                      🔍 Detect Outliers
                    </button>
                    <button
                      onClick={() => handleCalculateBias(session.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-semibold"
                    >
                      📊 Calculate Bias
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Decisions</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {session.decisions_compared}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Outliers</div>
                    <div className="text-sm font-semibold text-orange-600">
                      {session.outliers_detected}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Bias Flags</div>
                    <div className="text-sm font-semibold text-red-600">
                      {session.bias_flags_raised}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Agreement</div>
                    <div className="text-sm font-semibold text-green-600">
                      {(session.average_agreement_rate * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Fairness</div>
                    <div
                      className={`text-sm font-semibold ${getFairnessColor(session.fairness_score)}`}
                    >
                      {session.fairness_score?.toFixed(0) || 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Status</div>
                    <div className="text-sm font-semibold text-gray-900">{session.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outlier Detections */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Detected Outliers</h3>

        {outliers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p>No outliers detected yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {outliers.map(outlier => (
              <div
                key={outlier.id}
                className={`border-2 rounded-lg p-4 ${getSeverityColor(outlier.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-white bg-opacity-50 text-xs font-semibold rounded-full">
                        {outlier.outlier_number}
                      </span>
                      <span className="font-bold">{outlier.severity.toUpperCase()}</span>
                      <span className="text-sm">{outlier.outlier_type.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm mb-2">{outlier.explanation}</p>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="font-semibold">Z-Score:</span> {outlier.z_score.toFixed(2)}
                      </div>
                      <div>
                        <span className="font-semibold">Expected:</span>{' '}
                        {outlier.expected_score.toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-semibold">Actual:</span>{' '}
                        {outlier.actual_score.toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-semibold">Confidence:</span>{' '}
                        {(outlier.confidence_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  {!outlier.is_resolved && (
                    <button className="ml-4 px-3 py-1 bg-white text-gray-700 rounded text-sm font-semibold hover:bg-gray-100">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bias Scores */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Bias Analysis</h3>

        {biasScores.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p>No bias scores calculated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Assessor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Bias Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Severity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sample Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {biasScores.map(bias => (
                  <tr key={bias.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{bias.assessor_name}</div>
                      <div className="text-sm text-gray-500">{bias.assessor_id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm">{bias.bias_type.replace('_', ' ')}</td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${getBiasColor(bias.bias_score)}`}>
                        {(bias.bias_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          bias.severity_label === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : bias.severity_label === 'Significant'
                              ? 'bg-orange-100 text-orange-800'
                              : bias.severity_label === 'Moderate'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {bias.severity_label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{bias.sample_size}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{bias.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
