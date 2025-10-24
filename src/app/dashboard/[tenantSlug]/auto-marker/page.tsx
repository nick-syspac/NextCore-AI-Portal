'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface MarkedResponse {
  id: number;
  response_number: string;
  student_id: string;
  student_name: string;
  word_count: number;
  similarity_score: number;
  combined_score: number;
  marks_awarded: number;
  confidence_score: number;
  requires_review: boolean;
  status: string;
  marked_at: string;
}

interface AutoMarker {
  id: number;
  marker_number: string;
  title: string;
  question_text: string;
  model_answer: string;
  max_marks: number;
  answer_type: string;
  similarity_threshold: number;
  status: string;
  total_responses_marked: number;
  average_similarity_score: number;
  average_marking_time: number;
}

interface DashboardStats {
  total_markers: number;
  total_responses: number;
  avg_similarity: number;
  needs_review: number;
  time_saved: number;
}

export default function AutoMarkerPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [markers, setMarkers] = useState<AutoMarker[]>([]);
  const [responses, setResponses] = useState<MarkedResponse[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_markers: 0,
    total_responses: 0,
    avg_similarity: 0,
    needs_review: 0,
    time_saved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    question_text: '',
    model_answer: '',
    max_marks: 10,
    answer_type: 'short_answer',
    similarity_threshold: 0.70,
    min_similarity_for_credit: 0.40,
    use_keywords: true,
    keywords: '',
  });

  const [markingData, setMarkingData] = useState({
    student_id: '',
    student_name: '',
    response_text: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, [tenantSlug]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch markers
      const markersRes = await fetch(`/api/tenants/${tenantSlug}/auto-marker/markers/`);
      const markersData = await markersRes.json();
      setMarkers(markersData.results || markersData || []);

      // Fetch recent responses
      const responsesRes = await fetch(`/api/tenants/${tenantSlug}/auto-marker/responses/?limit=20`);
      const responsesData = await responsesRes.json();
      setResponses(responsesData.results || responsesData || []);

      // Calculate stats
      const totalMarkers = markersData.results?.length || markersData?.length || 0;
      const totalResponses = markersData.results?.reduce((sum: number, m: AutoMarker) => sum + m.total_responses_marked, 0) || 0;
      const avgSim = markersData.results?.reduce((sum: number, m: AutoMarker) => sum + m.average_similarity_score, 0) / (totalMarkers || 1) || 0;
      const needsReview = (responsesData.results || responsesData || []).filter((r: MarkedResponse) => r.requires_review).length;
      
      // Calculate time saved (70% faster = traditional time * 0.7)
      // Assume traditional marking takes 5 min per response
      const timeSaved = totalResponses * 5 * 0.7;

      setStats({
        total_markers: totalMarkers,
        total_responses: totalResponses,
        avg_similarity: avgSim,
        needs_review: needsReview,
        time_saved: timeSaved,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMarker = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    try {
      const res = await fetch(`/api/tenants/${tenantSlug}/auto-marker/markers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          keywords: keywordsArray,
        }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setFormData({
          title: '',
          question_text: '',
          model_answer: '',
          max_marks: 10,
          answer_type: 'short_answer',
          similarity_threshold: 0.70,
          min_similarity_for_credit: 0.40,
          use_keywords: true,
          keywords: '',
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating marker:', error);
    }
  };

  const handleMarkResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMarker) return;

    try {
      const res = await fetch(
        `/api/tenants/${tenantSlug}/auto-marker/markers/${selectedMarker}/mark_single/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...markingData,
            auto_mark: true,
          }),
        }
      );

      if (res.ok) {
        setShowMarkForm(false);
        setMarkingData({
          student_id: '',
          student_name: '',
          response_text: '',
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error marking response:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-blue-100 text-blue-800';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Auto-Marker</h2>
          <p className="text-gray-600 mt-2">
            Grade short answers automatically with semantic similarity scoring
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md font-semibold"
        >
          ✨ Create Auto-Marker
        </button>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Total Markers</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_markers}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Responses Marked</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_responses}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Avg Similarity</div>
          <div className={`text-3xl font-bold mt-2 ${getScoreColor(stats.avg_similarity)}`}>
            {(stats.avg_similarity * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Needs Review</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.needs_review}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">⚡ Time Saved</div>
          <div className="text-3xl font-bold text-indigo-600 mt-2">{Math.round(stats.time_saved)} min</div>
          <div className="text-xs text-gray-500 mt-1">70% faster turnaround</div>
        </div>
      </div>

      {/* Create Marker Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Create New Auto-Marker</h3>
          <form onSubmit={handleCreateMarker} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marker Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Python Basics Quiz"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Answer Type
                </label>
                <select
                  value={formData.answer_type}
                  onChange={(e) => setFormData({ ...formData, answer_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="short_answer">Short Answer</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="essay">Essay</option>
                  <option value="definition">Definition</option>
                  <option value="explanation">Explanation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Text *
              </label>
              <textarea
                required
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter the question students will answer..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Model Answer *
              </label>
              <textarea
                required
                value={formData.model_answer}
                onChange={(e) => setFormData({ ...formData, model_answer: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter the ideal/model answer for comparison..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Marks
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_marks}
                  onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Similarity Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.similarity_threshold}
                  onChange={(e) => setFormData({ ...formData, similarity_threshold: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Min score for full marks (0-1)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Credit Threshold
                </label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={formData.min_similarity_for_credit}
                  onChange={(e) => setFormData({ ...formData, min_similarity_for_credit: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Min score for partial credit</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Python, programming, high-level, interpreted"
              />
              <p className="text-xs text-gray-500 mt-1">Key concepts to look for in responses</p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold"
              >
                Create Auto-Marker
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mark Response Form */}
      {showMarkForm && selectedMarker && (
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-indigo-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Mark Student Response</h3>
          <form onSubmit={handleMarkResponse} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={markingData.student_id}
                  onChange={(e) => setMarkingData({ ...markingData, student_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., S12345"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={markingData.student_name}
                  onChange={(e) => setMarkingData({ ...markingData, student_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Response *
              </label>
              <textarea
                required
                value={markingData.response_text}
                onChange={(e) => setMarkingData({ ...markingData, response_text: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Paste or type the student's response here..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold"
              >
                🤖 Mark Response
              </button>
              <button
                type="button"
                onClick={() => setShowMarkForm(false)}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Auto-Markers List */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Active Auto-Markers</h3>
        
        {markers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <p>No auto-markers yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {markers.map((marker) => (
              <div key={marker.id} className="border border-gray-200 rounded-lg p-6 hover:border-purple-300 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-gray-900">{marker.title}</h4>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                        {marker.marker_number}
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        marker.status === 'active' ? 'bg-green-100 text-green-800' :
                        marker.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {marker.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{marker.question_text}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMarker(marker.id);
                      setShowMarkForm(true);
                    }}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-semibold"
                  >
                    Mark Response
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Responses Marked</div>
                    <div className="text-lg font-bold text-gray-900">{marker.total_responses_marked}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Avg Similarity</div>
                    <div className={`text-lg font-bold ${getScoreColor(marker.average_similarity_score)}`}>
                      {(marker.average_similarity_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Avg Time</div>
                    <div className="text-lg font-bold text-gray-900">
                      {marker.average_marking_time.toFixed(1)}s
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Max Marks</div>
                    <div className="text-lg font-bold text-gray-900">{marker.max_marks}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Responses */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Recent Marked Responses</h3>
        
        {responses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <p>No responses marked yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Response ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Words</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Similarity</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.map((response) => (
                  <tr key={response.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{response.student_name}</div>
                      <div className="text-sm text-gray-500">{response.student_id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{response.response_number}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{response.word_count}</td>
                    <td className="px-4 py-4">
                      <span className={`font-semibold ${getScoreColor(response.similarity_score)}`}>
                        {(response.similarity_score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-gray-900">{response.marks_awarded.toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${getScoreBadgeColor(response.confidence_score)}`}>
                        {(response.confidence_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {response.requires_review ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          ⚠️ Review
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          ✓ {response.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(response.marked_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
