'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

interface AuthenticityCheck {
  id: number;
  check_number: string;
  name: string;
  status: string;
  total_submissions_checked: number;
  plagiarism_cases_detected: number;
  metadata_issues_found: number;
  anomalies_detected: number;
  overall_integrity_score: number;
}

interface SubmissionAnalysis {
  id: number;
  analysis_number: string;
  submission_id: string;
  student_name: string;
  plagiarism_score: number;
  metadata_verification_score: number;
  anomaly_score: number;
  combined_integrity_score: number;
  integrity_status: string;
  plagiarism_detected: boolean;
  metadata_issues: boolean;
  anomalies_found: boolean;
}

interface PlagiarismMatch {
  id: number;
  match_number: string;
  similarity_score: number;
  match_type: string;
  severity: string;
  matched_percentage: number;
}

interface AnomalyDetection {
  id: number;
  anomaly_number: string;
  anomaly_type: string;
  severity: string;
  description: string;
  confidence_score: number;
  impact_score: number;
}

export default function AuthenticityCheckPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('checks');
  const [checks, setChecks] = useState<AuthenticityCheck[]>([]);
  const [analyses, setAnalyses] = useState<SubmissionAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SubmissionAnalysis | null>(null);
  const [plagiarismMatches, setPlagiarismMatches] = useState<PlagiarismMatch[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);

  const tabs = ['checks', 'submissions', 'plagiarism', 'anomalies', 'reports'];

  const handleCreateCheck = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newCheck = {
      name: formData.get('name'),
      assessment_id: formData.get('assessment_id'),
      plagiarism_threshold: parseFloat(formData.get('plagiarism_threshold') as string),
      metadata_verification_enabled: formData.get('metadata_verification') === 'on',
      anomaly_detection_enabled: formData.get('anomaly_detection') === 'on',
      academic_integrity_mode: formData.get('academic_integrity') === 'on',
    };

    console.log('Creating authenticity check:', newCheck);
    e.currentTarget.reset();
  };

  const handleAnalyzeSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const analysisRequest = {
      submission_id: formData.get('submission_id'),
      content: formData.get('content'),
    };

    console.log('Analyzing submission:', analysisRequest);
    e.currentTarget.reset();
  };

  const getIntegrityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Authenticity Check</h1>
          <p className="mt-2 text-gray-600">
            Plagiarism detection • Metadata verification • Anomaly detection • Academic integrity
            compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Checks</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">{checks.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Plagiarism Detected</div>
            <div className="mt-2 text-3xl font-bold text-red-600">
              {checks.reduce((sum, c) => sum + c.plagiarism_cases_detected, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Metadata Issues</div>
            <div className="mt-2 text-3xl font-bold text-orange-600">
              {checks.reduce((sum, c) => sum + c.metadata_issues_found, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Anomalies Found</div>
            <div className="mt-2 text-3xl font-bold text-yellow-600">
              {checks.reduce((sum, c) => sum + c.anomalies_detected, 0)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'checks' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Create Authenticity Check
                </h2>
                <form onSubmit={handleCreateCheck} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="e.g., Final Assessment Plagiarism Check"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assessment ID
                    </label>
                    <input
                      type="text"
                      name="assessment_id"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Assessment ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plagiarism Threshold (0.0 - 1.0)
                    </label>
                    <input
                      type="number"
                      name="plagiarism_threshold"
                      step="0.01"
                      min="0"
                      max="1"
                      defaultValue="0.7"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="metadata_verification"
                        defaultChecked
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable Metadata Verification</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="anomaly_detection"
                        defaultChecked
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable Anomaly Detection</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="academic_integrity"
                        defaultChecked
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Academic Integrity Mode</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Create Check
                  </button>
                </form>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Checks</h3>
                  <div className="space-y-3">
                    {checks.map(check => (
                      <div key={check.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{check.name}</div>
                            <div className="text-sm text-gray-500">{check.check_number}</div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              check.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : check.status === 'processing'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {check.status}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Submissions</div>
                            <div className="font-medium">{check.total_submissions_checked}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Plagiarism</div>
                            <div className="font-medium text-red-600">
                              {check.plagiarism_cases_detected}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Metadata Issues</div>
                            <div className="font-medium text-orange-600">
                              {check.metadata_issues_found}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Integrity Score</div>
                            <div
                              className={`font-medium ${getIntegrityColor(check.overall_integrity_score)}`}
                            >
                              {check.overall_integrity_score.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Analyze Submission</h2>
                <form onSubmit={handleAnalyzeSubmission} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submission ID
                    </label>
                    <input
                      type="text"
                      name="submission_id"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="SUB-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submission Content
                    </label>
                    <textarea
                      name="content"
                      rows={6}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Paste submission content here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Analyze Submission
                  </button>
                </form>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
                  <div className="space-y-3">
                    {analyses.map(analysis => (
                      <div
                        key={analysis.id}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-red-300"
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">
                              {analysis.student_name || analysis.submission_id}
                            </div>
                            <div className="text-sm text-gray-500">{analysis.analysis_number}</div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              analysis.integrity_status === 'pass'
                                ? 'bg-green-100 text-green-700'
                                : analysis.integrity_status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {analysis.integrity_status}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Plagiarism</div>
                            <div className="font-medium text-red-600">
                              {(analysis.plagiarism_score * 100).toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Metadata</div>
                            <div className="font-medium">
                              {analysis.metadata_verification_score.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Anomaly</div>
                            <div className="font-medium text-orange-600">
                              {analysis.anomaly_score.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Integrity</div>
                            <div
                              className={`font-medium ${getIntegrityColor(analysis.combined_integrity_score)}`}
                            >
                              {analysis.combined_integrity_score.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'plagiarism' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Plagiarism Matches</h2>
                <div className="space-y-3">
                  {plagiarismMatches.map(match => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-gray-900">{match.match_number}</div>
                          <div className="text-sm text-gray-500">
                            Similarity: {(match.similarity_score * 100).toFixed(1)}%
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(match.severity)}`}
                        >
                          {match.severity}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Match Type</div>
                          <div className="font-medium">{match.match_type}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Matched Content</div>
                          <div className="font-medium">{match.matched_percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'anomalies' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detected Anomalies</h2>
                <div className="space-y-3">
                  {anomalies.map(anomaly => (
                    <div key={anomaly.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-gray-900">{anomaly.anomaly_number}</div>
                          <div className="text-sm text-gray-500">{anomaly.description}</div>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(anomaly.severity)}`}
                        >
                          {anomaly.severity}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Type</div>
                          <div className="font-medium">
                            {anomaly.anomaly_type.replace('_', ' ')}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Confidence</div>
                          <div className="font-medium">
                            {(anomaly.confidence_score * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Impact</div>
                          <div className="font-medium">{anomaly.impact_score.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Integrity Reports</h2>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="text-gray-500 mb-4">
                    Select a check to generate a comprehensive integrity report
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Generate Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
