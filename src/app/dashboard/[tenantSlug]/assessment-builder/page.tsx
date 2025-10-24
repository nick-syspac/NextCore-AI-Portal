'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Assessment {
  id: number;
  assessment_number: string;
  unit_code: string;
  unit_title: string;
  assessment_type: string;
  status: string;
  ai_generated: boolean;
  compliance_score: number;
  task_count: number;
  blooms_distribution: Record<string, number>;
  created_at: string;
}

interface DashboardStats {
  total_assessments: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  ai_generation_rate: number;
  avg_compliance_score: number;
  blooms_distribution: Record<string, number>;
}

const ASSESSMENT_TYPES = [
  { value: 'knowledge', label: 'Knowledge Assessment' },
  { value: 'practical', label: 'Practical Assessment' },
  { value: 'project', label: 'Project Assessment' },
  { value: 'portfolio', label: 'Portfolio Assessment' },
  { value: 'observation', label: 'Observation Assessment' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'simulation', label: 'Simulation Assessment' },
  { value: 'integrated', label: 'Integrated Assessment' },
  { value: 'written', label: 'Written Assessment' },
  { value: 'oral', label: 'Oral Assessment' },
];

const BLOOMS_LEVELS = [
  { key: 'remember', label: 'Remember', color: 'bg-blue-500' },
  { key: 'understand', label: 'Understand', color: 'bg-green-500' },
  { key: 'apply', label: 'Apply', color: 'bg-yellow-500' },
  { key: 'analyze', label: 'Analyze', color: 'bg-orange-500' },
  { key: 'evaluate', label: 'Evaluate', color: 'bg-red-500' },
  { key: 'create', label: 'Create', color: 'bg-purple-500' },
];

export default function AssessmentBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  
  // Form state
  const [unitCode, setUnitCode] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState('knowledge');
  const [trainingPackage, setTrainingPackage] = useState('');
  const [numberOfTasks, setNumberOfTasks] = useState(10);
  const [includeContext, setIncludeContext] = useState(true);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, [router, tenantSlug]);

  const fetchDashboardData = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Fetch assessments
      const assessmentsRes = await fetch(
        `${baseUrl}/api/tenants/${tenantSlug}/assessment-builder/assessments/`,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        setAssessments(data.results || []);
      }
      
      // Fetch stats
      const statsRes = await fetch(
        `${baseUrl}/api/tenants/${tenantSlug}/assessment-builder/assessments/dashboard_stats/`,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${baseUrl}/api/tenants/${tenantSlug}/assessment-builder/assessments/generate_assessment/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            unit_code: unitCode,
            unit_title: unitTitle,
            assessment_type: assessmentType,
            training_package: trainingPackage || undefined,
            number_of_tasks: numberOfTasks,
            include_context: includeContext,
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Refresh the assessments list
        fetchDashboardData();
        setShowGenerateForm(false);
        // Reset form
        setUnitCode('');
        setUnitTitle('');
        setAssessmentType('knowledge');
        setTrainingPackage('');
        setNumberOfTasks(10);
        setIncludeContext(true);
        
        // Navigate to the new assessment
        router.push(`/dashboard/${tenantSlug}/assessment-builder/${data.id}`);
      } else {
        const error = await response.json();
        alert(`Error generating assessment: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating assessment:', error);
      alert('Failed to generate assessment. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      generating: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      published: 'bg-purple-100 text-purple-800',
      archived: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${tenantSlug}`} className="text-orange-600 hover:text-orange-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Assessment Builder
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Assessment Builder</h2>
            <p className="text-gray-600 mt-2">
              Generate compliant assessments from training package unit codes using AI
            </p>
          </div>
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md font-semibold"
          >
            ✨ Generate Assessment
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">Total Assessments</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_assessments}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">AI Generated</div>
              <div className="text-3xl font-bold text-orange-600">{stats.ai_generation_rate}%</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">Avg Compliance Score</div>
              <div className="text-3xl font-bold text-green-600">{stats.avg_compliance_score.toFixed(0)}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">In Review</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.by_status.review || 0}</div>
            </div>
          </div>
        )}

        {/* Bloom's Taxonomy Distribution */}
        {stats && stats.blooms_distribution && Object.keys(stats.blooms_distribution).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bloom's Taxonomy Distribution</h3>
            <div className="space-y-3">
              {BLOOMS_LEVELS.map((level) => (
                <div key={level.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{level.label}</span>
                    <span className="text-sm text-gray-600">
                      {stats.blooms_distribution[level.key]?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${level.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${stats.blooms_distribution[level.key] || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Assessment Form */}
        {showGenerateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Assessment</h3>
            <form onSubmit={handleGenerateAssessment} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Code *
                  </label>
                  <input
                    type="text"
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    placeholder="e.g., BSBWHS332X"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment Type *
                  </label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {ASSESSMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Title *
                </label>
                <input
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  placeholder="e.g., Apply infection prevention and control procedures to own work activities"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Training Package (Optional)
                </label>
                <input
                  type="text"
                  value={trainingPackage}
                  onChange={(e) => setTrainingPackage(e.target.value)}
                  placeholder="e.g., CHC Community Services Training Package"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Tasks (1-50)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numberOfTasks}
                    onChange={(e) => setNumberOfTasks(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeContext}
                      onChange={(e) => setIncludeContext(e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Include realistic scenarios/context
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={generating}
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? '⏳ Generating...' : '✨ Generate Assessment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assessments List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Assessments</h3>
          </div>
          
          {assessments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No assessments yet</h3>
              <p className="text-gray-600 mb-6">
                Generate your first assessment to get started
              </p>
              <button
                onClick={() => setShowGenerateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md font-semibold"
              >
                ✨ Generate Assessment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compliance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {assessment.ai_generated && (
                            <span className="mr-2" title="AI Generated">🤖</span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assessment.assessment_number}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {assessment.unit_title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assessment.unit_code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assessment.assessment_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(assessment.status)}`}>
                          {assessment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {assessment.task_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {assessment.compliance_score}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/${tenantSlug}/assessment-builder/${assessment.id}`}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
