'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface FeedbackTemplate {
  id: number;
  template_number: string;
  name: string;
  description: string;
  feedback_type: string;
  sentiment: string;
  tone: string;
  positivity_level: number;
  directness_level: number;
  formality_level: number;
  total_feedback_generated: number;
  status: string;
}

interface GeneratedFeedback {
  id: number;
  feedback_number: string;
  student_name: string;
  student_id: string;
  score: number;
  max_score: number;
  percentage_score: number;
  sentiment_score: number;
  personalization_score: number;
  word_count: number;
  requires_review: boolean;
  status: string;
}

interface DashboardStats {
  total_templates: number;
  total_generated: number;
  avg_sentiment: number;
  avg_personalization: number;
}

export default function FeedbackAssistantPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [templates, setTemplates] = useState<FeedbackTemplate[]>([]);
  const [feedbacks, setFeedbacks] = useState<GeneratedFeedback[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_templates: 0,
    total_generated: 0,
    avg_sentiment: 0,
    avg_personalization: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    feedback_type: 'formative',
    sentiment: 'constructive',
    tone: 'professional',
    positivity_level: 7,
    directness_level: 5,
    formality_level: 7,
    opening_template: 'Dear {student_name},',
    strengths_template: 'Your strengths include: {strengths}',
    improvements_template: 'Areas for improvement: {improvements}',
    next_steps_template: 'Next steps: {next_steps}',
    closing_template: 'Keep up the great work!',
  });

  const [generateData, setGenerateData] = useState({
    student_id: '',
    student_name: '',
    assessment_title: '',
    score: '',
    max_score: '',
    grade: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, [tenantSlug]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch templates
      const templatesRes = await fetch(`/api/tenants/${tenantSlug}/feedback-assistant/templates/`);
      const templatesData = await templatesRes.json();
      setTemplates(templatesData.results || templatesData || []);

      // Fetch recent feedbacks
      const feedbacksRes = await fetch(
        `/api/tenants/${tenantSlug}/feedback-assistant/generated/?limit=20`
      );
      const feedbacksData = await feedbacksRes.json();
      setFeedbacks(feedbacksData.results || feedbacksData || []);

      // Calculate stats
      const totalTemplates = templatesData.results?.length || templatesData?.length || 0;
      const totalGenerated =
        templatesData.results?.reduce(
          (sum: number, t: FeedbackTemplate) => sum + t.total_feedback_generated,
          0
        ) || 0;
      const avgSent =
        (feedbacksData.results || feedbacksData || []).reduce(
          (sum: number, f: GeneratedFeedback) => sum + f.sentiment_score,
          0
        ) / ((feedbacksData.results || feedbacksData || []).length || 1);
      const avgPers =
        (feedbacksData.results || feedbacksData || []).reduce(
          (sum: number, f: GeneratedFeedback) => sum + f.personalization_score,
          0
        ) / ((feedbacksData.results || feedbacksData || []).length || 1);

      setStats({
        total_templates: totalTemplates,
        total_generated: totalGenerated,
        avg_sentiment: avgSent,
        avg_personalization: avgPers,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/tenants/${tenantSlug}/feedback-assistant/templates/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          feedback_type: 'formative',
          sentiment: 'constructive',
          tone: 'professional',
          positivity_level: 7,
          directness_level: 5,
          formality_level: 7,
          opening_template: 'Dear {student_name},',
          strengths_template: 'Your strengths include: {strengths}',
          improvements_template: 'Areas for improvement: {improvements}',
          next_steps_template: 'Next steps: {next_steps}',
          closing_template: 'Keep up the great work!',
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleGenerateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTemplate) return;

    try {
      const res = await fetch(
        `/api/tenants/${tenantSlug}/feedback-assistant/templates/${selectedTemplate}/generate_feedback/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: generateData.student_id,
            student_name: generateData.student_name,
            assessment_title: generateData.assessment_title,
            score: generateData.score ? parseFloat(generateData.score) : null,
            max_score: generateData.max_score ? parseFloat(generateData.max_score) : null,
            grade: generateData.grade,
          }),
        }
      );

      if (res.ok) {
        setShowGenerateForm(false);
        setGenerateData({
          student_id: '',
          student_name: '',
          assessment_title: '',
          score: '',
          max_score: '',
          grade: '',
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
    }
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.5) return 'text-green-600';
    if (score >= 0) return 'text-blue-600';
    if (score >= -0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 0.5) return 'Very Positive';
    if (score >= 0) return 'Positive';
    if (score >= -0.5) return 'Neutral';
    return 'Critical';
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
          <h2 className="text-3xl font-bold text-gray-900">Feedback Assistant</h2>
          <p className="text-gray-600 mt-2">
            Generate personalized feedback with sentiment control and rubric mapping
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-semibold"
        >
          ✨ Create Template
        </button>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Templates</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_templates}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-cyan-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Feedbacks Generated</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_generated}</div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Avg Sentiment</div>
          <div className={`text-3xl font-bold mt-2 ${getSentimentColor(stats.avg_sentiment)}`}>
            {getSentimentLabel(stats.avg_sentiment)}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 uppercase font-semibold">Personalization</div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {(stats.avg_personalization * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-teal-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Create Feedback Template</h3>
          <form onSubmit={handleCreateTemplate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g., Essay Feedback Template"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback Type
                </label>
                <select
                  value={formData.feedback_type}
                  onChange={e => setFormData({ ...formData, feedback_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="formative">Formative</option>
                  <option value="summative">Summative</option>
                  <option value="diagnostic">Diagnostic</option>
                  <option value="peer">Peer Review</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Brief description of this template..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sentiment</label>
                <select
                  value={formData.sentiment}
                  onChange={e => setFormData({ ...formData, sentiment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="encouraging">Encouraging</option>
                  <option value="constructive">Constructive</option>
                  <option value="neutral">Neutral</option>
                  <option value="direct">Direct</option>
                  <option value="motivational">Motivational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                <select
                  value={formData.tone}
                  onChange={e => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="formal">Formal</option>
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="supportive">Supportive</option>
                  <option value="friendly">Friendly</option>
                </select>
              </div>
            </div>

            {/* Sentiment Controls */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 space-y-4">
              <h4 className="font-bold text-gray-900 mb-4">🎛️ Sentiment Controls</h4>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Positivity Level: {formData.positivity_level}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.positivity_level}
                  onChange={e =>
                    setFormData({ ...formData, positivity_level: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Critical</span>
                  <span>Balanced</span>
                  <span>Very Positive</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Directness Level: {formData.directness_level}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.directness_level}
                  onChange={e =>
                    setFormData({ ...formData, directness_level: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Indirect</span>
                  <span>Balanced</span>
                  <span>Very Direct</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formality Level: {formData.formality_level}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.formality_level}
                  onChange={e =>
                    setFormData({ ...formData, formality_level: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Casual</span>
                  <span>Professional</span>
                  <span>Very Formal</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-semibold"
              >
                Create Template
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

      {/* Generate Feedback Form */}
      {showGenerateForm && selectedTemplate && (
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-cyan-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Generate Personalized Feedback</h3>
          <form onSubmit={handleGenerateFeedback} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={generateData.student_id}
                  onChange={e => setGenerateData({ ...generateData, student_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={generateData.student_name}
                  onChange={e => setGenerateData({ ...generateData, student_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assessment Title
              </label>
              <input
                type="text"
                value={generateData.assessment_title}
                onChange={e =>
                  setGenerateData({ ...generateData, assessment_title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Score</label>
                <input
                  type="number"
                  step="0.1"
                  value={generateData.score}
                  onChange={e => setGenerateData({ ...generateData, score: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Score</label>
                <input
                  type="number"
                  step="0.1"
                  value={generateData.max_score}
                  onChange={e => setGenerateData({ ...generateData, max_score: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                <input
                  type="text"
                  value={generateData.grade}
                  onChange={e => setGenerateData({ ...generateData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g., A, B+, HD"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all font-semibold"
              >
                💬 Generate Feedback
              </button>
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Feedback Templates</h3>

        {templates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p>No feedback templates yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-6 hover:border-teal-300 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-gray-900">{template.name}</h4>
                      <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full">
                        {template.template_number}
                      </span>
                      <span className="px-3 py-1 bg-cyan-100 text-cyan-800 text-xs font-semibold rounded-full">
                        {template.sentiment}
                      </span>
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setShowGenerateForm(true);
                    }}
                    className="ml-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all text-sm font-semibold"
                  >
                    Generate
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Type</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {template.feedback_type}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Tone</div>
                    <div className="text-sm font-semibold text-gray-900">{template.tone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Positivity</div>
                    <div className="text-sm font-semibold text-teal-600">
                      {template.positivity_level}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Directness</div>
                    <div className="text-sm font-semibold text-cyan-600">
                      {template.directness_level}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Generated</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {template.total_feedback_generated}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Feedbacks */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Recent Generated Feedbacks</h3>

        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <p>No feedbacks generated yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Feedback ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Words
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Sentiment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Personal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feedbacks.map(feedback => (
                  <tr key={feedback.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{feedback.student_name}</div>
                      <div className="text-sm text-gray-500">{feedback.student_id}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{feedback.feedback_number}</td>
                    <td className="px-4 py-4">
                      {feedback.percentage_score ? (
                        <span className="font-semibold text-gray-900">
                          {feedback.percentage_score.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{feedback.word_count}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`font-semibold ${getSentimentColor(feedback.sentiment_score)}`}
                      >
                        {getSentimentLabel(feedback.sentiment_score)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-blue-600 font-semibold">
                        {(feedback.personalization_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {feedback.requires_review ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                          ⚠️ Review
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          ✓ {feedback.status}
                        </span>
                      )}
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
