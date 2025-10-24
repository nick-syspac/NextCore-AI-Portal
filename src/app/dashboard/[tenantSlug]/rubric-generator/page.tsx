'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Rubric {
  id: number;
  rubric_number: string;
  title: string;
  rubric_type: string;
  status: string;
  assessment_title: string;
  task_question: string;
  total_points: number;
  criterion_count: number;
  ai_generated: boolean;
  nlp_summary: string;
  taxonomy_tags: string[];
  created_at: string;
}

interface DashboardStats {
  total_rubrics: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  ai_generation_rate: number;
  avg_criteria_per_rubric: number;
  taxonomy_distribution: Record<string, number>;
}

interface Assessment {
  id: number;
  assessment_number: string;
  unit_code: string;
  title: string;
}

const RUBRIC_TYPES = [
  { value: 'analytic', label: 'Analytic - Separate criteria with levels' },
  { value: 'holistic', label: 'Holistic - Single overall assessment' },
  { value: 'checklist', label: 'Checklist - Simple yes/no criteria' },
  { value: 'single_point', label: 'Single Point - Focus on meeting standard' },
];

export default function RubricGeneratorPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  
  // Form state
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [rubricType, setRubricType] = useState('analytic');
  const [numberOfCriteria, setNumberOfCriteria] = useState(5);
  const [numberOfLevels, setNumberOfLevels] = useState(4);
  const [totalPoints, setTotalPoints] = useState(100);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [enableNlpSummary, setEnableNlpSummary] = useState(true);
  const [enableTaxonomyTagging, setEnableTaxonomyTagging] = useState(true);

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
      
      // Fetch rubrics
      const rubricsRes = await fetch(
        `${baseUrl}/api/tenants/${tenantSlug}/rubric-generator/rubrics/`,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (rubricsRes.ok) {
        const data = await rubricsRes.json();
        setRubrics(data.results || []);
      }
      
      // Fetch assessments for dropdown
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
        `${baseUrl}/api/tenants/${tenantSlug}/rubric-generator/rubrics/dashboard_stats/`,
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

  const handleGenerateRubric = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assessmentId) {
      alert('Please select an assessment');
      return;
    }
    
    setGenerating(true);
    
    try {
      const authToken = localStorage.getItem('authToken');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${baseUrl}/api/tenants/${tenantSlug}/rubric-generator/rubrics/generate_rubric/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assessment_id: assessmentId,
            title: title || undefined,
            rubric_type: rubricType,
            number_of_criteria: numberOfCriteria,
            number_of_levels: numberOfLevels,
            total_points: totalPoints,
            include_examples: includeExamples,
            enable_nlp_summary: enableNlpSummary,
            enable_taxonomy_tagging: enableTaxonomyTagging,
          }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        fetchDashboardData();
        setShowGenerateForm(false);
        // Reset form
        setAssessmentId(null);
        setTitle('');
        setRubricType('analytic');
        setNumberOfCriteria(5);
        setNumberOfLevels(4);
        setTotalPoints(100);
        
        router.push(`/dashboard/${tenantSlug}/rubric-generator/${data.id}`);
      } else {
        const error = await response.json();
        alert(`Error generating rubric: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating rubric:', error);
      alert('Failed to generate rubric. Please try again.');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${tenantSlug}`} className="text-pink-600 hover:text-pink-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Rubric Generator
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Rubric Generator</h2>
            <p className="text-gray-600 mt-2">
              Auto-create marking guides with NLP summarization and taxonomy tagging
            </p>
          </div>
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-md font-semibold"
          >
            📋 Generate Rubric
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">Total Rubrics</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_rubrics}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">AI Generated</div>
              <div className="text-3xl font-bold text-pink-600">{stats.ai_generation_rate}%</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">Avg Criteria</div>
              <div className="text-3xl font-bold text-blue-600">{stats.avg_criteria_per_rubric}</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium mb-1">In Review</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.by_status.review || 0}</div>
            </div>
          </div>
        )}

        {/* Taxonomy Distribution */}
        {stats && stats.taxonomy_distribution && Object.keys(stats.taxonomy_distribution).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Taxonomy Tag Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.taxonomy_distribution).map(([tag, percentage]) => (
                <div
                  key={tag}
                  className="px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full"
                >
                  <span className="text-sm font-medium text-gray-900">{tag}</span>
                  <span className="text-xs text-gray-600 ml-2">{percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generate Rubric Form */}
        {showGenerateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-pink-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Rubric</h3>
            <form onSubmit={handleGenerateRubric} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment *
                  </label>
                  <select
                    value={assessmentId || ''}
                    onChange={(e) => setAssessmentId(Number(e.target.value))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select an assessment</option>
                    {assessments.map((assessment) => (
                      <option key={assessment.id} value={assessment.id}>
                        {assessment.assessment_number} - {assessment.unit_code}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rubric Type
                  </label>
                  <select
                    value={rubricType}
                    onChange={(e) => setRubricType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {RUBRIC_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Leave blank for auto-generated title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Criteria (1-20)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={numberOfCriteria}
                    onChange={(e) => setNumberOfCriteria(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Performance Levels (2-10)
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={numberOfLevels}
                    onChange={(e) => setNumberOfLevels(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeExamples}
                    onChange={(e) => setIncludeExamples(e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Include examples and indicators
                  </span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableNlpSummary}
                    onChange={(e) => setEnableNlpSummary(e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable NLP summarization
                  </span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableTaxonomyTagging}
                    onChange={(e) => setEnableTaxonomyTagging(e.target.checked)}
                    className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable taxonomy tagging
                  </span>
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={generating}
                  className="px-6 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? '⏳ Generating...' : '📋 Generate Rubric'}
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

        {/* Rubrics List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Rubrics</h3>
          </div>
          
          {rubrics.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rubrics yet</h3>
              <p className="text-gray-600 mb-6">
                Generate your first marking rubric to get started
              </p>
              {assessments.length > 0 ? (
                <button
                  onClick={() => setShowGenerateForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-md font-semibold"
                >
                  📋 Generate Rubric
                </button>
              ) : (
                <p className="text-gray-500 text-sm">
                  Please create an assessment first before generating rubrics
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rubric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criteria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
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
                  {rubrics.map((rubric) => (
                    <tr key={rubric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {rubric.ai_generated && (
                            <span className="mr-2" title="AI Generated">🤖</span>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {rubric.rubric_number}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {rubric.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rubric.assessment_title || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rubric.rubric_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(rubric.status)}`}>
                          {rubric.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rubric.criterion_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rubric.total_points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rubric.taxonomy_tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {rubric.taxonomy_tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{rubric.taxonomy_tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(rubric.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/${tenantSlug}/rubric-generator/${rubric.id}`}
                          className="text-pink-600 hover:text-pink-900"
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
