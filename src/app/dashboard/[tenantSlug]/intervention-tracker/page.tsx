'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

interface Intervention {
  id: number;
  intervention_number: string;
  student_name: string;
  student_id: string;
  course_name: string;
  intervention_type: string;
  priority_level: string;
  status: string;
  action_description: string;
  action_taken_by: string;
  action_date: string;
  outcome_achieved: string;
  requires_followup: boolean;
  followup_date?: string;
  trigger_type: string;
  communication_method?: string;
  created_at: string;
}

interface WorkflowStep {
  id: number;
  step_number: number;
  step_name: string;
  status: string;
  completed_by?: string;
  completed_at?: string;
  duration_minutes?: number;
}

interface Rule {
  id: number;
  rule_number: string;
  rule_name: string;
  condition_type: string;
  intervention_type: string;
  is_active: boolean;
  priority: number;
  trigger_count: number;
}

export default function InterventionTrackerPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('tracker');
  const [loading, setLoading] = useState(false);

  // Form state for new intervention
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [interventionType, setInterventionType] = useState('academic_support');
  const [priorityLevel, setPriorityLevel] = useState('medium');
  const [actionDescription, setActionDescription] = useState('');
  const [actionTakenBy, setActionTakenBy] = useState('');
  const [communicationMethod, setCommunicationMethod] = useState('');

  // Interventions list
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalInterventions: 42,
    activeInterventions: 12,
    successRate: 87.5,
    followupRequired: 5
  });

  const handleCreateIntervention = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/intervention-tracker/interventions/create_intervention/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            student_name: studentName,
            course_id: courseId,
            course_name: courseName,
            intervention_type: interventionType,
            priority_level: priorityLevel,
            action_description: actionDescription,
            action_taken_by: actionTakenBy,
            communication_method: communicationMethod
          })
        }
      );
      const data = await response.json();
      setInterventions([data, ...interventions]);
      
      // Reset form
      setStudentId('');
      setStudentName('');
      setCourseId('');
      setCourseName('');
      setActionDescription('');
      setCommunicationMethod('');
    } catch (error) {
      console.error('Error creating intervention:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800 border-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      urgent: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      initiated: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      escalated: 'bg-red-500',
      closed: 'bg-gray-500',
      cancelled: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getOutcomeIcon = (outcome: string) => {
    const icons: Record<string, string> = {
      successful: '✅',
      partial: '⚠️',
      unsuccessful: '❌',
      pending: '⏳',
      not_applicable: '➖'
    };
    return icons[outcome] || '❔';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <span className="text-4xl">📋</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Intervention Tracker</h1>
            <p className="text-lg text-gray-600 mt-1">
              Record trainer actions & outcomes • Workflow + rule engine • Documented learner support for audit
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Total Interventions</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalInterventions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.activeInterventions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.successRate}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-600">Follow-up Required</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.followupRequired}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2 mb-6">
          {['tracker', 'workflow', 'rules', 'outcomes', 'audit'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'tracker' && '📋 Tracker'}
              {tab === 'workflow' && '🔄 Workflow'}
              {tab === 'rules' && '⚙️ Rules Engine'}
              {tab === 'outcomes' && '📊 Outcomes'}
              {tab === 'audit' && '📜 Audit Trail'}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            {/* Tab: Tracker */}
            {activeTab === 'tracker' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-6 border border-blue-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📋 Intervention Recording</h3>
                  <p className="text-sm text-gray-700">
                    Document all trainer actions and student support activities. Each intervention is tracked for compliance and audit purposes.
                  </p>
                </div>

                {/* Create New Intervention Form */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">📝 Record New Intervention</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="e.g., STU001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g., Alex Johnson"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
                      <input
                        type="text"
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        placeholder="e.g., COURSE001"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                      <input
                        type="text"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        placeholder="e.g., Data Science 101"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Intervention Type *</label>
                      <select
                        value={interventionType}
                        onChange={(e) => setInterventionType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="academic_support">Academic Support</option>
                        <option value="attendance_followup">Attendance Follow-up</option>
                        <option value="wellbeing_check">Wellbeing Check</option>
                        <option value="behaviour_management">Behaviour Management</option>
                        <option value="career_guidance">Career Guidance</option>
                        <option value="extension_approval">Extension Approval</option>
                        <option value="special_consideration">Special Consideration</option>
                        <option value="re_engagement">Re-engagement</option>
                        <option value="progress_review">Progress Review</option>
                        <option value="referral">Referral to Services</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                      <select
                        value={priorityLevel}
                        onChange={(e) => setPriorityLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken By *</label>
                      <input
                        type="text"
                        value={actionTakenBy}
                        onChange={(e) => setActionTakenBy(e.target.value)}
                        placeholder="e.g., Sarah Smith (Trainer)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Communication Method</label>
                      <select
                        value={communicationMethod}
                        onChange={(e) => setCommunicationMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select method...</option>
                        <option value="face_to_face">Face to Face</option>
                        <option value="phone_call">Phone Call</option>
                        <option value="email">Email</option>
                        <option value="video_call">Video Call</option>
                        <option value="sms">SMS</option>
                        <option value="written_note">Written Note</option>
                        <option value="lms_message">LMS Message</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Description *</label>
                      <textarea
                        value={actionDescription}
                        onChange={(e) => setActionDescription(e.target.value)}
                        placeholder="Describe the intervention action taken, including details relevant for audit..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleCreateIntervention}
                    disabled={loading || !studentId || !studentName || !actionDescription || !actionTakenBy}
                    className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {loading ? '⏳ Recording...' : '📋 Record Intervention'}
                  </button>
                </div>

                {/* Recent Interventions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">📑 Recent Interventions</h4>
                  <div className="space-y-3">
                    {[
                      { number: 'INT-20241024-A1B2C3D4', student: 'Alex Johnson', type: 'Academic Support', priority: 'high', status: 'in_progress', outcome: 'pending', trainer: 'Sarah Smith', date: '2024-10-24' },
                      { number: 'INT-20241023-E5F6G7H8', student: 'Jamie Lee', type: 'Attendance Follow-up', priority: 'urgent', status: 'completed', outcome: 'successful', trainer: 'Mike Brown', date: '2024-10-23' },
                      { number: 'INT-20241023-I9J0K1L2', student: 'Pat Wilson', type: 'Wellbeing Check', priority: 'medium', status: 'completed', outcome: 'partial', trainer: 'Sarah Smith', date: '2024-10-23' },
                      { number: 'INT-20241022-M3N4O5P6', student: 'Taylor Davis', type: 'Progress Review', priority: 'low', status: 'closed', outcome: 'successful', trainer: 'Chris Green', date: '2024-10-22' }
                    ].map((intervention, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{intervention.number}</p>
                              <p className="text-sm text-gray-600">{intervention.student} • {intervention.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getPriorityColor(intervention.priority)}`}>
                              {intervention.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-gray-600">👤 {intervention.trainer}</span>
                            <span className="text-gray-600">📅 {intervention.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(intervention.status)}`}></div>
                              <span className="text-xs font-medium text-gray-700">{intervention.status.replace('_', ' ')}</span>
                            </div>
                            <span className="text-lg">{getOutcomeIcon(intervention.outcome)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Workflow */}
            {activeTab === 'workflow' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 border border-purple-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🔄 Intervention Workflows</h3>
                  <p className="text-sm text-gray-700">
                    Structured multi-step processes ensure consistent intervention delivery and comprehensive documentation.
                  </p>
                </div>

                {/* Example Workflow */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">WF-20241024-ABC123 - Academic Support Standard</h4>
                      <p className="text-sm text-gray-600">5-step process for academic intervention</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { step: 1, name: 'Initial Assessment', status: 'completed', duration: 15, required: true },
                      { step: 2, name: 'Identify Learning Gaps', status: 'completed', duration: 20, required: true },
                      { step: 3, name: 'Create Action Plan', status: 'in_progress', duration: null, required: true },
                      { step: 4, name: 'Implement Support', status: 'pending', duration: null, required: true },
                      { step: 5, name: 'Follow-up Review', status: 'pending', duration: null, required: false }
                    ].map((step) => (
                      <div key={step.step} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {step.name}
                            {step.required && <span className="ml-2 text-red-500">*</span>}
                          </p>
                          {step.duration && (
                            <p className="text-xs text-gray-500">Completed in {step.duration} minutes</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {step.status === 'completed' && <span className="text-green-600 text-xl">✅</span>}
                          {step.status === 'in_progress' && <span className="text-yellow-600 text-xl">🔄</span>}
                          {step.status === 'pending' && <span className="text-gray-400 text-xl">⏳</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700">📋 Required Documentation:</p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      <li>• Student assessment notes</li>
                      <li>• Action plan document</li>
                      <li>• Progress tracking sheet</li>
                      <li>• Follow-up schedule</li>
                    </ul>
                  </div>
                </div>

                {/* Other Workflows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Attendance Intervention', steps: 4, type: 'attendance_followup', used: 23 },
                    { name: 'Wellbeing Support', steps: 6, type: 'wellbeing_check', used: 15 },
                    { name: 'Referral Process', steps: 7, type: 'referral', used: 8 },
                    { name: 'Extension Approval', steps: 3, type: 'extension_approval', used: 34 }
                  ].map((workflow, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h5 className="font-semibold text-gray-900">{workflow.name}</h5>
                      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                        <span>{workflow.steps} steps</span>
                        <span>Used {workflow.used} times</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Rules Engine */}
            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-6 border border-green-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Automated Rule Engine</h3>
                  <p className="text-sm text-gray-700">
                    Rules automatically trigger interventions when student metrics meet specified conditions. Ensures timely support and compliance.
                  </p>
                </div>

                {/* Active Rules */}
                <div className="space-y-4">
                  {[
                    { rule: 'RULE-20241024-ABC', name: 'Low Attendance Alert', condition: 'Attendance < 75%', type: 'Attendance Follow-up', priority: 8, triggers: 12, active: true },
                    { rule: 'RULE-20241024-DEF', name: 'Failing Grade Intervention', condition: 'Grade < 50%', type: 'Academic Support', priority: 10, triggers: 5, active: true },
                    { rule: 'RULE-20241024-GHI', name: 'Low Engagement Alert', condition: 'Engagement < 60%', type: 'Re-engagement', priority: 6, triggers: 8, active: true },
                    { rule: 'RULE-20241024-JKL', name: 'High Risk Score', condition: 'Risk Score > 70%', type: 'Wellbeing Check', priority: 9, triggers: 3, active: true },
                    { rule: 'RULE-20241024-MNO', name: 'Multiple Late Submissions', condition: '3+ late submissions', type: 'Progress Review', priority: 5, triggers: 15, active: false }
                  ].map((rule, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {rule.priority}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{rule.name}</p>
                            <p className="text-xs text-gray-500">{rule.rule}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {rule.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Condition</p>
                          <p className="font-medium text-gray-900">{rule.condition}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Triggers</p>
                          <p className="font-medium text-gray-900">{rule.type}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Activated</p>
                          <p className="font-medium text-gray-900">{rule.triggers} times</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">💡 How Rules Work</h5>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Rules continuously evaluate student metrics against defined thresholds</li>
                    <li>• When conditions are met, interventions are automatically created</li>
                    <li>• Staff are notified immediately for timely action</li>
                    <li>• All rule activations are logged for compliance auditing</li>
                    <li>• Priority levels determine which rules are evaluated first</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Outcomes */}
            {activeTab === 'outcomes' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-6 border border-orange-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Intervention Outcomes</h3>
                  <p className="text-sm text-gray-700">
                    Track measurable improvements and impact. Evidence-based analysis of intervention effectiveness.
                  </p>
                </div>

                {/* Outcome Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h5 className="font-semibold text-gray-900 mb-4">📈 Attendance Improvement</h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Baseline</p>
                        <p className="text-2xl font-bold text-gray-900">62%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Target</p>
                        <p className="text-2xl font-bold text-blue-600">80%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-2xl font-bold text-green-600">85%</p>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm font-semibold text-green-600">+37% improvement ✅</p>
                        <p className="text-xs text-gray-500 mt-1">Target achieved</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h5 className="font-semibold text-gray-900 mb-4">📚 Grade Improvement</h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Baseline</p>
                        <p className="text-2xl font-bold text-gray-900">45%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Target</p>
                        <p className="text-2xl font-bold text-blue-600">60%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-2xl font-bold text-yellow-600">57%</p>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm font-semibold text-yellow-600">+27% improvement ⚠️</p>
                        <p className="text-xs text-gray-500 mt-1">Partially achieved</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h5 className="font-semibold text-gray-900 mb-4">💪 Engagement Increase</h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">Baseline</p>
                        <p className="text-2xl font-bold text-gray-900">55%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Target</p>
                        <p className="text-2xl font-bold text-blue-600">75%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Actual</p>
                        <p className="text-2xl font-bold text-green-600">78%</p>
                      </div>
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm font-semibold text-green-600">+42% improvement ✅</p>
                        <p className="text-xs text-gray-500 mt-1">Target exceeded</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Analysis */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">📊 Impact Analysis</h5>
                  <div className="space-y-3">
                    {[
                      { type: 'Attendance Improvement', interventions: 12, significant: 8, moderate: 3, minimal: 1 },
                      { type: 'Grade Improvement', interventions: 8, significant: 5, moderate: 2, minimal: 1 },
                      { type: 'Engagement Increase', interventions: 10, significant: 6, moderate: 3, minimal: 1 },
                      { type: 'Behaviour Change', interventions: 5, significant: 4, moderate: 1, minimal: 0 }
                    ].map((metric, index) => (
                      <div key={index} className="pb-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{metric.type}</p>
                          <p className="text-sm text-gray-600">{metric.interventions} interventions</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-green-100 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-600">Significant</p>
                            <p className="text-lg font-bold text-green-700">{metric.significant}</p>
                          </div>
                          <div className="flex-1 bg-yellow-100 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-600">Moderate</p>
                            <p className="text-lg font-bold text-yellow-700">{metric.moderate}</p>
                          </div>
                          <div className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
                            <p className="text-xs text-gray-600">Minimal</p>
                            <p className="text-lg font-bold text-gray-700">{metric.minimal}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Audit Trail */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-lg p-6 border border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📜 Comprehensive Audit Trail</h3>
                  <p className="text-sm text-gray-700">
                    Complete documentation of all actions for compliance reporting. Every intervention, workflow step, and outcome change is logged.
                  </p>
                </div>

                {/* Audit Log */}
                <div className="space-y-2">
                  {[
                    { log: 'LOG-20241024143025-ABC', action: 'Intervention Created', intervention: 'INT-20241024-A1B2C3D4', user: 'Sarah Smith', role: 'Trainer', time: '2024-10-24 14:30:25', details: 'Academic Support intervention created for Alex Johnson' },
                    { log: 'LOG-20241024143532-DEF', action: 'Workflow Step Completed', intervention: 'INT-20241024-A1B2C3D4', user: 'Sarah Smith', role: 'Trainer', time: '2024-10-24 14:35:32', details: 'Step 1: Initial Assessment - completed' },
                    { log: 'LOG-20241024144120-GHI', action: 'Status Changed', intervention: 'INT-20241024-A1B2C3D4', user: 'Sarah Smith', role: 'Trainer', time: '2024-10-24 14:41:20', details: 'Status changed from initiated to in_progress' },
                    { log: 'LOG-20241024150015-JKL', action: 'Outcome Recorded', intervention: 'INT-20241023-E5F6G7H8', user: 'Mike Brown', role: 'Trainer', time: '2024-10-24 15:00:15', details: 'Attendance improvement: 85% (target achieved)' },
                    { log: 'LOG-20241024151245-MNO', action: 'Document Attached', intervention: 'INT-20241023-E5F6G7H8', user: 'Mike Brown', role: 'Trainer', time: '2024-10-24 15:12:45', details: 'Student action plan document uploaded' },
                    { log: 'LOG-20241024152530-PQR', action: 'Notification Sent', intervention: 'INT-20241024-A1B2C3D4', user: 'System', role: 'Automated', time: '2024-10-24 15:25:30', details: 'Follow-up reminder sent to trainer' }
                  ].map((log, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {log.action === 'Intervention Created' && <span className="text-2xl">➕</span>}
                            {log.action === 'Workflow Step Completed' && <span className="text-2xl">✅</span>}
                            {log.action === 'Status Changed' && <span className="text-2xl">🔄</span>}
                            {log.action === 'Outcome Recorded' && <span className="text-2xl">📊</span>}
                            {log.action === 'Document Attached' && <span className="text-2xl">📎</span>}
                            {log.action === 'Notification Sent' && <span className="text-2xl">📧</span>}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{log.action}</p>
                            <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <span>🆔 {log.log}</span>
                          <span>📋 {log.intervention}</span>
                          <span>👤 {log.user} ({log.role})</span>
                        </div>
                        <span>🕐 {log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">📋 Audit Report Features</h5>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Complete action history with timestamps and user attribution</li>
                    <li>• IP address and user agent tracking for security</li>
                    <li>• Before/after value tracking for all changes</li>
                    <li>• Compliance category tagging (e.g., ASQA, ISO standards)</li>
                    <li>• Exportable reports for external audits</li>
                    <li>• Tamper-proof logging ensures data integrity</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
