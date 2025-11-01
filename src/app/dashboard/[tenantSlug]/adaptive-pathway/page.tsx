'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

interface LearningStep {
  id: number;
  step_number: string;
  title: string;
  description: string;
  content_type: string;
  sequence_order: number;
  estimated_minutes: number;
  difficulty_rating: number;
  status: string;
  completion_score: number | null;
}

interface LearningPathway {
  id: number;
  pathway_number: string;
  pathway_name: string;
  description: string;
  difficulty_level: string;
  estimated_duration_hours: number;
  recommendation_confidence: number;
  similarity_score: number;
  status: string;
  total_steps: number;
  completed_steps: number;
  completion_percentage: number;
  steps: LearningStep[];
}

interface PathwayRecommendation {
  id: number;
  recommendation_number: string;
  pathway_name: string;
  pathway_description: string;
  algorithm_used: string;
  recommendation_score: number;
  collaborative_score: number;
  embedding_similarity: number;
  similar_students_count: number;
  recommendation_reasons: string[];
  recommended_pathway: number;
}

export default function AdaptivePathwayPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('recommend');
  const [loading, setLoading] = useState(false);

  // Form state
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [interests, setInterests] = useState('');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [timeCommitment, setTimeCommitment] = useState(10);

  // Results state
  const [recommendations, setRecommendations] = useState<PathwayRecommendation[]>([]);
  const [currentPathway, setCurrentPathway] = useState<LearningPathway | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({
    activePathways: 12,
    completionRate: 78,
    avgDuration: 24.5,
    totalRecommendations: 45,
  });

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/adaptive-pathway/pathways/recommend_pathway/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            student_name: studentName,
            current_skill_level: skillLevel,
            interests: interests
              .split(',')
              .map(i => i.trim())
              .filter(Boolean),
            learning_style: learningStyle,
            time_commitment_hours: timeCommitment,
          }),
        }
      );
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setActiveTab('pathway');
    } catch (error) {
      console.error('Error getting recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-800 border-green-300',
      intermediate: 'bg-blue-100 text-blue-800 border-blue-300',
      advanced: 'bg-purple-100 text-purple-800 border-purple-300',
      expert: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[level] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      video: '🎥',
      reading: '📖',
      quiz: '📝',
      assignment: '✍️',
      project: '🎯',
      discussion: '💬',
      interactive: '🎮',
      lab: '🔬',
    };
    return icons[type] || '📄';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: 'bg-gray-200 text-gray-700',
      in_progress: 'bg-blue-200 text-blue-700',
      completed: 'bg-green-200 text-green-700',
      skipped: 'bg-yellow-200 text-yellow-700',
    };
    return colors[status] || 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
            <span className="text-4xl">🎓</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Adaptive Learning Pathway</h1>
            <p className="text-lg text-gray-600 mt-1">
              Collaborative filtering + embeddings • Personalized learning recommendations
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600">Active Pathways</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activePathways}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completionRate}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Avg Duration (hrs)</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.avgDuration}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-600">Recommendations</p>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalRecommendations}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'recommend', label: '🎯 Recommend Pathway', icon: '🤖' },
                { id: 'pathway', label: '📊 My Pathway', icon: '📈' },
                { id: 'progress', label: '⏱️ Progress Tracking', icon: '📊' },
                { id: 'analytics', label: '📈 Completion Analytics', icon: '📊' },
                { id: 'algorithm', label: '🧠 Algorithm Info', icon: '⚙️' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab: Recommend Pathway */}
            {activeTab === 'recommend' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-6 border border-purple-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🤖 Get Personalized Recommendations
                  </h3>
                  <p className="text-sm text-gray-700">
                    Our hybrid algorithm combines collaborative filtering with content embeddings to
                    recommend optimal learning pathways based on similar students and your
                    interests.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., STU-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Skill Level
                    </label>
                    <select
                      value={skillLevel}
                      onChange={e => setSkillLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Style
                    </label>
                    <select
                      value={learningStyle}
                      onChange={e => setLearningStyle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="kinesthetic">Kinesthetic</option>
                      <option value="reading">Reading/Writing</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Interests (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={interests}
                      onChange={e => setInterests(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., python, data science, machine learning, web development"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Commitment (hours/week): {timeCommitment}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={timeCommitment}
                      onChange={e => setTimeCommitment(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>5 hrs</span>
                      <span>40 hrs</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRecommend}
                  disabled={loading || !studentId || !studentName}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {loading ? '🔄 Generating Recommendations...' : '🚀 Get Pathway Recommendations'}
                </button>
              </div>
            )}

            {/* Tab: My Pathway */}
            {activeTab === 'pathway' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-lg p-6 border border-indigo-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📊 Your Recommended Pathways
                  </h3>
                  <p className="text-sm text-gray-700">
                    Top 5 learning pathways personalized for you using collaborative filtering and
                    content similarity.
                  </p>
                </div>

                {recommendations.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl">🎯</span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-4">
                      No Recommendations Yet
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Generate pathway recommendations from the &quot;Recommend Pathway&quot; tab
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={rec.id}
                        className="bg-white rounded-lg border-2 border-purple-200 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-purple-600">
                                #{index + 1}
                              </span>
                              <h4 className="text-xl font-bold text-gray-900">
                                {rec.pathway_name}
                              </h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{rec.pathway_description}</p>
                          </div>
                          <div className="ml-4">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-purple-600">
                                {(rec.recommendation_score * 100).toFixed(0)}%
                              </p>
                              <p className="text-xs text-gray-500">Match Score</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-600">Collaborative</p>
                            <p className="text-lg font-bold text-purple-600">
                              {(rec.collaborative_score * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="bg-indigo-50 rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-600">Content Similarity</p>
                            <p className="text-lg font-bold text-indigo-600">
                              {(rec.embedding_similarity * 100).toFixed(0)}%
                            </p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <p className="text-sm text-gray-600">Similar Students</p>
                            <p className="text-lg font-bold text-blue-600">
                              {rec.similar_students_count}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            💡 Why This Pathway?
                          </p>
                          <ul className="space-y-1">
                            {rec.recommendation_reasons.map((reason, idx) => (
                              <li
                                key={idx}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-purple-600">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
                            ✓ Accept Pathway
                          </button>
                          <button className="px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Progress Tracking */}
            {activeTab === 'progress' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-6 border border-blue-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ⏱️ Track Your Progress
                  </h3>
                  <p className="text-sm text-gray-700">
                    Monitor engagement metrics, time spent, and adaptive recommendations for your
                    learning journey.
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Current Learning Path</h4>

                  {/* Sample Progress Data */}
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Introduction to Python',
                        type: 'video',
                        status: 'completed',
                        score: 95,
                        time: 45,
                      },
                      {
                        title: 'Python Data Structures',
                        type: 'reading',
                        status: 'in_progress',
                        score: null,
                        time: 23,
                      },
                      {
                        title: 'Functions and Modules',
                        type: 'quiz',
                        status: 'not_started',
                        score: null,
                        time: 0,
                      },
                      {
                        title: 'OOP Concepts',
                        type: 'assignment',
                        status: 'not_started',
                        score: null,
                        time: 0,
                      },
                    ].map((step, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <span className="text-2xl">{getContentTypeIcon(step.type)}</span>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{step.title}</h5>
                          <div className="flex items-center gap-3 mt-1">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(step.status)}`}
                            >
                              {step.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">⏱️ {step.time} min</span>
                            {step.score && (
                              <span className="text-sm font-semibold text-green-600">
                                ✓ {step.score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Engagement Level</p>
                    <p className="text-2xl font-bold text-purple-600">High 📈</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Learning Pace</p>
                    <p className="text-2xl font-bold text-blue-600">On Track ✓</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-600">82% 🎯</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Completion Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border border-green-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📈 Completion Rate Analytics
                  </h3>
                  <p className="text-sm text-gray-700">
                    Higher course completion rates achieved through personalized pathway
                    recommendations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Completion by Difficulty</h4>
                    <div className="space-y-3">
                      {[
                        { level: 'Beginner', rate: 85, count: 24 },
                        { level: 'Intermediate', rate: 72, count: 18 },
                        { level: 'Advanced', rate: 68, count: 12 },
                        { level: 'Expert', rate: 54, count: 6 },
                      ].map(item => (
                        <div key={item.level}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{item.level}</span>
                            <span className="text-gray-600">
                              {item.rate}% ({item.count} pathways)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${item.rate}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Algorithm Performance</h4>
                    <div className="space-y-4">
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-gray-600">Collaborative Filtering</p>
                        <p className="text-2xl font-bold text-purple-600">87% accuracy</p>
                        <p className="text-xs text-gray-500 mt-1">Based on 1,245 recommendations</p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                        <p className="text-sm text-gray-600">Embedding Similarity</p>
                        <p className="text-2xl font-bold text-indigo-600">0.82 avg score</p>
                        <p className="text-xs text-gray-500 mt-1">Cosine similarity metric</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-gray-600">Hybrid Model</p>
                        <p className="text-2xl font-bold text-blue-600">91% satisfaction</p>
                        <p className="text-xs text-gray-500 mt-1">Student feedback rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Impact Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">+23%</p>
                      <p className="text-sm text-gray-600 mt-1">Completion Increase</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">-18%</p>
                      <p className="text-sm text-gray-600 mt-1">Dropout Reduction</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">4.6/5</p>
                      <p className="text-sm text-gray-600 mt-1">Avg Pathway Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-indigo-600">32hrs</p>
                      <p className="text-sm text-gray-600 mt-1">Avg Time Saved</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Algorithm Info */}
            {activeTab === 'algorithm' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-6 border border-indigo-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🧠 Hybrid Recommendation Algorithm
                  </h3>
                  <p className="text-sm text-gray-700">
                    Combining collaborative filtering with content embeddings for optimal pathway
                    recommendations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border-2 border-purple-300 p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🤝</span>
                      Collaborative Filtering (60% weight)
                    </h4>
                    <p className="text-sm text-gray-700 mb-4">
                      Find students with similar learning patterns using Jaccard similarity on
                      completed steps.
                    </p>
                    <div className="bg-purple-50 rounded p-3 font-mono text-sm mb-3">
                      similarity = |A ∩ B| / |A ∪ B|
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span>Identify students with &gt; 30% step overlap</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span>Rank pathways by popularity among similar students</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span>Weight by completion rates and engagement</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg border-2 border-indigo-300 p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🎯</span>
                      Content Embeddings (40% weight)
                    </h4>
                    <p className="text-sm text-gray-700 mb-4">
                      Use semantic embeddings to match pathway content with student interests.
                    </p>
                    <div className="bg-indigo-50 rounded p-3 font-mono text-sm mb-3">
                      similarity = cosine(v₁, v₂)
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">✓</span>
                        <span>384-dim vectors from all-MiniLM-L6-v2</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">✓</span>
                        <span>Match tags, objectives, and descriptions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">✓</span>
                        <span>Cosine similarity for content matching</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">🔄 Recommendation Pipeline</h4>
                  <div className="space-y-3">
                    {[
                      {
                        step: 1,
                        title: 'Find Similar Students',
                        desc: 'Jaccard similarity on completed steps',
                        color: 'purple',
                      },
                      {
                        step: 2,
                        title: 'Get Candidate Pathways',
                        desc: 'Pathways from similar students (same skill level)',
                        color: 'blue',
                      },
                      {
                        step: 3,
                        title: 'Calculate CF Score',
                        desc: 'Popularity + completion rate among similar students',
                        color: 'indigo',
                      },
                      {
                        step: 4,
                        title: 'Calculate Embedding Score',
                        desc: 'Content similarity with student interests',
                        color: 'violet',
                      },
                      {
                        step: 5,
                        title: 'Hybrid Score',
                        desc: '(0.6 × CF) + (0.4 × Embeddings)',
                        color: 'purple',
                      },
                      {
                        step: 6,
                        title: 'Return Top 5',
                        desc: 'Ranked by hybrid score with reasons',
                        color: 'pink',
                      },
                    ].map(item => (
                      <div
                        key={item.step}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-8 h-8 rounded-full bg-${item.color}-600 text-white font-bold flex items-center justify-center flex-shrink-0`}
                        >
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3">✨ Adaptive Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        📊 Personalization Factors
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Learning style (visual, auditory, kinesthetic)</li>
                        <li>• Skill level (beginner to expert)</li>
                        <li>• Time commitment availability</li>
                        <li>• Topic interests and preferences</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        🎯 Continuous Improvement
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Track engagement and struggle indicators</li>
                        <li>• Adjust difficulty based on performance</li>
                        <li>• Update recommendations with new data</li>
                        <li>• Optimize based on user feedback</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
