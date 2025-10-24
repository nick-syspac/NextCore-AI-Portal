'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface TrainerQualification {
  id: number;
  qualification_id: string;
  trainer_id: string;
  trainer_name: string;
  qualification_code: string;
  qualification_name: string;
  qualification_type: string;
  verification_status: string;
  date_obtained: string;
  expiry_date: string;
  industry_experience_years: number;
}

interface UnitOfCompetency {
  id: number;
  unit_id: string;
  unit_code: string;
  unit_name: string;
  unit_type: string;
  qualification_code: string;
  requires_tae: boolean;
  requires_industry_currency: boolean;
  required_industry_experience: number;
}

interface TrainerAssignment {
  id: number;
  assignment_id: string;
  trainer_id: string;
  trainer_name: string;
  unit: UnitOfCompetency;
  assignment_status: string;
  meets_requirements: boolean;
  compliance_score: number;
  gaps_identified: string[];
  assigned_date: string;
}

interface CompetencyGap {
  id: number;
  gap_id: string;
  trainer_id: string;
  trainer_name: string;
  gap_type: string;
  gap_severity: string;
  gap_description: string;
  recommended_action: string;
  is_resolved: boolean;
}

interface DashboardStats {
  total_trainers: number;
  total_qualifications: number;
  verified_qualifications: number;
  expired_qualifications: number;
  total_units: number;
  core_units: number;
  elective_units: number;
  total_assignments: number;
  approved_assignments: number;
  pending_assignments: number;
  total_gaps: number;
  critical_gaps: number;
  high_gaps: number;
  unresolved_gaps: number;
  overall_compliance_score: number;
  compliance_checks_this_month: number;
}

export default function CompetencyGapPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [qualifications, setQualifications] = useState<TrainerQualification[]>([]);
  const [units, setUnits] = useState<UnitOfCompetency[]>([]);
  const [assignments, setAssignments] = useState<TrainerAssignment[]>([]);
  const [gaps, setGaps] = useState<CompetencyGap[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Form states
  const [qualificationForm, setQualificationForm] = useState({
    trainer_id: 'trainer-001',
    trainer_name: '',
    qualification_type: 'certificate_iv',
    qualification_code: '',
    qualification_name: '',
    issuing_organization: '',
    date_obtained: '',
    industry_experience_years: 0
  });

  const [unitForm, setUnitForm] = useState({
    unit_code: '',
    unit_name: '',
    unit_type: 'core',
    qualification_code: '',
    requires_tae: true,
    requires_industry_currency: true,
    required_industry_experience: 0
  });

  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [validating, setValidating] = useState(false);

  // Load data
  useEffect(() => {
    loadDashboard();
    loadQualifications();
    loadUnits();
    loadAssignments();
    loadGaps();
  }, [tenantSlug]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/competency-gap/qualifications/dashboard/?tenant=${tenantSlug}`);
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQualifications = async () => {
    try {
      const response = await fetch(`/api/competency-gap/qualifications/?tenant=${tenantSlug}`);
      const data = await response.json();
      setQualifications(data);
    } catch (error) {
      console.error('Failed to load qualifications:', error);
    }
  };

  const loadUnits = async () => {
    try {
      const response = await fetch(`/api/competency-gap/units/?tenant=${tenantSlug}`);
      const data = await response.json();
      setUnits(data);
    } catch (error) {
      console.error('Failed to load units:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch(`/api/competency-gap/assignments/?tenant=${tenantSlug}`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    }
  };

  const loadGaps = async () => {
    try {
      const response = await fetch(`/api/competency-gap/gaps/?tenant=${tenantSlug}&is_resolved=false`);
      const data = await response.json();
      setGaps(data);
    } catch (error) {
      console.error('Failed to load gaps:', error);
    }
  };

  const handleCreateQualification = async () => {
    try {
      const response = await fetch('/api/competency-gap/qualifications/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          ...qualificationForm,
          verification_status: 'verified',
          competency_areas: [],
          units_covered: []
        })
      });

      if (response.ok) {
        alert('Qualification added successfully!');
        loadQualifications();
        loadDashboard();
        setQualificationForm({
          ...qualificationForm,
          trainer_name: '',
          qualification_code: '',
          qualification_name: '',
          issuing_organization: '',
          date_obtained: '',
          industry_experience_years: 0
        });
      }
    } catch (error) {
      console.error('Failed to create qualification:', error);
      alert('Failed to create qualification');
    }
  };

  const handleCreateUnit = async () => {
    try {
      const response = await fetch('/api/competency-gap/units/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          ...unitForm,
          required_qualifications: [],
          required_competency_areas: [],
          learning_outcomes: [],
          assessment_methods: [],
          technical_skills: []
        })
      });

      if (response.ok) {
        alert('Unit created successfully!');
        loadUnits();
        loadDashboard();
        setUnitForm({
          unit_code: '',
          unit_name: '',
          unit_type: 'core',
          qualification_code: '',
          requires_tae: true,
          requires_industry_currency: true,
          required_industry_experience: 0
        });
      }
    } catch (error) {
      console.error('Failed to create unit:', error);
      alert('Failed to create unit');
    }
  };

  const handleCheckGaps = async () => {
    if (!selectedTrainer || !selectedUnit) {
      alert('Please select both a trainer and a unit');
      return;
    }

    try {
      setChecking(true);
      const response = await fetch('/api/competency-gap/qualifications/check-gaps/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: selectedTrainer,
          unit_id: selectedUnit
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Compliance Score: ${data.compliance_score.toFixed(1)}%\n\nGaps Found: ${data.gaps_found.length}\n\n${data.message}`);
        loadGaps();
      }
    } catch (error) {
      console.error('Failed to check gaps:', error);
      alert('Failed to check gaps');
    } finally {
      setChecking(false);
    }
  };

  const handleAssignTrainer = async () => {
    if (!selectedTrainer || !selectedUnit) {
      alert('Please select both a trainer and a unit');
      return;
    }

    try {
      const response = await fetch('/api/competency-gap/qualifications/assign-trainer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          trainer_id: selectedTrainer,
          unit_id: selectedUnit,
          check_compliance: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Assignment ${data.assignment_status}! Compliance: ${data.compliance_score.toFixed(1)}%`);
        loadAssignments();
        loadGaps();
        loadDashboard();
      }
    } catch (error) {
      console.error('Failed to assign trainer:', error);
      alert('Failed to assign trainer');
    }
  };

  const handleValidateMatrix = async () => {
    try {
      setValidating(true);
      const response = await fetch(`/api/competency-gap/qualifications/validate-matrix/?tenant=${tenantSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          check_type: 'full_matrix'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Matrix Validation Complete!\n\nCompliance: ${data.compliance_percentage.toFixed(1)}%\nTotal Assignments: ${data.total_assignments}\nCompliant: ${data.compliant_assignments}\nNon-Compliant: ${data.non_compliant_assignments}\nGaps Found: ${data.gaps_found}`);
        loadDashboard();
      }
    } catch (error) {
      console.error('Failed to validate matrix:', error);
      alert('Failed to validate matrix');
    } finally {
      setValidating(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      verified: 'bg-teal-100 text-teal-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      approved: 'bg-teal-100 text-teal-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTrainerNames = () => {
    const trainerMap = new Map<string, string>();
    qualifications.forEach(q => {
      if (!trainerMap.has(q.trainer_id)) {
        trainerMap.set(q.trainer_id, q.trainer_name);
      }
    });
    return Array.from(trainerMap.entries());
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading Competency Gap Finder...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📊</span>
          <h1 className="text-3xl font-bold text-gray-900">Competency Gap Finder</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800">
            Graph-Matching Model
          </span>
        </div>
        <p className="text-gray-600">Cross-check trainer quals vs units • Graph-matching model • Compliance for trainer matrix</p>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-teal-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Trainer Qualifications</div>
            <div className="text-2xl font-bold text-teal-600">{dashboardStats.total_qualifications}</div>
            <div className="text-xs text-gray-500 mt-1">{dashboardStats.verified_qualifications} verified</div>
          </div>
          
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Units of Competency</div>
            <div className="text-2xl font-bold text-blue-600">{dashboardStats.total_units}</div>
            <div className="text-xs text-gray-500 mt-1">{dashboardStats.core_units} core, {dashboardStats.elective_units} elective</div>
          </div>
          
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Assignments</div>
            <div className="text-2xl font-bold text-purple-600">{dashboardStats.total_assignments}</div>
            <div className="text-xs text-gray-500 mt-1">{dashboardStats.approved_assignments} approved</div>
          </div>
          
          <div className="bg-white border-2 border-orange-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Compliance Score</div>
            <div className="text-2xl font-bold text-orange-600">{dashboardStats.overall_compliance_score.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">{dashboardStats.unresolved_gaps} unresolved gaps</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4 overflow-x-auto">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'qualifications', label: '🎓 Qualifications' },
            { id: 'units', label: '📚 Units' },
            { id: 'check', label: '🔍 Check Gaps' },
            { id: 'assignments', label: '✅ Assignments' },
            { id: 'gaps', label: '⚠️ Gaps' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Compliance Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
                <h3 className="font-semibold text-gray-900 mb-4">Qualification Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Qualifications</span>
                    <span className="font-bold text-teal-600">{dashboardStats.total_qualifications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">✓ Verified</span>
                    <span className="font-bold text-green-600">{dashboardStats.verified_qualifications}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">⚠ Expired</span>
                    <span className="font-bold text-red-600">{dashboardStats.expired_qualifications}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-4">Gap Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Gaps</span>
                    <span className="font-bold text-orange-600">{dashboardStats.total_gaps}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">🔴 Critical</span>
                    <span className="font-bold text-red-600">{dashboardStats.critical_gaps}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">🟠 High Priority</span>
                    <span className="font-bold text-orange-600">{dashboardStats.high_gaps}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleValidateMatrix}
                  disabled={validating}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium disabled:opacity-50"
                >
                  {validating ? '🔄 Validating...' : '✓ Validate Matrix'}
                </button>
                <button
                  onClick={() => setActiveTab('check')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🔍 Check Gaps
                </button>
                <button
                  onClick={() => setActiveTab('gaps')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  ⚠️ View Gaps
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Qualifications Tab */}
        {activeTab === 'qualifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trainer Qualifications</h2>
            
            {/* Add Qualification Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Add Qualification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={qualificationForm.trainer_name}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, trainer_name: e.target.value })}
                  placeholder="Trainer Name"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <select
                  value={qualificationForm.qualification_type}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, qualification_type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="certificate_iii">Certificate III</option>
                  <option value="certificate_iv">Certificate IV</option>
                  <option value="diploma">Diploma</option>
                  <option value="tae_cert_iv">TAE Cert IV</option>
                  <option value="bachelor">Bachelor Degree</option>
                </select>
                <input
                  type="text"
                  value={qualificationForm.qualification_code}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, qualification_code: e.target.value })}
                  placeholder="Qualification Code (e.g., ICT40120)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  value={qualificationForm.qualification_name}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, qualification_name: e.target.value })}
                  placeholder="Qualification Name"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  value={qualificationForm.issuing_organization}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, issuing_organization: e.target.value })}
                  placeholder="Issuing Organization"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="date"
                  value={qualificationForm.date_obtained}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, date_obtained: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number"
                  value={qualificationForm.industry_experience_years}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, industry_experience_years: parseInt(e.target.value) })}
                  placeholder="Years of Experience"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={handleCreateQualification}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
              >
                ➕ Add Qualification
              </button>
            </div>

            {/* Qualifications List */}
            {qualifications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No qualifications recorded yet. Add your first qualification above.
              </div>
            ) : (
              <div className="space-y-4">
                {qualifications.map((qual) => (
                  <div key={qual.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{qual.trainer_name}</h3>
                        <p className="text-sm text-gray-600">{qual.qualification_code} • {qual.qualification_name}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(qual.verification_status)}`}>
                        {qual.verification_status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{qual.qualification_type.replace('_', ' ')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Obtained:</span>
                        <span className="ml-2 font-medium">{qual.date_obtained}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Experience:</span>
                        <span className="ml-2 font-medium">{qual.industry_experience_years} years</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Units Tab */}
        {activeTab === 'units' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Units of Competency</h2>
            
            {/* Add Unit Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Add Unit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={unitForm.unit_code}
                  onChange={(e) => setUnitForm({ ...unitForm, unit_code: e.target.value })}
                  placeholder="Unit Code (e.g., ICTICT418)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  value={unitForm.unit_name}
                  onChange={(e) => setUnitForm({ ...unitForm, unit_name: e.target.value })}
                  placeholder="Unit Name"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <select
                  value={unitForm.unit_type}
                  onChange={(e) => setUnitForm({ ...unitForm, unit_type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="core">Core Unit</option>
                  <option value="elective">Elective Unit</option>
                  <option value="prerequisite">Prerequisite</option>
                </select>
                <input
                  type="text"
                  value={unitForm.qualification_code}
                  onChange={(e) => setUnitForm({ ...unitForm, qualification_code: e.target.value })}
                  placeholder="Qualification Code (e.g., ICT40120)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number"
                  value={unitForm.required_industry_experience}
                  onChange={(e) => setUnitForm({ ...unitForm, required_industry_experience: parseInt(e.target.value) })}
                  placeholder="Required Experience (years)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={unitForm.requires_tae}
                      onChange={(e) => setUnitForm({ ...unitForm, requires_tae: e.target.checked })}
                      className="w-4 h-4 text-teal-600"
                    />
                    <span className="text-sm">Requires TAE</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={unitForm.requires_industry_currency}
                      onChange={(e) => setUnitForm({ ...unitForm, requires_industry_currency: e.target.checked })}
                      className="w-4 h-4 text-teal-600"
                    />
                    <span className="text-sm">Requires Currency</span>
                  </label>
                </div>
              </div>
              <button
                onClick={handleCreateUnit}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
              >
                ➕ Add Unit
              </button>
            </div>

            {/* Units List */}
            {units.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No units created yet. Add your first unit above.
              </div>
            ) : (
              <div className="space-y-4">
                {units.map((unit) => (
                  <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{unit.unit_code}</h3>
                        <p className="text-sm text-gray-600">{unit.unit_name}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {unit.unit_type}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-xs mb-2">
                      {unit.requires_tae && (
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded">
                          Requires TAE
                        </span>
                      )}
                      {unit.requires_industry_currency && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          Requires Currency
                        </span>
                      )}
                      {unit.required_industry_experience > 0 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">
                          {unit.required_industry_experience}+ years exp
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Qualification: {unit.qualification_code}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Check Gaps Tab */}
        {activeTab === 'check' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Check Competency Gaps</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Select a trainer and unit to analyze</li>
                <li>System cross-checks trainer qualifications against unit requirements</li>
                <li>Graph-matching algorithm identifies qualification coverage</li>
                <li>Generates compliance score and identifies gaps</li>
                <li>Provides recommendations for closing gaps</li>
              </ol>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Trainer</label>
                <select
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Select a trainer --</option>
                  {getTrainerNames().map(([id, name]) => (
                    <option key={id} value={id}>
                      {name} ({id})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Unit</label>
                <select
                  value={selectedUnit || ''}
                  onChange={(e) => setSelectedUnit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Select a unit --</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unit_code} - {unit.unit_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCheckGaps}
                disabled={!selectedTrainer || !selectedUnit || checking}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checking ? '🔄 Checking...' : '🔍 Check Gaps'}
              </button>
              
              <button
                onClick={handleAssignTrainer}
                disabled={!selectedTrainer || !selectedUnit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Assign Trainer
              </button>
            </div>
          </div>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trainer Assignments</h2>
            
            {assignments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No assignments yet. Use the "Check Gaps" tab to assign trainers to units.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{assignment.trainer_name}</h3>
                        <p className="text-sm text-gray-600">{assignment.unit.unit_code} - {assignment.unit.unit_name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(assignment.assignment_status)}`}>
                          {assignment.assignment_status.replace('_', ' ')}
                        </span>
                        <div className="text-sm font-semibold text-gray-700 mt-1">
                          {assignment.meets_requirements ? '✓ Meets Requirements' : '⚠ Gaps Found'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-teal-50 rounded-lg p-3 mb-3">
                      <div className="text-sm text-gray-600">Compliance Score</div>
                      <div className="text-2xl font-bold text-teal-600">{assignment.compliance_score.toFixed(1)}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-teal-600 h-2 rounded-full"
                          style={{ width: `${assignment.compliance_score}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {assignment.gaps_identified && assignment.gaps_identified.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Identified Gaps:</div>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {assignment.gaps_identified.map((gap, idx) => (
                            <li key={idx}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Gaps Tab */}
        {activeTab === 'gaps' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Competency Gaps</h2>
            
            {gaps.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No unresolved gaps found. All trainer assignments meet requirements!
              </div>
            ) : (
              <div className="space-y-4">
                {gaps.map((gap) => (
                  <div key={gap.id} className={`border-2 rounded-lg p-4 ${getSeverityColor(gap.gap_severity)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{gap.trainer_name}</h3>
                        <p className="text-sm text-gray-600">{gap.gap_id}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(gap.gap_severity)}`}>
                        {gap.gap_severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700">Gap Type:</div>
                      <div className="text-sm text-gray-900">{gap.gap_type.replace('_', ' ')}</div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700">Description:</div>
                      <div className="text-sm text-gray-900">{gap.gap_description}</div>
                    </div>
                    
                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Recommended Action:</div>
                      <div className="text-sm text-gray-900">{gap.recommended_action}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
