'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Types
interface ImprovementAction {
  id: number;
  action_number: string;
  title: string;
  description: string;
  category_name: string | null;
  priority: string;
  priority_display: string;
  status: string;
  status_display: string;
  source: string;
  source_display: string;
  compliance_status: string;
  compliance_status_display: string;
  ai_summary: string;
  ai_keywords: string[];
  ai_classified_category: string;
  ai_classification_confidence: number;
  ai_related_standards: string[];
  identified_date: string;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  responsible_person_name: string | null;
  is_overdue: boolean;
  days_until_due: number | null;
  progress_percentage: number;
  is_critical_compliance: boolean;
  tracking_updates_count: number;
  created_at: string;
}

interface DashboardStats {
  total_actions: number;
  by_status: { [key: string]: number };
  by_priority: { [key: string]: number };
  by_compliance: { [key: string]: number };
  overdue_count: number;
  at_risk_count: number;
  completion_rate: number;
  avg_days_to_complete: number;
  critical_compliance_count: number;
  recent_completions: number;
}

interface ActionTracking {
  id: number;
  update_type: string;
  update_type_display: string;
  update_text: string;
  progress_percentage: number | null;
  created_at: string;
  created_by_name: string | null;
}

export default function ContinuousImprovementPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState<'dashboard' | 'actions' | 'compliance'>('dashboard');
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedAction, setSelectedAction] = useState<ImprovementAction | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAIClassifyModal, setShowAIClassifyModal] = useState(false);

  // Form state
  const [newAction, setNewAction] = useState({
    action_number: '',
    title: '',
    description: '',
    priority: 'medium',
    source: 'self_assessment',
    target_completion_date: '',
    is_critical_compliance: false,
  });

  // AI Classification result
  const [aiClassification, setAIClassification] = useState<any>(null);
  const [classifying, setClassifying] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    compliance: 'all',
  });

  // Mock data
  useEffect(() => {
    // Mock actions
    setActions([
      {
        id: 1,
        action_number: 'CI-2024-001',
        title: 'Improve trainer qualification verification process',
        description:
          'Implement automated verification system for trainer qualifications against ASQA requirements including TAE40116 and industry experience validation.',
        category_name: 'Trainer & Assessor Qualifications',
        priority: 'critical',
        priority_display: 'Critical',
        status: 'in_progress',
        status_display: 'In Progress',
        source: 'audit',
        source_display: 'Audit Finding',
        compliance_status: 'at_risk',
        compliance_status_display: 'At Risk',
        ai_summary:
          'Action focuses on automating trainer qualification verification. Key areas: automated, verification, trainer, qualifications, requirements.',
        ai_keywords: ['trainer', 'qualification', 'verification', 'automated', 'tae40116'],
        ai_classified_category: 'trainer_qualifications',
        ai_classification_confidence: 0.92,
        ai_related_standards: ['1.13', '1.14', '1.15'],
        identified_date: '2024-10-01',
        target_completion_date: '2024-10-31',
        actual_completion_date: null,
        responsible_person_name: 'Sarah Johnson',
        is_overdue: false,
        days_until_due: 7,
        progress_percentage: 50,
        is_critical_compliance: true,
        tracking_updates_count: 4,
        created_at: '2024-10-01T08:00:00Z',
      },
      {
        id: 2,
        action_number: 'CI-2024-002',
        title: 'Update assessment validation schedule',
        description:
          'Establish quarterly validation meetings with industry representatives to ensure assessment tools remain current and aligned with industry standards.',
        category_name: 'Training & Assessment',
        priority: 'high',
        priority_display: 'High',
        status: 'completed',
        status_display: 'Completed',
        source: 'self_assessment',
        source_display: 'Self Assessment',
        compliance_status: 'completed',
        compliance_status_display: 'Completed',
        ai_summary:
          'Quarterly validation meetings established. Key areas: quarterly, validation, assessment, industry, standards.',
        ai_keywords: ['assessment', 'validation', 'quarterly', 'industry', 'standards'],
        ai_classified_category: 'training_assessment',
        ai_classification_confidence: 0.88,
        ai_related_standards: ['1.8', '1.9'],
        identified_date: '2024-08-15',
        target_completion_date: '2024-09-30',
        actual_completion_date: '2024-09-28',
        responsible_person_name: 'Michael Chen',
        is_overdue: false,
        days_until_due: null,
        progress_percentage: 100,
        is_critical_compliance: false,
        tracking_updates_count: 6,
        created_at: '2024-08-15T09:00:00Z',
      },
      {
        id: 3,
        action_number: 'CI-2024-003',
        title: 'Implement student feedback survey system',
        description:
          'Deploy new online survey platform for collecting systematic student feedback on training delivery, facilities, and support services.',
        category_name: 'Quality Assurance',
        priority: 'medium',
        priority_display: 'Medium',
        status: 'planned',
        status_display: 'Planned',
        source: 'stakeholder_feedback',
        source_display: 'Stakeholder Feedback',
        compliance_status: 'compliant',
        compliance_status_display: 'Compliant',
        ai_summary:
          'Online feedback system for student input. Key areas: student, feedback, survey, delivery, facilities.',
        ai_keywords: ['student', 'feedback', 'survey', 'online', 'delivery'],
        ai_classified_category: 'quality_assurance',
        ai_classification_confidence: 0.85,
        ai_related_standards: ['2.1', '2.2'],
        identified_date: '2024-10-15',
        target_completion_date: '2024-11-30',
        actual_completion_date: null,
        responsible_person_name: 'Emma Davis',
        is_overdue: false,
        days_until_due: 37,
        progress_percentage: 25,
        is_critical_compliance: false,
        tracking_updates_count: 1,
        created_at: '2024-10-15T10:00:00Z',
      },
      {
        id: 4,
        action_number: 'CI-2024-004',
        title: 'Review and update marketing materials compliance',
        description:
          'Audit all marketing materials to ensure compliance with ASQA Standards for Registered Training Organisations 2015, particularly Standard 4.',
        category_name: 'Marketing & Recruitment',
        priority: 'high',
        priority_display: 'High',
        status: 'identified',
        status_display: 'Identified',
        source: 'regulator_feedback',
        source_display: 'Regulator Feedback',
        compliance_status: 'overdue',
        compliance_status_display: 'Overdue',
        ai_summary:
          'Marketing materials compliance audit required. Key areas: marketing, compliance, asqa, standard, materials.',
        ai_keywords: ['marketing', 'compliance', 'asqa', 'standard', 'audit'],
        ai_classified_category: 'marketing_recruitment',
        ai_classification_confidence: 0.9,
        ai_related_standards: ['4.1', '4.2'],
        identified_date: '2024-09-01',
        target_completion_date: '2024-10-15',
        actual_completion_date: null,
        responsible_person_name: null,
        is_overdue: true,
        days_until_due: -9,
        progress_percentage: 10,
        is_critical_compliance: true,
        tracking_updates_count: 0,
        created_at: '2024-09-01T11:00:00Z',
      },
    ]);

    // Mock stats
    setStats({
      total_actions: 12,
      by_status: {
        identified: 3,
        planned: 2,
        in_progress: 4,
        completed: 3,
      },
      by_priority: {
        critical: 2,
        high: 4,
        medium: 5,
        low: 1,
      },
      by_compliance: {
        compliant: 7,
        at_risk: 2,
        overdue: 3,
      },
      overdue_count: 3,
      at_risk_count: 2,
      completion_rate: 25.0,
      avg_days_to_complete: 28.5,
      critical_compliance_count: 4,
      recent_completions: 2,
    });
  }, []);

  const handleAddAction = () => {
    setClassifying(true);
    // Simulate AI classification
    setTimeout(() => {
      const mockClassification = {
        category: 'training_assessment',
        confidence: 0.87,
        summary: `${newAction.description.substring(0, 150)}...\n\nKey areas: training, assessment, improvement`,
        keywords: ['training', 'assessment', 'improvement', 'quality'],
        related_standards: ['1.8', '1.9'],
      };
      setAIClassification(mockClassification);
      setClassifying(false);
      setShowAIClassifyModal(true);
    }, 1500);
  };

  const confirmAddAction = () => {
    const action: ImprovementAction = {
      id: actions.length + 1,
      action_number: newAction.action_number,
      title: newAction.title,
      description: newAction.description,
      category_name: null,
      priority: newAction.priority,
      priority_display: newAction.priority.charAt(0).toUpperCase() + newAction.priority.slice(1),
      status: 'identified',
      status_display: 'Identified',
      source: newAction.source,
      source_display: newAction.source.replace('_', ' '),
      compliance_status: 'compliant',
      compliance_status_display: 'Compliant',
      ai_summary: aiClassification?.summary || '',
      ai_keywords: aiClassification?.keywords || [],
      ai_classified_category: aiClassification?.category || '',
      ai_classification_confidence: aiClassification?.confidence || 0,
      ai_related_standards: aiClassification?.related_standards || [],
      identified_date: new Date().toISOString().split('T')[0],
      target_completion_date: newAction.target_completion_date,
      actual_completion_date: null,
      responsible_person_name: null,
      is_overdue: false,
      days_until_due: null,
      progress_percentage: 10,
      is_critical_compliance: newAction.is_critical_compliance,
      tracking_updates_count: 0,
      created_at: new Date().toISOString(),
    };

    setActions([action, ...actions]);
    setShowAIClassifyModal(false);
    setShowAddModal(false);
    setNewAction({
      action_number: '',
      title: '',
      description: '',
      priority: 'medium',
      source: 'self_assessment',
      target_completion_date: '',
      is_critical_compliance: false,
    });
    setAIClassification(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-purple-100 text-purple-800';
      case 'identified':
        return 'bg-gray-100 text-gray-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActions = actions.filter(action => {
    if (filters.status !== 'all' && action.status !== filters.status) return false;
    if (filters.priority !== 'all' && action.priority !== filters.priority) return false;
    if (filters.compliance !== 'all' && action.compliance_status !== filters.compliance)
      return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Continuous Improvement Register</h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-600 to-teal-600 text-white">
              🤖 AI Classified
            </span>
          </div>
          <p className="text-gray-600">
            Track improvement actions with AI classification and real-time compliance monitoring
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'actions'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Actions ({actions.length})
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'compliance'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Compliance Tracking
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <div className="text-3xl font-bold text-gray-900">{stats.total_actions}</div>
                <div className="text-sm text-gray-600 mt-1">Total Actions</div>
                <div className="text-xs text-green-600 mt-2">
                  {stats.recent_completions} completed this month
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="text-3xl font-bold text-gray-900">{stats.completion_rate}%</div>
                <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
                <div className="text-xs text-blue-600 mt-2">
                  Avg {stats.avg_days_to_complete} days to complete
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <div className="text-3xl font-bold text-gray-900">{stats.at_risk_count}</div>
                <div className="text-sm text-gray-600 mt-1">At Risk</div>
                <div className="text-xs text-yellow-600 mt-2">Due within 7 days</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <div className="text-3xl font-bold text-gray-900">{stats.overdue_count}</div>
                <div className="text-sm text-gray-600 mt-1">Overdue</div>
                <div className="text-xs text-red-600 mt-2">
                  {stats.critical_compliance_count} critical compliance
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Status Breakdown */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(stats.by_status).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status === 'completed'
                                ? 'bg-green-500'
                                : status === 'in_progress'
                                  ? 'bg-blue-500'
                                  : status === 'planned'
                                    ? 'bg-purple-500'
                                    : 'bg-gray-400'
                            }`}
                            style={{ width: `${(count / stats.total_actions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
                <div className="space-y-3">
                  {Object.entries(stats.by_priority).map(([priority, count]) => (
                    <div key={priority} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{priority}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              priority === 'critical'
                                ? 'bg-red-500'
                                : priority === 'high'
                                  ? 'bg-orange-500'
                                  : priority === 'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                            }`}
                            style={{ width: `${(count / stats.total_actions) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Alerts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔴 Real-time Compliance Alerts
              </h3>
              <div className="space-y-3">
                {actions
                  .filter(a => a.is_overdue && a.is_critical_compliance)
                  .map(action => (
                    <div
                      key={action.id}
                      className="border-l-4 border-red-500 bg-red-50 p-4 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-red-900">
                            {action.action_number} - {action.title}
                          </h4>
                          <p className="text-sm text-red-700 mt-1">
                            Critical compliance action overdue by{' '}
                            {Math.abs(action.days_until_due || 0)} days
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
                          CRITICAL
                        </span>
                      </div>
                    </div>
                  ))}
                {actions
                  .filter(a => a.compliance_status === 'at_risk')
                  .map(action => (
                    <div
                      key={action.id}
                      className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-yellow-900">
                            {action.action_number} - {action.title}
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Due in {action.days_until_due} days - requires attention
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                          AT RISK
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                <select
                  value={filters.status}
                  onChange={e => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="identified">Identified</option>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={e => setFilters({ ...filters, priority: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={filters.compliance}
                  onChange={e => setFilters({ ...filters, compliance: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">All Compliance</option>
                  <option value="compliant">Compliant</option>
                  <option value="at_risk">At Risk</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all shadow-md"
              >
                ➕ Add Action
              </button>
            </div>

            {/* Actions List */}
            <div className="space-y-4">
              {filteredActions.map(action => (
                <div
                  key={action.id}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    action.compliance_status === 'overdue'
                      ? 'border-red-500'
                      : action.compliance_status === 'at_risk'
                        ? 'border-yellow-500'
                        : 'border-green-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {action.action_number} - {action.title}
                        </h3>
                        {action.is_critical_compliance && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            CRITICAL COMPLIANCE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>

                      {/* AI Summary */}
                      {action.ai_summary && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                          <div className="flex items-start gap-2">
                            <span className="text-green-600">🤖</span>
                            <div className="flex-1">
                              <div className="text-xs font-medium text-green-900 mb-1">
                                AI Classification (
                                {Math.round(action.ai_classification_confidence * 100)}% confidence)
                              </div>
                              <div className="text-sm text-green-800">
                                {action.ai_summary.split('\n')[0]}
                              </div>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {action.ai_keywords.slice(0, 5).map((kw, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 rounded text-xs bg-green-100 text-green-700"
                                  >
                                    {kw}
                                  </span>
                                ))}
                                {action.ai_related_standards.length > 0 && (
                                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                                    Standards: {action.ai_related_standards.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}
                      >
                        {action.status_display}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(action.priority)}`}
                      >
                        {action.priority_display}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(action.compliance_status)}`}
                      >
                        {action.compliance_status_display}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Source:</span>
                      <span className="ml-2 font-medium">{action.source_display}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Responsible:</span>
                      <span className="ml-2 font-medium">
                        {action.responsible_person_name || 'Unassigned'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Target Date:</span>
                      <span className="ml-2 font-medium">
                        {action.target_completion_date
                          ? new Date(action.target_completion_date).toLocaleDateString()
                          : 'Not set'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Progress:</span>
                      <span className="ml-2 font-medium">{action.progress_percentage}%</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-600 to-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${action.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedAction(action);
                        setShowDetailModal(true);
                      }}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
                      Add Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && stats && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-green-600">
                    {Math.round(((stats.by_compliance.compliant || 0) / stats.total_actions) * 100)}
                    %
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Compliant Actions</div>
                </div>
                <div className="text-xs text-center text-gray-500">
                  {stats.by_compliance.compliant || 0} of {stats.total_actions} actions on track
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-yellow-600">{stats.at_risk_count}</div>
                  <div className="text-sm text-gray-600 mt-2">At Risk</div>
                </div>
                <div className="text-xs text-center text-gray-500">
                  Due within 7 days - requires monitoring
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-4">
                  <div className="text-5xl font-bold text-red-600">{stats.overdue_count}</div>
                  <div className="text-sm text-gray-600 mt-2">Overdue</div>
                </div>
                <div className="text-xs text-center text-gray-500">Immediate action required</div>
              </div>
            </div>

            {/* Compliance Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Timeline</h3>
              <div className="space-y-4">
                {actions
                  .filter(a => a.compliance_status !== 'completed')
                  .sort((a, b) => {
                    if (!a.days_until_due) return 1;
                    if (!b.days_until_due) return -1;
                    return a.days_until_due - b.days_until_due;
                  })
                  .map(action => (
                    <div key={action.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            action.is_overdue
                              ? 'bg-red-100 text-red-600'
                              : action.compliance_status === 'at_risk'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {action.days_until_due !== null
                            ? action.is_overdue
                              ? `-${Math.abs(action.days_until_due)}`
                              : action.days_until_due
                            : '?'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {action.action_number} - {action.title}
                        </h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {action.responsible_person_name &&
                            `Assigned to: ${action.responsible_person_name} • `}
                          Target:{' '}
                          {action.target_completion_date
                            ? new Date(action.target_completion_date).toLocaleDateString()
                            : 'Not set'}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getComplianceColor(action.compliance_status)}`}
                        >
                          {action.compliance_status_display}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Action Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Add Improvement Action</h2>
                <p className="text-gray-600">AI will classify and summarize your action</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action Number
                    </label>
                    <input
                      type="text"
                      value={newAction.action_number}
                      onChange={e => setNewAction({ ...newAction, action_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="CI-2024-005"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={newAction.target_completion_date}
                      onChange={e =>
                        setNewAction({ ...newAction, target_completion_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newAction.title}
                    onChange={e => setNewAction({ ...newAction, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Brief description of the improvement"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newAction.description}
                    onChange={e => setNewAction({ ...newAction, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={5}
                    placeholder="Detailed description of the improvement action, including context and expected outcomes..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={newAction.priority}
                      onChange={e => setNewAction({ ...newAction, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <select
                      value={newAction.source}
                      onChange={e => setNewAction({ ...newAction, source: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="audit">Audit Finding</option>
                      <option value="complaint">Complaint</option>
                      <option value="feedback">Stakeholder Feedback</option>
                      <option value="self_assessment">Self Assessment</option>
                      <option value="staff_suggestion">Staff Suggestion</option>
                      <option value="student_feedback">Student Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newAction.is_critical_compliance}
                    onChange={e =>
                      setNewAction({ ...newAction, is_critical_compliance: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">Critical for RTO compliance</label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={classifying}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAction}
                  disabled={classifying || !newAction.title || !newAction.description}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {classifying ? '🤖 Classifying with AI...' : 'Classify & Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Classification Result Modal */}
        {showAIClassifyModal && aiClassification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">AI Classification Complete</h2>
                <p className="text-gray-600">Review the AI analysis before adding</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="font-semibold text-green-900">
                        Category: {aiClassification.category.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-green-700">
                        Confidence: {Math.round(aiClassification.confidence * 100)}%
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-green-800 mb-3">
                    <strong>Summary:</strong>
                    <p className="mt-1">{aiClassification.summary}</p>
                  </div>

                  <div className="mb-3">
                    <strong className="text-sm text-green-900">Keywords:</strong>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {aiClassification.keywords.map((kw: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {aiClassification.related_standards.length > 0 && (
                    <div>
                      <strong className="text-sm text-green-900">Related ASQA Standards:</strong>
                      <div className="flex gap-2 mt-2">
                        {aiClassification.related_standards.map((std: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium"
                          >
                            Standard {std}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowAIClassifyModal(false);
                    setAIClassification(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAddAction}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-teal-700 transition-all"
                >
                  Confirm & Add Action
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Detail Modal */}
        {showDetailModal && selectedAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{selectedAction.action_number}</h2>
                <p className="text-gray-600">{selectedAction.title}</p>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{selectedAction.description}</p>
                  </div>

                  {selectedAction.ai_summary && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-900 mb-2">🤖 AI Analysis</h3>
                      <p className="text-sm text-green-800 mb-3">{selectedAction.ai_summary}</p>
                      <div className="flex gap-2 flex-wrap">
                        {selectedAction.ai_keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded text-xs bg-green-100 text-green-700"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAction.status)}`}
                      >
                        {selectedAction.status_display}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Compliance</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(selectedAction.compliance_status)}`}
                      >
                        {selectedAction.compliance_status_display}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAction(null);
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
