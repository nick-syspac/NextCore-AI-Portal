'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

interface ChatMessage {
  id: number;
  message_number: string;
  role: 'student' | 'coach' | 'system';
  content: string;
  model_used?: string;
  total_tokens?: number;
  sentiment?: string;
  created_at: string;
}

interface ChatSession {
  id: number;
  session_number: string;
  student_name: string;
  subject: string;
  topic: string;
  session_type: string;
  status: string;
  message_count: number;
  satisfaction_rating?: number;
  created_at: string;
}

export default function StudyCoachPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);

  // Chat state
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [studentId, setStudentId] = useState('STUDENT001');
  const [studentName, setStudentName] = useState('Alex Johnson');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [sessionType, setSessionType] = useState('general_chat');

  // Sessions history
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Stats
  const [stats, setStats] = useState({
    totalSessions: 15,
    activeSessions: 3,
    totalMessages: 342,
    avgSatisfaction: 4.7,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/study-coach/sessions/send_message/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: currentSession?.id,
            student_id: studentId,
            student_name: studentName,
            message: inputMessage,
            subject: subject,
            topic: topic,
            session_type: sessionType,
          }),
        }
      );
      const data = await response.json();

      setCurrentSession(data.session);
      setMessages([...messages, data.student_message, data.coach_message]);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setSubject('');
    setTopic('');
  };

  const handleRateSession = async (rating: number) => {
    if (!currentSession) return;

    try {
      await fetch(
        `/api/tenants/${tenantSlug}/study-coach/sessions/${currentSession.id}/rate_session/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating }),
        }
      );
    } catch (error) {
      console.error('Error rating session:', error);
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'student'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800';
  };

  const getSentimentEmoji = (sentiment?: string) => {
    const emojis: Record<string, string> = {
      positive: '😊',
      neutral: '😐',
      confused: '😕',
      frustrated: '😤',
      negative: '😟',
    };
    return sentiment ? emojis[sentiment] || '💬' : '💬';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl shadow-lg">
            <span className="text-4xl">🤖</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Study Coach Chatbot</h1>
            <p className="text-lg text-gray-600 mt-1">
              24/7 AI tutor • Contextual LLM chat with vector DB • Scalable student support
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Total Sessions</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalSessions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Active Chats</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeSessions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600">Total Messages</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalMessages}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600">Avg Satisfaction</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">⭐ {stats.avgSatisfaction}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-2 flex gap-2 mb-6">
          {['chat', 'sessions', 'documents', 'insights', 'config'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'chat' && '💬 Live Chat'}
              {tab === 'sessions' && '📜 Session History'}
              {tab === 'documents' && '📚 Knowledge Base'}
              {tab === 'insights' && '📊 Insights'}
              {tab === 'config' && '⚙️ Configuration'}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            {/* Tab: Live Chat */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-6 border border-green-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    💬 24/7 AI Study Coach
                  </h3>
                  <p className="text-sm text-gray-700">
                    Get instant help with homework, exam prep, concept review, and more. Your AI
                    coach is always available!
                  </p>
                </div>

                {/* Session Setup (if no active session) */}
                {!currentSession && messages.length === 0 && (
                  <div className="space-y-4 bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900">Start a New Session</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject (Optional)
                        </label>
                        <input
                          type="text"
                          value={subject}
                          onChange={e => setSubject(e.target.value)}
                          placeholder="e.g., Mathematics, Physics"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Topic (Optional)
                        </label>
                        <input
                          type="text"
                          value={topic}
                          onChange={e => setTopic(e.target.value)}
                          placeholder="e.g., Calculus, Quantum Mechanics"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Session Type
                        </label>
                        <select
                          value={sessionType}
                          onChange={e => setSessionType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="general_chat">General Chat</option>
                          <option value="homework_help">Homework Help</option>
                          <option value="concept_review">Concept Review</option>
                          <option value="exam_prep">Exam Preparation</option>
                          <option value="project_guidance">Project Guidance</option>
                          <option value="career_advice">Career Advice</option>
                          <option value="study_tips">Study Tips</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 h-[500px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <span className="text-6xl">🤖</span>
                        <p className="mt-4 text-lg font-semibold">
                          Start a conversation with your AI Study Coach!
                        </p>
                        <p className="mt-2 text-sm">Type a message below to begin.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] ${msg.role === 'student' ? 'order-2' : 'order-1'}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-600">
                                {msg.role === 'student' ? '👤 You' : '🤖 AI Coach'}
                              </span>
                              {msg.sentiment && (
                                <span className="text-xs">{getSentimentEmoji(msg.sentiment)}</span>
                              )}
                              <span className="text-xs text-gray-400">
                                {new Date(msg.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className={`${getRoleColor(msg.role)} rounded-lg p-3 shadow-sm`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                            {msg.model_used && (
                              <div className="mt-1 text-xs text-gray-400">
                                Model: {msg.model_used} • {msg.total_tokens} tokens
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !loading && handleSendMessage()}
                    placeholder="Type your message here..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !inputMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {loading ? '⏳ Sending...' : '📤 Send'}
                  </button>
                  {currentSession && (
                    <button
                      onClick={handleNewSession}
                      className="px-4 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-all"
                    >
                      🆕 New Session
                    </button>
                  )}
                </div>

                {/* Session Rating */}
                {currentSession && messages.length >= 4 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Rate this session:</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => handleRateSession(rating)}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {rating <= (currentSession.satisfaction_rating || 0) ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Session History */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 border border-purple-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📜 Session History</h3>
                  <p className="text-sm text-gray-700">
                    Review past conversations, analyze engagement patterns, and track learning
                    progress.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      number: 'CHAT-20241024-A1B2C3D4',
                      student: 'Alex Johnson',
                      type: 'Homework Help',
                      subject: 'Calculus',
                      messages: 24,
                      rating: 5,
                      status: 'completed',
                    },
                    {
                      number: 'CHAT-20241023-E5F6G7H8',
                      student: 'Alex Johnson',
                      type: 'Exam Prep',
                      subject: 'Physics',
                      messages: 18,
                      rating: 4,
                      status: 'completed',
                    },
                    {
                      number: 'CHAT-20241023-I9J0K1L2',
                      student: 'Alex Johnson',
                      type: 'Concept Review',
                      subject: 'Chemistry',
                      messages: 12,
                      rating: null,
                      status: 'active',
                    },
                    {
                      number: 'CHAT-20241022-M3N4O5P6',
                      student: 'Alex Johnson',
                      type: 'Study Tips',
                      subject: 'General',
                      messages: 8,
                      rating: 5,
                      status: 'completed',
                    },
                  ].map((session, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {session.type === 'Homework Help' && '📝'}
                            {session.type === 'Exam Prep' && '📚'}
                            {session.type === 'Concept Review' && '🔍'}
                            {session.type === 'Study Tips' && '💡'}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{session.number}</p>
                            <p className="text-sm text-gray-600">
                              {session.type} • {session.subject}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Messages</p>
                            <p className="text-lg font-bold text-green-600">{session.messages}</p>
                          </div>
                          {session.rating ? (
                            <div className="flex items-center gap-1">
                              {Array.from({ length: session.rating }).map((_, i) => (
                                <span key={i} className="text-yellow-400">
                                  ⭐
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Knowledge Base */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-6 border border-blue-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📚 Vector DB Knowledge Base
                  </h3>
                  <p className="text-sm text-gray-700">
                    Contextual document retrieval powered by embeddings. The AI coach searches these
                    materials to provide accurate, relevant answers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Calculus I - Syllabus',
                      type: 'syllabus',
                      subject: 'Mathematics',
                      retrieval: 145,
                      score: 0.92,
                    },
                    {
                      title: 'Physics 101 - Lecture Notes Week 5',
                      type: 'lecture_notes',
                      subject: 'Physics',
                      retrieval: 89,
                      score: 0.88,
                    },
                    {
                      title: 'Chemistry Lab Safety Guidelines',
                      type: 'policy',
                      subject: 'Chemistry',
                      retrieval: 67,
                      score: 0.85,
                    },
                    {
                      title: 'Introduction to Algorithms - Chapter 3',
                      type: 'textbook',
                      subject: 'Computer Science',
                      retrieval: 234,
                      score: 0.95,
                    },
                    {
                      title: 'Statistics FAQ - Common Questions',
                      type: 'faq',
                      subject: 'Statistics',
                      retrieval: 178,
                      score: 0.9,
                    },
                    {
                      title: 'Writing Center - APA Style Guide',
                      type: 'resource',
                      subject: 'English',
                      retrieval: 56,
                      score: 0.82,
                    },
                  ].map((doc, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{doc.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                              {doc.type}
                            </span>
                            <span className="text-xs text-gray-600">{doc.subject}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="text-xs text-gray-600">
                          🔍 Retrieved {doc.retrieval} times
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${doc.score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-green-600">{doc.score}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">💡 How Vector Search Works</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      • Documents are converted to 384-dimensional embeddings using all-MiniLM-L6-v2
                    </p>
                    <p>
                      • When you ask a question, your query is also embedded in the same vector
                      space
                    </p>
                    <p>
                      • The system finds the top 5 most similar documents using cosine similarity
                    </p>
                    <p>
                      • Relevant context is injected into the AI coach's prompt for accurate
                      responses
                    </p>
                    <p>• Similarity threshold: 0.7 (only highly relevant documents are used)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Insights */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-6 border border-orange-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Coaching Insights</h3>
                  <p className="text-sm text-gray-700">
                    Analytics on student engagement, learning patterns, and areas needing attention.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Most Discussed Subjects</h4>
                    <div className="space-y-2">
                      {[
                        { subject: 'Calculus', sessions: 12, color: 'bg-blue-500' },
                        { subject: 'Physics', sessions: 8, color: 'bg-purple-500' },
                        { subject: 'Chemistry', sessions: 6, color: 'bg-green-500' },
                        { subject: 'Statistics', sessions: 4, color: 'bg-yellow-500' },
                      ].map((item, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {item.subject}
                            </span>
                            <span className="text-xs text-gray-500">{item.sessions} sessions</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`${item.color} h-2 rounded-full`}
                              style={{ width: `${(item.sessions / 12) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Session Type Breakdown</h4>
                    <div className="space-y-3">
                      {[
                        { type: 'Homework Help', count: 8, icon: '📝' },
                        { type: 'Concept Review', count: 5, icon: '🔍' },
                        { type: 'Exam Prep', count: 4, icon: '📚' },
                        { type: 'Study Tips', count: 3, icon: '💡' },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm text-gray-700">{item.type}</span>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Engagement Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Avg Session Length</p>
                        <p className="text-2xl font-bold text-green-600">24 min</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sentiment Trend</p>
                        <p className="text-lg font-semibold text-gray-900">📈 Improving</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Follow-ups Needed</p>
                        <p className="text-2xl font-bold text-orange-600">2</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">🎯 Recommended Actions</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>
                      • Schedule follow-up on Quantum Mechanics concepts (student showed confusion)
                    </li>
                    <li>
                      • Provide additional practice problems for Calculus integration techniques
                    </li>
                    <li>• Review study strategies for upcoming Physics midterm</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: Configuration */}
            {activeTab === 'config' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-100 to-slate-100 rounded-lg p-6 border border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ⚙️ AI Coach Configuration
                  </h3>
                  <p className="text-sm text-gray-700">
                    Customize the AI coach's behavior, personality, and technical settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">LLM Settings</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Primary Model
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option>gpt-4</option>
                            <option>gpt-3.5-turbo</option>
                            <option>claude-3-opus</option>
                            <option>claude-3-sonnet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Temperature
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            defaultValue="0.7"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">0.7 (Balanced creativity)</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            defaultValue="500"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Vector DB Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Vector Search Enabled
                          </span>
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Top K Results
                          </label>
                          <input
                            type="number"
                            defaultValue="5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Similarity Threshold
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            defaultValue="0.7"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Coaching Style</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Personality
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option>Encouraging & Supportive</option>
                            <option>Socratic Questioning</option>
                            <option>Direct & Concise</option>
                            <option>Adaptive to Student</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Personality Traits
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {['Patient', 'Empathetic', 'Motivating', 'Knowledgeable'].map(trait => (
                              <span
                                key={trait}
                                className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Safety & Moderation</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Content Filter</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Profanity Filter
                          </span>
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            Crisis Detection
                          </span>
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Availability</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">24/7 Available</span>
                          <input type="checkbox" defaultChecked className="w-5 h-5" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Timezone
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                            <option>UTC</option>
                            <option>America/New_York</option>
                            <option>America/Los_Angeles</option>
                            <option>Europe/London</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg">
                  💾 Save Configuration
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
