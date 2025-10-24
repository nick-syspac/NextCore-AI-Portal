'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface PDActivity {
  id: number
  activity_number: string
  activity_title: string
  activity_type: string
  start_date: string
  end_date: string
  hours_completed: number
  status: string
  verification_status: string
  maintains_vocational_currency: boolean
  maintains_industry_currency: boolean
  maintains_teaching_currency: boolean
  compliance_areas: string[]
  description: string
  provider: string
}

interface TrainerProfile {
  id: number
  profile_number: string
  trainer_name: string
  role: string
  total_pd_hours: number
  current_year_hours: number
  annual_pd_goal_hours: number
  vocational_currency_status: string
  industry_currency_status: string
  last_vocational_pd: string | null
  last_industry_pd: string | null
  vocational_currency_days_remaining: number | null
  industry_currency_days_remaining: number | null
  annual_progress_percentage: number
}

interface PDSuggestion {
  id: number
  suggestion_number: string
  activity_title: string
  description: string
  rationale: string
  addresses_currency_gap: string
  priority_level: string
  estimated_hours: number
  suggested_timeframe: string
  status: string
  is_urgent: boolean
}

interface ComplianceCheck {
  id: number
  check_number: string
  check_date: string
  overall_status: string
  compliance_score: number
  hours_required: number
  hours_completed: number
  hours_shortfall: number
  findings: Array<{ issue: string }>
  recommendations: Array<{ recommendation: string }>
}

interface DashboardStats {
  total_activities: number
  total_hours: number
  activities_last_30_days: number
  hours_last_30_days: number
  trainers_current: number
  trainers_expiring_soon: number
  trainers_expired: number
  activities_by_type: Record<string, number>
  monthly_hours: Array<{ month: string; hours: number }>
}

export default function PDTrackerPage() {
  const params = useParams() as { tenantSlug: string }
  
  const [activities, setActivities] = useState<PDActivity[]>([])
  const [profile, setProfile] = useState<TrainerProfile | null>(null)
  const [suggestions, setSuggestions] = useState<PDSuggestion[]>([])
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('log')

  const [activityForm, setActivityForm] = useState({
    trainer_id: 'TR001',
    trainer_name: 'John Smith',
    activity_type: 'formal_course',
    activity_title: '',
    description: '',
    provider: '',
    start_date: '',
    end_date: '',
    hours_completed: 0,
    maintains_vocational_currency: false,
    maintains_industry_currency: false,
    maintains_teaching_currency: false
  })

  useEffect(() => {
    loadDashboard()
    loadProfile()
    loadActivities()
    loadSuggestions()
  }, [params.tenantSlug])

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `/api/tenants/${params.tenantSlug}/pd-tracker/checks/dashboard/?tenant=${params.tenantSlug}`
      )
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
  }

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `/api/tenants/${params.tenantSlug}/pd-tracker/profiles/?tenant=${params.tenantSlug}&trainer_id=TR001`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.results && data.results.length > 0) {
          setProfile(data.results[0])
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const loadActivities = async () => {
    try {
      const response = await fetch(
        `/api/tenants/${params.tenantSlug}/pd-tracker/activities/?tenant=${params.tenantSlug}&trainer_id=TR001`
      )
      if (response.ok) {
        const data = await response.json()
        setActivities(data.results || [])
      }
    } catch (error) {
      console.error('Failed to load activities:', error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await fetch(
        `/api/tenants/${params.tenantSlug}/pd-tracker/suggestions/?trainer_id=TR001`
      )
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.results || [])
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(
        `/api/tenants/${params.tenantSlug}/pd-tracker/activities/log_activity/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: params.tenantSlug,
            ...activityForm
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setActivities([data.activity, ...activities])
        setProfile(data.profile)
        
        setActivityForm({
          ...activityForm,
          activity_title: '',
          description: '',
          provider: '',
          start_date: '',
          end_date: '',
          hours_completed: 0,
          maintains_vocational_currency: false,
          maintains_industry_currency: false,
          maintains_teaching_currency: false
        })
        
        loadDashboard()
      }
    } catch (error) {
      console.error('Failed to log activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/tenants/${params.tenantSlug}/pd-tracker/suggestions/generate_suggestions/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trainer_id: 'TR001',
            max_suggestions: 5
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunComplianceCheck = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const oneYearAgo = new Date(today)
      oneYearAgo.setFullYear(today.getFullYear() - 1)

      const response = await fetch(
        `/api/tenants/${params.tenantSlug}/pd-tracker/checks/compliance_report/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: params.tenantSlug,
            period_start: oneYearAgo.toISOString().split('T')[0],
            period_end: today.toISOString().split('T')[0],
            report_format: 'summary'
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        setComplianceChecks(data.compliance_checks || [])
      }
    } catch (error) {
      console.error('Failed to run compliance check:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'current':
      case 'compliant':
      case 'verified':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'expiring_soon':
      case 'at_risk':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
      case 'non_compliant':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PD Tracker</h1>
          <p className="text-gray-600 mt-2">
            Professional Development Tracking & RTO Trainer Currency
          </p>
        </div>
        <span className="px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 text-sm font-medium rounded-full border border-teal-200">
          🎯 TrainAI Suite
        </span>
      </div>

      {profile && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total PD Hours</h3>
            <div className="text-2xl font-bold text-gray-900">{profile.total_pd_hours.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Annual Progress</h3>
            <div className="text-2xl font-bold text-gray-900">
              {profile.current_year_hours.toFixed(1)} / {profile.annual_pd_goal_hours}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, profile.annual_progress_percentage)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile.annual_progress_percentage.toFixed(0)}% complete
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Vocational Currency</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.vocational_currency_status)}`}>
              {formatActivityType(profile.vocational_currency_status)}
            </span>
            {profile.vocational_currency_days_remaining !== null && (
              <p className="text-xs text-gray-500 mt-2">
                {profile.vocational_currency_days_remaining} days remaining
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Industry Currency</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.industry_currency_status)}`}>
              {formatActivityType(profile.industry_currency_status)}
            </span>
            {profile.industry_currency_days_remaining !== null && (
              <p className="text-xs text-gray-500 mt-2">
                {profile.industry_currency_days_remaining} days remaining
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6" aria-label="Tabs">
            {[
              { id: 'log', name: '📝 Log Activity' },
              { id: 'activities', name: '📋 Activities' },
              { id: 'suggestions', name: '💡 Suggestions' },
              { id: 'currency', name: '⏰ Currency' },
              { id: 'compliance', name: '🛡️ Compliance' },
              { id: 'reports', name: '📊 Reports' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'log' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Log PD Activity</h2>
              <p className="text-gray-600 mb-6">
                Record professional development activities and update trainer currency
              </p>
              
              <form onSubmit={handleLogActivity} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      value={activityForm.activity_type}
                      onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}
                      required
                    >
                      <option value="formal_course">Formal Course/Training</option>
                      <option value="workshop">Workshop/Seminar</option>
                      <option value="conference">Conference/Symposium</option>
                      <option value="webinar">Webinar/Online Session</option>
                      <option value="industry_placement">Industry Placement</option>
                      <option value="networking">Professional Networking</option>
                      <option value="research">Research/Publication</option>
                      <option value="mentoring">Mentoring/Coaching</option>
                      <option value="self_study">Self-Directed Study</option>
                      <option value="certification">Certification/Qualification</option>
                      <option value="teaching_observation">Teaching Observation</option>
                      <option value="curriculum_development">Curriculum Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      value={activityForm.provider}
                      onChange={(e) => setActivityForm({ ...activityForm, provider: e.target.value })}
                      placeholder="Training provider"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    value={activityForm.activity_title}
                    onChange={(e) => setActivityForm({ ...activityForm, activity_title: e.target.value })}
                    placeholder="e.g., Advanced Training Techniques Workshop"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })}
                    placeholder="Describe the PD activity"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      value={activityForm.start_date}
                      onChange={(e) => setActivityForm({ ...activityForm, start_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      value={activityForm.end_date}
                      onChange={(e) => setActivityForm({ ...activityForm, end_date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      value={activityForm.hours_completed}
                      onChange={(e) => setActivityForm({ ...activityForm, hours_completed: parseFloat(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Maintained</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-teal-600"
                        checked={activityForm.maintains_vocational_currency}
                        onChange={(e) => setActivityForm({ ...activityForm, maintains_vocational_currency: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Vocational Currency</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-teal-600"
                        checked={activityForm.maintains_industry_currency}
                        onChange={(e) => setActivityForm({ ...activityForm, maintains_industry_currency: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Industry Currency</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-teal-600"
                        checked={activityForm.maintains_teaching_currency}
                        onChange={(e) => setActivityForm({ ...activityForm, maintains_teaching_currency: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Teaching Currency</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-semibold disabled:opacity-50"
                >
                  {loading ? 'Logging...' : 'Log Activity'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'activities' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">PD Activities</h2>
              <p className="text-gray-600 mb-6">View all recorded PD activities</p>
              
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{activity.activity_title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(activity.status)}`}>
                        {formatActivityType(activity.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Type: </span>
                        <span className="font-medium">{formatActivityType(activity.activity_type)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date: </span>
                        <span className="font-medium">{new Date(activity.start_date).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Hours: </span>
                        <span className="font-medium">{activity.hours_completed}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {activities.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No activities recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'suggestions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">PD Suggestions</h2>
                  <p className="text-gray-600">LLM-powered recommendations</p>
                </div>
                <button
                  onClick={handleGenerateSuggestions}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 shadow-md font-semibold disabled:opacity-50"
                >
                  💡 Generate
                </button>
              </div>
              
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className={`border-2 rounded-lg p-4 ${suggestion.is_urgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">{suggestion.activity_title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(suggestion.priority_level)}`}>
                        {suggestion.priority_level.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{suggestion.description}</p>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                      <p className="text-sm font-medium text-blue-900">Rationale</p>
                      <p className="text-sm text-blue-800">{suggestion.rationale}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Hours: </span>
                        <span className="font-medium">{suggestion.estimated_hours}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Timeframe: </span>
                        <span className="font-medium">{suggestion.suggested_timeframe}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {suggestions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No suggestions available</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'currency' && profile && (
            <div>
              <h2 className="text-xl font-bold mb-6">Currency Status</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">Vocational Currency</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(profile.vocational_currency_status)}`}>
                      {formatActivityType(profile.vocational_currency_status)}
                    </span>
                  </div>
                  {profile.vocational_currency_days_remaining !== null && (
                    <p className="text-sm text-gray-600">{profile.vocational_currency_days_remaining} days remaining</p>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold">Industry Currency</h3>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(profile.industry_currency_status)}`}>
                      {formatActivityType(profile.industry_currency_status)}
                    </span>
                  </div>
                  {profile.industry_currency_days_remaining !== null && (
                    <p className="text-sm text-gray-600">{profile.industry_currency_days_remaining} days remaining</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Compliance Checks</h2>
                <button
                  onClick={handleRunComplianceCheck}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 shadow-md font-semibold disabled:opacity-50"
                >
                  🛡️ Run Check
                </button>
              </div>
              
              <div className="space-y-4">
                {complianceChecks.map((check) => (
                  <div key={check.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-3">
                      <h3 className="font-semibold">{check.check_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(check.overall_status)}`}>
                        {formatActivityType(check.overall_status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-2xl font-bold text-blue-600">{check.compliance_score}%</p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-2xl font-bold text-green-600">{check.hours_completed}</p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded">
                        <p className="text-2xl font-bold text-amber-600">{check.hours_shortfall}</p>
                        <p className="text-xs text-gray-500">Shortfall</p>
                      </div>
                    </div>
                  </div>
                ))}

                {complianceChecks.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>No compliance checks</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && dashboardStats && (
            <div>
              <h2 className="text-xl font-bold mb-6">Reports</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Activity Overview</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Activities:</span>
                      <span className="font-bold">{dashboardStats.total_activities}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Hours:</span>
                      <span className="font-bold">{dashboardStats.total_hours.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Currency Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-green-50 rounded">
                      <span>Current</span>
                      <span className="font-bold text-green-600">{dashboardStats.trainers_current}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-yellow-50 rounded">
                      <span>Expiring</span>
                      <span className="font-bold text-yellow-600">{dashboardStats.trainers_expiring_soon}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-50 rounded">
                      <span>Expired</span>
                      <span className="font-bold text-red-600">{dashboardStats.trainers_expired}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
