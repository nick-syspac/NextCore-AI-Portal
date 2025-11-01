'use client';

import { useState, useEffect } from 'react';

interface ASQAStandard {
  id: number;
  standard_number: string;
  title: string;
  description: string;
  standard_type: string;
  standard_type_display: string;
  clause_count: number;
  is_active: boolean;
}

interface Policy {
  id: number;
  policy_number: string;
  title: string;
  description: string;
  policy_type: string;
  policy_type_display: string;
  status: string;
  status_display: string;
  compliance_score: number | null;
  last_compared_at: string | null;
  comparison_count: number;
  compliance_status: string;
  created_at: string;
}

interface ComparisonResult {
  id: number;
  similarity_score: number;
  match_type: string;
  match_type_display: string;
  gap_description: string;
  recommendations: string[];
  keywords_matched: string[];
  keywords_missing: string[];
  is_compliant: boolean;
  requires_action: boolean;
  asqa_clause_details: {
    clause_number: string;
    title: string;
    compliance_level: string;
  };
}

interface GapSummary {
  total_gaps: number;
  critical_gaps: number;
  moderate_gaps: number;
  minor_gaps: number;
  compliance_score: number | null;
}

export default function PolicyComparatorPage({ params }: { params: { tenantSlug: string } }) {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [standards, setStandards] = useState<ASQAStandard[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [gapSummary, setGapSummary] = useState<GapSummary | null>(null);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [activeTab, setActiveTab] = useState<'policies' | 'gaps' | 'results'>('policies');

  // New policy form
  const [newPolicy, setNewPolicy] = useState({
    policy_number: '',
    title: '',
    description: '',
    policy_type: 'assessment',
    content: '',
  });

  // Compare form
  const [compareForm, setCompareForm] = useState({
    standard_ids: [] as number[],
    session_name: '',
  });

  // Mock data
  useEffect(() => {
    // Mock policies
    setPolicies([
      {
        id: 1,
        policy_number: 'POL-001',
        title: 'Assessment Policy',
        description: 'Policy for student assessment procedures',
        policy_type: 'assessment',
        policy_type_display: 'Assessment',
        status: 'approved',
        status_display: 'Approved',
        compliance_score: 78.5,
        last_compared_at: '2025-10-20T10:30:00Z',
        comparison_count: 3,
        compliance_status: 'needs_improvement',
        created_at: '2025-01-15T08:00:00Z',
      },
      {
        id: 2,
        policy_number: 'POL-002',
        title: 'Complaints and Appeals Policy',
        description: 'Policy for handling complaints and appeals',
        policy_type: 'complaints_appeals',
        policy_type_display: 'Complaints and Appeals',
        status: 'approved',
        status_display: 'Approved',
        compliance_score: 92.0,
        last_compared_at: '2025-10-18T14:20:00Z',
        comparison_count: 2,
        compliance_status: 'compliant',
        created_at: '2025-01-10T09:00:00Z',
      },
    ]);

    // Mock ASQA standards
    setStandards([
      {
        id: 1,
        standard_number: '1',
        title: 'Training and Assessment',
        description: 'Standards for training and assessment quality',
        standard_type: 'training_assessment',
        standard_type_display: 'Training and Assessment',
        clause_count: 15,
        is_active: true,
      },
      {
        id: 2,
        standard_number: '2',
        title: 'The operations of the RTO',
        description: 'Operational requirements for RTOs',
        standard_type: 'governance',
        standard_type_display: 'Governance and Administration',
        clause_count: 12,
        is_active: true,
      },
      {
        id: 3,
        standard_number: '6',
        title: 'Complaints and appeals',
        description: 'Requirements for complaints and appeals processes',
        standard_type: 'complaints_appeals',
        standard_type_display: 'Complaints and Appeals',
        clause_count: 8,
        is_active: true,
      },
    ]);
  }, []);

  const handleCompare = async () => {
    if (!selectedPolicy) return;

    setComparing(true);

    // Simulate comparison
    setTimeout(() => {
      // Mock comparison results
      setComparisonResults([
        {
          id: 1,
          similarity_score: 0.85,
          match_type: 'full',
          match_type_display: 'Full Match',
          gap_description: 'Policy fully addresses this ASQA clause.',
          recommendations: [],
          keywords_matched: ['assessment', 'evidence', 'competency'],
          keywords_missing: [],
          is_compliant: true,
          requires_action: false,
          asqa_clause_details: {
            clause_number: '1.1',
            title: 'Training and assessment',
            compliance_level: 'critical',
          },
        },
        {
          id: 2,
          similarity_score: 0.62,
          match_type: 'partial',
          match_type_display: 'Partial Match',
          gap_description: 'Policy partially addresses this clause but needs additional detail.',
          recommendations: [
            'Include references to: moderation, validation',
            'Add specific procedures and evidence requirements',
          ],
          keywords_matched: ['assessment', 'student'],
          keywords_missing: ['moderation', 'validation'],
          is_compliant: false,
          requires_action: true,
          asqa_clause_details: {
            clause_number: '1.2',
            title: 'Assessor requirements',
            compliance_level: 'essential',
          },
        },
        {
          id: 3,
          similarity_score: 0.35,
          match_type: 'no_match',
          match_type_display: 'No Match',
          gap_description: 'Policy does not adequately address this ASQA clause.',
          recommendations: [
            'Include references to: industry engagement, employer consultation',
            'Consider creating a dedicated policy section',
            'Review ASQA guidance materials',
          ],
          keywords_matched: [],
          keywords_missing: ['industry', 'employer', 'consultation'],
          is_compliant: false,
          requires_action: true,
          asqa_clause_details: {
            clause_number: '1.5',
            title: 'Industry engagement',
            compliance_level: 'essential',
          },
        },
      ]);

      setGapSummary({
        total_gaps: 2,
        critical_gaps: 0,
        moderate_gaps: 1,
        minor_gaps: 1,
        compliance_score: selectedPolicy.compliance_score,
      });

      setComparing(false);
      setShowCompareModal(false);
      setShowResultsModal(true);
      setActiveTab('results');
    }, 2500);
  };

  const handleAddPolicy = () => {
    // Simulate adding policy
    alert('Policy created successfully!');
    setShowAddPolicyModal(false);
    setNewPolicy({
      policy_number: '',
      title: '',
      description: '',
      policy_type: 'assessment',
      content: '',
    });
  };

  const getComplianceColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getComplianceLabel = (score: number | null) => {
    if (score === null) return 'Not Assessed';
    if (score >= 80) return 'Compliant';
    if (score >= 60) return 'Needs Improvement';
    return 'Non-Compliant';
  };

  const getMatchColor = (matchType: string) => {
    const colors: Record<string, string> = {
      full: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      weak: 'bg-orange-100 text-orange-800',
      no_match: 'bg-red-100 text-red-800',
    };
    return colors[matchType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔍 Policy Comparator</h1>
            <p className="text-gray-600">
              Compare policies to ASQA clauses • NLP-based text similarity • Instant compliance gap
              detection
            </p>
          </div>
          <button
            onClick={() => setShowAddPolicyModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg font-semibold"
          >
            📄 Add Policy
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-900">{policies.length}</div>
            <div className="text-sm text-gray-600">Total Policies</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">⚖️</div>
            <div className="text-2xl font-bold text-gray-900">{standards.length}</div>
            <div className="text-sm text-gray-600">ASQA Standards</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-blue-600">NLP</div>
            <div className="text-sm text-gray-600">Text Similarity</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-purple-600">Instant</div>
            <div className="text-sm text-gray-600">Gap Detection</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'policies', label: 'Policies', icon: '📋' },
            { key: 'gaps', label: 'Gap Analysis', icon: '🔍' },
            { key: 'results', label: 'Comparison Results', icon: '📊' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-4 font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {policies.map(policy => (
            <div
              key={policy.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{policy.policy_number}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        policy.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {policy.status_display}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium">{policy.title}</p>
                  <p className="text-sm text-gray-500">{policy.policy_type_display}</p>
                </div>
              </div>

              {/* Compliance Score */}
              {policy.compliance_score !== null && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">🎯 Compliance Score</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getComplianceColor(policy.compliance_score)}`}
                    >
                      {getComplianceLabel(policy.compliance_score)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          policy.compliance_score >= 80
                            ? 'bg-green-500'
                            : policy.compliance_score >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${policy.compliance_score}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {policy.compliance_score}%
                    </span>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-500">Last Compared</div>
                  <div className="font-medium text-gray-900">
                    {policy.last_compared_at
                      ? new Date(policy.last_compared_at).toLocaleDateString()
                      : 'Never'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Comparisons</div>
                  <div className="font-medium text-gray-900">{policy.comparison_count}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setShowCompareModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🔍 Compare to ASQA
                </button>
                <button
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setActiveTab('gaps');
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📊 View Gaps
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gap Analysis Tab */}
      {activeTab === 'gaps' && selectedPolicy && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Gap Analysis Summary - {selectedPolicy.policy_number}
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">2</div>
                <div className="text-sm text-gray-600">Total Gaps</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">Critical</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">1</div>
                <div className="text-sm text-gray-600">Moderate</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">Minor</div>
              </div>
            </div>
          </div>

          {/* Gap Details */}
          <div className="space-y-4">
            {comparisonResults
              .filter(r => r.requires_action)
              .map(result => (
                <div
                  key={result.id}
                  className="bg-white rounded-xl shadow-sm border-l-4 border-red-500 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">
                          Clause {result.asqa_clause_details.clause_number}:{' '}
                          {result.asqa_clause_details.title}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getMatchColor(result.match_type)}`}
                        >
                          {result.match_type_display}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{result.gap_description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {(result.similarity_score * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">Similarity</div>
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  {result.keywords_missing.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        ❌ Missing Keywords:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords_missing.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-blue-900 mb-2">
                        💡 Recommendations:
                      </div>
                      <ul className="space-y-1 text-sm text-blue-800">
                        {result.recommendations.map((rec, idx) => (
                          <li key={idx}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          {comparisonResults.map(result => (
            <div
              key={result.id}
              className={`bg-white rounded-xl shadow-sm border-l-4 p-6 ${
                result.is_compliant ? 'border-green-500' : 'border-yellow-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">
                      Clause {result.asqa_clause_details.clause_number}:{' '}
                      {result.asqa_clause_details.title}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getMatchColor(result.match_type)}`}
                    >
                      {result.match_type_display}
                    </span>
                    {result.is_compliant && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        ✓ Compliant
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{result.gap_description}</p>

                  {/* Keywords */}
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Matched: </span>
                      {result.keywords_matched.length > 0 ? (
                        <span className="text-green-600">{result.keywords_matched.join(', ')}</span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </div>
                    {result.keywords_missing.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700">Missing: </span>
                        <span className="text-red-600">{result.keywords_missing.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {(result.similarity_score * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">NLP Score</div>
                </div>
              </div>
            </div>
          ))}

          {comparisonResults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Comparison Results</h3>
              <p className="text-gray-600">Select a policy and run a comparison to see results</p>
            </div>
          )}
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📄 Add New Policy</h2>
              <button
                onClick={() => setShowAddPolicyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Policy Number *
                  </label>
                  <input
                    type="text"
                    value={newPolicy.policy_number}
                    onChange={e => setNewPolicy({ ...newPolicy, policy_number: e.target.value })}
                    placeholder="POL-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Policy Type *
                  </label>
                  <select
                    value={newPolicy.policy_type}
                    onChange={e => setNewPolicy({ ...newPolicy, policy_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="assessment">Assessment</option>
                    <option value="training_delivery">Training and Delivery</option>
                    <option value="student_support">Student Support</option>
                    <option value="complaints_appeals">Complaints and Appeals</option>
                    <option value="financial">Financial</option>
                    <option value="governance">Governance</option>
                    <option value="quality_assurance">Quality Assurance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Policy Title *
                </label>
                <input
                  type="text"
                  value={newPolicy.title}
                  onChange={e => setNewPolicy({ ...newPolicy, title: e.target.value })}
                  placeholder="e.g., Assessment Policy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPolicy.description}
                  onChange={e => setNewPolicy({ ...newPolicy, description: e.target.value })}
                  placeholder="Brief description of the policy"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Policy Content *
                </label>
                <textarea
                  value={newPolicy.content}
                  onChange={e => setNewPolicy({ ...newPolicy, content: e.target.value })}
                  placeholder="Full policy text..."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowAddPolicyModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPolicy}
                disabled={!newPolicy.policy_number || !newPolicy.title || !newPolicy.content}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                📄 Add Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-900">
                🔍 Compare Policy to ASQA Standards
              </h2>
              <button
                onClick={() => setShowCompareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="font-semibold text-blue-900 mb-1">Selected Policy:</div>
                <div className="text-blue-800">
                  {selectedPolicy.policy_number} - {selectedPolicy.title}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select ASQA Standards to Compare:
                </label>
                <div className="space-y-2">
                  {standards.map(standard => (
                    <label
                      key={standard.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={compareForm.standard_ids.includes(standard.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setCompareForm({
                              ...compareForm,
                              standard_ids: [...compareForm.standard_ids, standard.id],
                            });
                          } else {
                            setCompareForm({
                              ...compareForm,
                              standard_ids: compareForm.standard_ids.filter(
                                id => id !== standard.id
                              ),
                            });
                          }
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          Standard {standard.standard_number}: {standard.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {standard.clause_count} clauses • {standard.standard_type_display}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                <div className="flex items-start gap-2">
                  <div className="text-2xl">🤖</div>
                  <div>
                    <div className="font-semibold text-purple-900 mb-1">NLP-Based Comparison</div>
                    <div className="text-sm text-purple-800">
                      Using advanced text similarity algorithms to analyze policy text against ASQA
                      requirements. Results include similarity scores, matched keywords, and
                      compliance gaps.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-xl">
              <button
                onClick={() => setShowCompareModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCompare}
                disabled={comparing || compareForm.standard_ids.length === 0}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {comparing ? '🔍 Comparing...' : '🔍 Start Comparison'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📊 Comparison Results</h2>
              <button
                onClick={() => setShowResultsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="font-semibold text-green-900 mb-2">✓ Comparison Complete!</div>
                <div className="text-green-800">
                  Analyzed {selectedPolicy?.policy_number} against {compareForm.standard_ids.length}{' '}
                  ASQA standards. Found {comparisonResults.filter(r => r.requires_action).length}{' '}
                  areas requiring attention.
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {comparisonResults.filter(r => r.is_compliant).length}
                  </div>
                  <div className="text-xs text-gray-600">Compliant</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {comparisonResults.filter(r => r.match_type === 'partial').length}
                  </div>
                  <div className="text-xs text-gray-600">Partial Match</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {comparisonResults.filter(r => r.match_type === 'no_match').length}
                  </div>
                  <div className="text-xs text-gray-600">Gaps Found</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{comparisonResults.length}</div>
                  <div className="text-xs text-gray-600">Total Checked</div>
                </div>
              </div>

              <div className="text-center text-gray-600">
                <p>
                  View detailed results in the{' '}
                  <button
                    onClick={() => {
                      setShowResultsModal(false);
                      setActiveTab('results');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Comparison Results
                  </button>{' '}
                  tab
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowResultsModal(false)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
