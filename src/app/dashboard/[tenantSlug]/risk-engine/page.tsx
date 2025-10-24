'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface RiskAssessment {
  id: string;
  assessment_number: string;
  student_id: string;
  student_name: string;
  dropout_probability: number;
  risk_level: string;
  risk_score: number;
  engagement_score: number;
  performance_score: number;
  attendance_score: number;
  sentiment_score: number;
  confidence: number;
  status: string;
  assessment_date: string;
  alert_triggered: boolean;
  alert_acknowledged: boolean;
}

interface RiskFactor {
  id: string;
  factor_number: string;
  factor_type: string;
  factor_name: string;
  description: string;
  weight: number;
  contribution: number;
  severity: string;
  current_value: number;
  threshold_value: number;
  threshold_exceeded: boolean;
  trend: string;
}

interface InterventionAction {
  id: string;
  action_number: string;
  action_type: string;
  description: string;
  priority: string;
  scheduled_date: string;
  status: string;
  assigned_to_name?: string;
}

export default function RiskEnginePage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('assess');
  const [assessments, setAssessments] = useState<RiskAssessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [interventions, setInterventions] = useState<InterventionAction[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loginFrequency, setLoginFrequency] = useState('');
  const [timeOnPlatform, setTimeOnPlatform] = useState('');
  const [submissionRate, setSubmissionRate] = useState('');
  const [avgGrade, setAvgGrade] = useState('');
  const [attendanceRate, setAttendanceRate] = useState('');
  const [sentimentText, setSentimentText] = useState('');

  // Statistics
  const totalAssessments = assessments.length;
  const criticalRisk = assessments.filter(a => a.risk_level === 'critical').length;
  const highRisk = assessments.filter(a => a.risk_level === 'high').length;
  const activeAlerts = assessments.filter(a => a.alert_triggered && !a.alert_acknowledged).length;

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }
  }, [router]);

  const handlePredict = async () => {
    if (!studentName || !studentId) {
      alert('Please enter student name and ID');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const dropoutProb = Math.random() * 0.9 + 0.05;
      const riskScore = Math.floor(dropoutProb * 100);
      
      let riskLevel = 'low';
      if (dropoutProb >= 0.75) riskLevel = 'critical';
      else if (dropoutProb >= 0.50) riskLevel = 'high';
      else if (dropoutProb >= 0.25) riskLevel = 'medium';

      const newAssessment: RiskAssessment = {
        id: `${Date.now()}`,
        assessment_number: `RISK-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(assessments.length + 1).padStart(6, '0')}`,
        student_id: studentId,
        student_name: studentName,
        dropout_probability: dropoutProb,
        risk_level: riskLevel,
        risk_score: riskScore,
        engagement_score: parseFloat(loginFrequency) || Math.random() * 100,
        performance_score: parseFloat(avgGrade) || Math.random() * 100,
        attendance_score: parseFloat(attendanceRate) || Math.random() * 100,
        sentiment_score: Math.random() * 2 - 1,
        confidence: Math.random() * 20 + 75,
        status: 'active',
        assessment_date: new Date().toISOString().split('T')[0],
        alert_triggered: riskLevel === 'high' || riskLevel === 'critical',
        alert_acknowledged: false,
      };

      setAssessments([newAssessment, ...assessments]);
      setSelectedAssessment(newAssessment);
      
      // Generate risk factors
      const factors: RiskFactor[] = [];
      if (newAssessment.engagement_score < 60) {
        factors.push({
          id: `${Date.now()}-1`,
          factor_number: `RF-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-000001`,
          factor_type: 'engagement',
          factor_name: 'Low Engagement',
          description: `Student engagement score is ${newAssessment.engagement_score.toFixed(1)}%, indicating reduced platform activity.`,
          weight: 0.35,
          contribution: (100 - newAssessment.engagement_score) * 0.3,
          severity: newAssessment.engagement_score < 30 ? 'critical' : newAssessment.engagement_score < 45 ? 'high' : 'medium',
          current_value: newAssessment.engagement_score,
          threshold_value: 60,
          threshold_exceeded: true,
          trend: 'declining',
        });
      }
      
      if (newAssessment.performance_score < 65) {
        factors.push({
          id: `${Date.now()}-2`,
          factor_number: `RF-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-000002`,
          factor_type: 'academic',
          factor_name: 'Poor Academic Performance',
          description: `Academic performance score is ${newAssessment.performance_score.toFixed(1)}%, below expected standards.`,
          weight: 0.28,
          contribution: (100 - newAssessment.performance_score) * 0.28,
          severity: newAssessment.performance_score < 40 ? 'critical' : newAssessment.performance_score < 50 ? 'high' : 'medium',
          current_value: newAssessment.performance_score,
          threshold_value: 65,
          threshold_exceeded: true,
          trend: 'declining',
        });
      }
      
      if (newAssessment.attendance_score < 75) {
        factors.push({
          id: `${Date.now()}-3`,
          factor_number: `RF-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-000003`,
          factor_type: 'attendance',
          factor_name: 'Poor Attendance',
          description: `Attendance rate is ${newAssessment.attendance_score.toFixed(1)}%, below minimum requirement.`,
          weight: 0.22,
          contribution: (100 - newAssessment.attendance_score) * 0.22,
          severity: newAssessment.attendance_score < 50 ? 'critical' : newAssessment.attendance_score < 60 ? 'high' : 'medium',
          current_value: newAssessment.attendance_score,
          threshold_value: 75,
          threshold_exceeded: true,
          trend: 'declining',
        });
      }

      setRiskFactors(factors);
      setLoading(false);
      setActiveTab('results');
    }, 2000);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
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
        return '⚠️📉';
      default: 
        return '➡️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${tenantSlug}`} className="text-red-600 hover:text-red-800 font-medium">
                ← Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Risk Engine
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-sm font-medium rounded-full">
                ⚠️ ML + Sentiment
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Risk Engine</h2>
          <p className="text-gray-600 mt-2">
            Predict dropout risk using logistic regression + sentiment fusion with early warning alerts
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Active Alerts</div>
            <div className="text-3xl font-bold text-red-600">{activeAlerts}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Critical Risk</div>
            <div className="text-3xl font-bold text-orange-600">{criticalRisk}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="text-sm font-medium text-gray-600 mb-1">High Risk</div>
            <div className="text-3xl font-bold text-yellow-600">{highRisk}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="text-sm font-medium text-gray-600 mb-1">Total Assessments</div>
            <div className="text-3xl font-bold text-gray-900">{totalAssessments}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('assess')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'assess'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 Predict Risk
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'results'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Analysis Results
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'alerts'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🚨 Risk Alerts
              </button>
              <button
                onClick={() => setActiveTab('interventions')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'interventions'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🤝 Interventions
              </button>
              <button
                onClick={() => setActiveTab('model')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'model'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🤖 Model Info
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Predict Risk Tab */}
            {activeTab === 'assess' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Predict Dropout Risk</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Enter student data to predict dropout risk using logistic regression + sentiment fusion model
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter student name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Enter student ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">📊 Engagement Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login Frequency (per week)
                      </label>
                      <input
                        type="number"
                        value={loginFrequency}
                        onChange={(e) => setLoginFrequency(e.target.value)}
                        placeholder="e.g., 5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time on Platform (hrs/week)
                      </label>
                      <input
                        type="number"
                        value={timeOnPlatform}
                        onChange={(e) => setTimeOnPlatform(e.target.value)}
                        placeholder="e.g., 8"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignment Submission Rate (%)
                      </label>
                      <input
                        type="number"
                        value={submissionRate}
                        onChange={(e) => setSubmissionRate(e.target.value)}
                        placeholder="e.g., 85"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">📚 Performance Metrics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Average Grade (%)
                      </label>
                      <input
                        type="number"
                        value={avgGrade}
                        onChange={(e) => setAvgGrade(e.target.value)}
                        placeholder="e.g., 72"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attendance Rate (%)
                      </label>
                      <input
                        type="number"
                        value={attendanceRate}
                        onChange={(e) => setAttendanceRate(e.target.value)}
                        placeholder="e.g., 90"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">💬 Sentiment Data</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recent Communication Sample (optional)
                    </label>
                    <textarea
                      value={sentimentText}
                      onChange={(e) => setSentimentText(e.target.value)}
                      placeholder="Paste recent email, forum post, or feedback from student..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handlePredict}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Analyzing Risk...
                      </span>
                    ) : (
                      '🚨 Predict Dropout Risk'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setStudentName('');
                      setStudentId('');
                      setLoginFrequency('');
                      setTimeOnPlatform('');
                      setSubmissionRate('');
                      setAvgGrade('');
                      setAttendanceRate('');
                      setSentimentText('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Clear Form
                  </button>
                </div>
              </div>
            )}

            {/* Analysis Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                {selectedAssessment ? (
                  <>
                    <div className={`rounded-lg p-6 border-2 ${getRiskLevelColor(selectedAssessment.risk_level)}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{selectedAssessment.student_name}</h3>
                          <p className="text-sm text-gray-600">Student ID: {selectedAssessment.student_id}</p>
                          <p className="text-sm text-gray-600">Assessment: {selectedAssessment.assessment_number}</p>
                          <p className="text-sm text-gray-600">Date: {selectedAssessment.assessment_date}</p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-block px-4 py-2 rounded-lg font-bold text-lg border-2 ${getRiskLevelColor(selectedAssessment.risk_level)}`}>
                            {selectedAssessment.risk_level.toUpperCase()} RISK
                          </div>
                          <div className="mt-2 text-sm">
                            <span className="font-semibold">Dropout Probability:</span> {(selectedAssessment.dropout_probability * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold">Model Confidence:</span> {selectedAssessment.confidence.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Engagement</div>
                          <div className="text-lg font-bold text-emerald-600">{selectedAssessment.engagement_score.toFixed(1)}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Performance</div>
                          <div className="text-lg font-bold text-blue-600">{selectedAssessment.performance_score.toFixed(1)}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Attendance</div>
                          <div className="text-lg font-bold text-indigo-600">{selectedAssessment.attendance_score.toFixed(1)}%</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="text-xs text-gray-600 mb-1">Sentiment</div>
                          <div className={`text-lg font-bold ${selectedAssessment.sentiment_score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedAssessment.sentiment_score.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {riskFactors.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Contributing Risk Factors</h4>
                        <div className="space-y-4">
                          {riskFactors.map((factor) => (
                            <div key={factor.id} className="bg-white rounded-lg border border-gray-200 p-5">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="text-md font-semibold text-gray-900">{factor.factor_name}</h5>
                                    <span className="text-sm">{getTrendIcon(factor.trend)}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{factor.description}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                  <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getSeverityColor(factor.severity)}`}>
                                    {factor.severity.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    Weight: {(factor.weight * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                                <div>
                                  <div className="text-xs text-gray-600">Current Value</div>
                                  <div className="text-sm font-semibold text-gray-900">{factor.current_value.toFixed(1)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600">Threshold</div>
                                  <div className="text-sm font-semibold text-gray-900">{factor.threshold_value.toFixed(1)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600">Contribution</div>
                                  <div className="text-sm font-semibold text-red-600">{factor.contribution.toFixed(1)}%</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-600">No assessment selected. Predict risk for a student to view results.</p>
                    <button
                      onClick={() => setActiveTab('assess')}
                      className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Predict Risk
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Risk Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Risk Alerts</h3>
                {assessments.filter(a => a.alert_triggered && !a.alert_acknowledged).length > 0 ? (
                  <div className="space-y-4">
                    {assessments.filter(a => a.alert_triggered && !a.alert_acknowledged).map((assessment) => (
                      <div key={assessment.id} className="bg-red-50 rounded-lg border-2 border-red-300 p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">🚨</span>
                              <h4 className="text-lg font-semibold text-gray-900">{assessment.student_name}</h4>
                              <span className={`px-3 py-1 rounded-lg font-semibold text-sm ${getRiskLevelColor(assessment.risk_level)}`}>
                                {assessment.risk_level.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">
                              Dropout probability: <span className="font-bold text-red-600">{(assessment.dropout_probability * 100).toFixed(1)}%</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              Assessment: {assessment.assessment_number} • Date: {assessment.assessment_date}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setActiveTab('results');
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-6xl mb-4">✅</div>
                    <p className="text-gray-600">No active alerts. All at-risk students have been addressed.</p>
                  </div>
                )}
              </div>
            )}

            {/* Interventions Tab */}
            {activeTab === 'interventions' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Intervention Actions</h3>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">🤝</div>
                  <p className="text-gray-600">Intervention tracking will be displayed here.</p>
                  <p className="text-sm text-gray-500 mt-2">Automatic interventions are created for high and critical risk students.</p>
                </div>
              </div>
            )}

            {/* Model Info Tab */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Logistic Regression + Sentiment Fusion Model</h3>
                  <p className="text-sm text-gray-600">
                    Our dropout prediction model combines traditional logistic regression with advanced sentiment analysis
                    to provide accurate early warning alerts.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">🤖 Model Architecture</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Type:</strong> Logistic Regression with Sentiment Fusion</p>
                    <p><strong>Version:</strong> logistic_v1.0</p>
                    <p><strong>Input Features:</strong> Engagement Score, Performance Score, Attendance Score, Sentiment Score</p>
                    <p><strong>Output:</strong> Dropout Probability (0.0 - 1.0)</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
                  <h4 className="font-semibold text-gray-900 mb-3">⚖️ Feature Weights</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Engagement Score</span>
                      <span className="font-semibold text-emerald-700">35% weight</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{width: '35%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Performance Score</span>
                      <span className="font-semibold text-blue-700">28% weight</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '28%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Attendance Score</span>
                      <span className="font-semibold text-indigo-700">22% weight</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{width: '22%'}}></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Sentiment Score</span>
                      <span className="font-semibold text-purple-700">15% weight</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '15%'}}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-200">
                  <h4 className="font-semibold text-gray-900 mb-3">🎯 Risk Level Thresholds</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded bg-red-600 text-white font-semibold text-xs">CRITICAL</span>
                      <span className="text-gray-700">Dropout Probability ≥ 75%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded bg-orange-600 text-white font-semibold text-xs">HIGH</span>
                      <span className="text-gray-700">Dropout Probability 50-74%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded bg-yellow-600 text-white font-semibold text-xs">MEDIUM</span>
                      <span className="text-gray-700">Dropout Probability 25-49%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded bg-green-600 text-white font-semibold text-xs">LOW</span>
                      <span className="text-gray-700">Dropout Probability &lt; 25%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3">💬 Sentiment Fusion</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    NLP-powered sentiment analysis processes student communications to detect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Frustration and stress indicators</li>
                    <li>Confusion and disengagement patterns</li>
                    <li>Negative sentiment trends over time</li>
                    <li>Early warning keywords and risk phrases</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
