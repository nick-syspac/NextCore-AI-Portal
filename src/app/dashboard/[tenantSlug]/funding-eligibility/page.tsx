'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

// Types
interface JurisdictionRequirement {
  id: number;
  jurisdiction: string;
  jurisdiction_display: string;
  name: string;
  code: string;
  funding_percentage: number;
  student_contribution: number;
  is_currently_effective: boolean;
}

interface EligibilityResult {
  check_number: string;
  status: string;
  status_display: string;
  is_eligible: boolean;
  eligibility_percentage: number;
  rules_checked: number;
  rules_passed: number;
  rules_failed: number;
  failed_rules: any[];
  warnings: string[];
  override_required: boolean;
  prevents_enrollment: boolean;
  eligibility_summary: string;
}

export default function FundingEligibilityPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState<'check' | 'history' | 'requirements'>('check');
  const [checkResult, setCheckResult] = useState<EligibilityResult | null>(null);
  const [checking, setChecking] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    // Student info
    student_first_name: '',
    student_last_name: '',
    student_dob: '',
    student_email: '',
    student_phone: '',
    
    // Course info
    course_code: '',
    course_name: '',
    aqf_level: 5,
    intended_start_date: '',
    
    // Jurisdiction
    jurisdiction: 'nsw',
    
    // Eligibility data
    citizenship_status: 'citizen',
    is_jurisdiction_resident: true,
    jurisdiction_residency_months: 12,
    highest_education: 'year_12',
    highest_aqf_level: 4,
    employment_status: 'employed',
    annual_income: 0,
    has_concession_card: false,
    has_disability: false,
    is_indigenous: false,
  });

  // Mock jurisdictions
  const jurisdictions = [
    { id: 1, jurisdiction: 'nsw', jurisdiction_display: 'New South Wales', name: 'Smart and Skilled NSW', code: 'SS-NSW', funding_percentage: 90, student_contribution: 500, is_currently_effective: true },
    { id: 2, jurisdiction: 'vic', jurisdiction_display: 'Victoria', name: 'Skills First Victoria', code: 'SFV', funding_percentage: 85, student_contribution: 600, is_currently_effective: true },
    { id: 3, jurisdiction: 'qld', jurisdiction_display: 'Queensland', name: 'Certificate 3 Guarantee', code: 'C3G-QLD', funding_percentage: 100, student_contribution: 0, is_currently_effective: true },
  ];

  const handleCheckEligibility = () => {
    setChecking(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock eligibility check result
      const mockResult: EligibilityResult = {
        check_number: `EC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident ? 'eligible' : 'ineligible',
        status_display: formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident ? 'Eligible' : 'Not Eligible',
        is_eligible: formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident,
        eligibility_percentage: formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident ? 100 : 60,
        rules_checked: 8,
        rules_passed: formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident ? 8 : 5,
        rules_failed: formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident ? 0 : 3,
        failed_rules: formData.citizenship_status !== 'citizen' || !formData.is_jurisdiction_resident ? [
          { rule_name: 'Australian Citizenship', message: 'Must be Australian citizen', override_allowed: false },
          { rule_name: 'Jurisdiction Residency', message: 'Must be resident of jurisdiction for at least 6 months', override_allowed: true },
        ] : [],
        warnings: formData.annual_income > 50000 ? ['Income above recommended threshold'] : [],
        override_required: !formData.is_jurisdiction_resident && formData.citizenship_status === 'citizen',
        prevents_enrollment: !(formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident),
        eligibility_summary: formData.citizenship_status === 'citizen' && formData.is_jurisdiction_resident 
          ? `Eligible for ${jurisdictions.find(j => j.jurisdiction === formData.jurisdiction)?.name} funding`
          : 'Not eligible - citizenship or residency requirements not met'
      };
      
      setCheckResult(mockResult);
      setChecking(false);
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'eligible': return 'bg-green-100 text-green-800 border-green-200';
      case 'ineligible': return 'bg-red-100 text-red-800 border-red-200';
      case 'conditional': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'override': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Funding Eligibility Checker</h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              ⚖️ Rules Engine
            </span>
          </div>
          <p className="text-gray-600">Validate student eligibility and prevent non-compliant enrolments</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('check')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'check'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Check Eligibility
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Check History
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'requirements'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Requirements
          </button>
        </div>

        {/* Check Eligibility Tab */}
        {activeTab === 'check' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Student & Course Details</h2>
                
                <div className="space-y-6">
                  {/* Student Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          type="text"
                          value={formData.student_first_name}
                          onChange={(e) => setFormData({ ...formData, student_first_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={formData.student_last_name}
                          onChange={(e) => setFormData({ ...formData, student_last_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Smith"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={formData.student_dob}
                          onChange={(e) => setFormData({ ...formData, student_dob: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.student_email}
                          onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="john.smith@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Course Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                        <input
                          type="text"
                          value={formData.course_code}
                          onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="ICT50120"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                        <input
                          type="text"
                          value={formData.course_name}
                          onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Diploma of Information Technology"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">AQF Level</label>
                        <select
                          value={formData.aqf_level}
                          onChange={(e) => setFormData({ ...formData, aqf_level: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                            <option key={level} value={level}>AQF {level}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Intended Start Date</label>
                        <input
                          type="date"
                          value={formData.intended_start_date}
                          onChange={(e) => setFormData({ ...formData, intended_start_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Jurisdiction & Eligibility */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Eligibility Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                        <select
                          value={formData.jurisdiction}
                          onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="nsw">New South Wales</option>
                          <option value="vic">Victoria</option>
                          <option value="qld">Queensland</option>
                          <option value="wa">Western Australia</option>
                          <option value="sa">South Australia</option>
                          <option value="tas">Tasmania</option>
                          <option value="act">ACT</option>
                          <option value="nt">Northern Territory</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship Status</label>
                        <select
                          value={formData.citizenship_status}
                          onChange={(e) => setFormData({ ...formData, citizenship_status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="citizen">Australian Citizen</option>
                          <option value="permanent_resident">Permanent Resident</option>
                          <option value="temporary_visa">Temporary Visa</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                        <select
                          value={formData.employment_status}
                          onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="employed">Employed</option>
                          <option value="unemployed">Unemployed</option>
                          <option value="apprentice">Apprentice</option>
                          <option value="trainee">Trainee</option>
                          <option value="self_employed">Self Employed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Residency (months)</label>
                        <input
                          type="number"
                          value={formData.jurisdiction_residency_months}
                          onChange={(e) => setFormData({ ...formData, jurisdiction_residency_months: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_jurisdiction_resident}
                          onChange={(e) => setFormData({ ...formData, is_jurisdiction_resident: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Resident of selected jurisdiction</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.has_concession_card}
                          onChange={(e) => setFormData({ ...formData, has_concession_card: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Concession card holder</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.has_disability}
                          onChange={(e) => setFormData({ ...formData, has_disability: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Person with disability</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_indigenous}
                          onChange={(e) => setFormData({ ...formData, is_indigenous: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">Indigenous Australian</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckEligibility}
                    disabled={checking || !formData.student_first_name || !formData.course_code}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {checking ? '⚖️ Running Rules Engine...' : '✓ Check Eligibility'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Eligibility Result</h2>
                
                {checkResult ? (
                  <div className="space-y-4">
                    <div className={`border-2 rounded-lg p-4 ${getStatusColor(checkResult.status)}`}>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          {checkResult.is_eligible ? '✓' : '✗'}
                        </div>
                        <div className="text-lg font-semibold mb-1">{checkResult.status_display}</div>
                        <div className="text-sm">{checkResult.check_number}</div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-2">Eligibility Score</div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              checkResult.eligibility_percentage >= 80 ? 'bg-green-500' :
                              checkResult.eligibility_percentage >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${checkResult.eligibility_percentage}%` }}
                          />
                        </div>
                        <div className="text-lg font-bold">{checkResult.eligibility_percentage}%</div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {checkResult.rules_passed} of {checkResult.rules_checked} rules passed
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 border-l-4 border-indigo-500 pl-3 py-2">
                      {checkResult.eligibility_summary}
                    </div>

                    {checkResult.failed_rules.length > 0 && (
                      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                        <h3 className="font-semibold text-red-900 mb-2">Failed Requirements</h3>
                        <ul className="space-y-2">
                          {checkResult.failed_rules.map((rule, idx) => (
                            <li key={idx} className="text-sm text-red-800">
                              <span className="font-medium">{rule.rule_name}:</span> {rule.message}
                              {rule.override_allowed && (
                                <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                  Override Available
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {checkResult.warnings.length > 0 && (
                      <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                        <h3 className="font-semibold text-yellow-900 mb-2">Warnings</h3>
                        <ul className="space-y-1">
                          {checkResult.warnings.map((warning, idx) => (
                            <li key={idx} className="text-sm text-yellow-800">⚠️ {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {checkResult.prevents_enrollment && (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <span className="text-red-600 text-xl">🚫</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-red-900">Enrollment Prevented</h3>
                            <p className="text-sm text-red-800 mt-1">
                              This student cannot be enrolled due to failed compliance requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {checkResult.override_required && (
                      <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                        Request Override Approval
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <div className="text-4xl mb-4">⚖️</div>
                    <p>Complete the form and click "Check Eligibility" to validate student funding eligibility</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jurisdictions.map(req => (
              <div key={req.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{req.jurisdiction_display}</h3>
                    <p className="text-sm text-gray-600">{req.name}</p>
                  </div>
                  {req.is_currently_effective && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Funding Coverage</div>
                    <div className="text-2xl font-bold text-indigo-600">{req.funding_percentage}%</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600">Student Contribution</div>
                    <div className="text-lg font-semibold text-gray-900">${req.student_contribution}</div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 uppercase font-medium mb-2">Requirements</div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>✓ Australian citizen or PR</li>
                      <li>✓ Jurisdiction resident (6+ months)</li>
                      <li>✓ Age 15-64</li>
                      <li>✓ No higher qualifications</li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Eligibility Checks</h2>
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">📋</div>
              <p>No eligibility checks performed yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
