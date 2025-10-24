'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface StudentMessage {
  id: number;
  message_number: string;
  student_name: string;
  student_email: string;
  subject: string;
  message_body: string;
  message_type: string;
  priority: string;
  status: string;
  detected_sentiment: string;
  received_date: string;
}

interface DraftReply {
  id: number;
  draft_number: string;
  reply_body: string;
  reply_subject: string;
  tone_used: string;
  confidence_score: number;
  word_count: number;
  was_sent: boolean;
  generated_at: string;
}

interface MessageTemplate {
  id: number;
  template_number: string;
  name: string;
  template_type: string;
  template_body: string;
  usage_count: number;
  is_active: boolean;
}

interface DashboardStats {
  total_messages: number;
  new_messages: number;
  replied_messages: number;
  total_time_saved_hours: number;
  time_saved_percentage: number;
  avg_confidence_score: number;
  total_templates: number;
}

export default function EmailAssistantPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('inbox');
  const [loading, setLoading] = useState(true);

  // Data states
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [drafts, setDrafts] = useState<DraftReply[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Form states
  const [selectedMessage, setSelectedMessage] = useState<StudentMessage | null>(null);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedDraft, setSelectedDraft] = useState<DraftReply | null>(null);
  const [generating, setGenerating] = useState(false);

  // New message form
  const [newMessageForm, setNewMessageForm] = useState({
    student_name: '',
    student_email: '',
    subject: '',
    message_body: '',
    priority: 'medium'
  });

  // Load data
  useEffect(() => {
    loadDashboard();
    loadMessages();
    loadTemplates();
  }, [tenantSlug]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email-assistant/messages/dashboard/?tenant=${tenantSlug}`);
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/email-assistant/messages/?tenant=${tenantSlug}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/email-assistant/templates/?tenant=${tenantSlug}`);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateMessage = async () => {
    try {
      const response = await fetch('/api/email-assistant/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          ...newMessageForm,
          message_type: 'email'
        })
      });

      if (response.ok) {
        alert('Message created successfully!');
        loadMessages();
        loadDashboard();
        setNewMessageForm({
          student_name: '',
          student_email: '',
          subject: '',
          message_body: '',
          priority: 'medium'
        });
      }
    } catch (error) {
      console.error('Failed to create message:', error);
      alert('Failed to create message');
    }
  };

  const handleGenerateReply = async (messageId: number) => {
    try {
      setGenerating(true);
      const response = await fetch('/api/email-assistant/messages/generate_reply/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          tone: selectedTone,
          formality_level: 3,
          include_greeting: true,
          include_signature: true,
          max_words: 200
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Draft generated! Confidence: ${(data.confidence_score * 100).toFixed(0)}%`);
        
        // Load the draft
        const draftResponse = await fetch(`/api/email-assistant/drafts/${data.draft_id}/`);
        const draft = await draftResponse.json();
        setSelectedDraft(draft);
        
        loadMessages();
        loadDashboard();
        setActiveTab('draft');
      }
    } catch (error) {
      console.error('Failed to generate reply:', error);
      alert('Failed to generate reply');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyzeSentiment = async (messageId: number) => {
    try {
      const response = await fetch('/api/email-assistant/messages/analyze_sentiment/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          analyze_urgency: true,
          extract_topics: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Sentiment: ${data.sentiment}\nRecommended tone: ${data.recommended_tone}\nTopics: ${data.detected_topics.join(', ')}`);
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
    }
  };

  const handleRefineTone = async (newTone: string) => {
    if (!selectedDraft) return;

    try {
      const response = await fetch('/api/email-assistant/messages/refine_tone/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: selectedDraft.id,
          new_tone: newTone,
          make_shorter: false,
          make_longer: false,
          add_empathy: newTone === 'empathetic'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Tone refined! Changes: ${data.changes_made.join(', ')}`);
        
        // Reload draft
        const draftResponse = await fetch(`/api/email-assistant/drafts/${selectedDraft.id}/`);
        const draft = await draftResponse.json();
        setSelectedDraft(draft);
      }
    } catch (error) {
      console.error('Failed to refine tone:', error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedDraft) return;

    try {
      const response = await fetch('/api/email-assistant/messages/send_reply/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: selectedDraft.id,
          final_reply_body: selectedDraft.reply_body,
          final_subject: selectedDraft.reply_subject,
          sent_by: 'trainer@example.com',
          edit_count: 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Reply sent! Time saved: ${data.time_saved_percentage.toFixed(1)}%`);
        setSelectedDraft(null);
        setSelectedMessage(null);
        loadMessages();
        loadDashboard();
        setActiveTab('inbox');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getSentimentColor = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-green-100 text-green-800',
      neutral: 'bg-gray-100 text-gray-800',
      negative: 'bg-red-100 text-red-800'
    };
    return colors[sentiment] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading Email Assistant...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">✉️</span>
          <h1 className="text-3xl font-bold text-gray-900">Email/Message Assistant</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800">
            Tone-Controlled LLM
          </span>
        </div>
        <p className="text-gray-600">Draft replies to student queries • Tone-controlled LLM generation • 50% admin time reduction</p>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-teal-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Messages</div>
            <div className="text-2xl font-bold text-teal-600">{dashboardStats.total_messages}</div>
            <div className="text-xs text-gray-500 mt-1">{dashboardStats.new_messages} new</div>
          </div>
          
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Time Saved</div>
            <div className="text-2xl font-bold text-blue-600">{dashboardStats.total_time_saved_hours.toFixed(1)}h</div>
            <div className="text-xs text-gray-500 mt-1">{dashboardStats.time_saved_percentage.toFixed(0)}% efficiency</div>
          </div>
          
          <div className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Replied</div>
            <div className="text-2xl font-bold text-purple-600">{dashboardStats.replied_messages}</div>
            <div className="text-xs text-gray-500 mt-1">Avg confidence: {(dashboardStats.avg_confidence_score * 100).toFixed(0)}%</div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Templates</div>
            <div className="text-2xl font-bold text-green-600">{dashboardStats.total_templates}</div>
            <div className="text-xs text-gray-500 mt-1">Reusable responses</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          {[
            { id: 'inbox', label: '📥 Inbox' },
            { id: 'create', label: '✏️ Create Message' },
            { id: 'draft', label: '📝 Draft Reply' },
            { id: 'templates', label: '📋 Templates' },
            { id: 'dashboard', label: '📊 Dashboard' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
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
        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Student Messages</h2>
            
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No messages yet. Create a test message to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{message.subject}</h3>
                        <p className="text-sm text-gray-600">{message.message_number} • {message.student_name} ({message.student_email})</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                        {message.detected_sentiment && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSentimentColor(message.detected_sentiment)}`}>
                            {message.detected_sentiment}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{message.message_body}</p>
                    
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setSelectedMessage(message);
                          handleAnalyzeSentiment(message.id);
                        }}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                      >
                        🎯 Analyze
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedTone}
                          onChange={(e) => setSelectedTone(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="professional">Professional</option>
                          <option value="friendly">Friendly</option>
                          <option value="empathetic">Empathetic</option>
                          <option value="formal">Formal</option>
                          <option value="casual">Casual</option>
                        </select>
                        
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            handleGenerateReply(message.id);
                          }}
                          disabled={generating}
                          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium text-sm disabled:opacity-50"
                        >
                          {generating ? '⏳ Generating...' : '✨ Generate Reply'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Message Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Test Message</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">Create test student messages to try out the AI reply generation features.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={newMessageForm.student_name}
                onChange={(e) => setNewMessageForm({ ...newMessageForm, student_name: e.target.value })}
                placeholder="Student Name"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                value={newMessageForm.student_email}
                onChange={(e) => setNewMessageForm({ ...newMessageForm, student_email: e.target.value })}
                placeholder="Student Email"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <input
              type="text"
              value={newMessageForm.subject}
              onChange={(e) => setNewMessageForm({ ...newMessageForm, subject: e.target.value })}
              placeholder="Subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            
            <textarea
              value={newMessageForm.message_body}
              onChange={(e) => setNewMessageForm({ ...newMessageForm, message_body: e.target.value })}
              placeholder="Message Body"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            
            <select
              value={newMessageForm.priority}
              onChange={(e) => setNewMessageForm({ ...newMessageForm, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
            
            <button
              onClick={handleCreateMessage}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
            >
              ➕ Create Message
            </button>
          </div>
        )}

        {/* Draft Reply Tab */}
        {activeTab === 'draft' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Draft Reply</h2>
            
            {!selectedDraft ? (
              <div className="text-center py-12 text-gray-500">
                No draft selected. Generate a reply from the Inbox tab.
              </div>
            ) : (
              <>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Original Message</h3>
                  <p className="text-sm text-gray-600 mb-1">From: {selectedMessage?.student_name}</p>
                  <p className="text-sm text-gray-700">{selectedMessage?.message_body}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Refine Tone</label>
                  <div className="flex gap-2">
                    {['professional', 'friendly', 'empathetic', 'formal', 'casual'].map((tone) => (
                      <button
                        key={tone}
                        onClick={() => handleRefineTone(tone)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedDraft.tone_used === tone
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white border-2 border-teal-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Generated Reply</h3>
                      <p className="text-sm text-gray-600">{selectedDraft.draft_number} • {selectedDraft.tone_used} tone</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-teal-600">
                        {(selectedDraft.confidence_score * 100).toFixed(0)}% confidence
                      </div>
                      <div className="text-xs text-gray-500">{selectedDraft.word_count} words</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                    <input
                      type="text"
                      value={selectedDraft.reply_subject}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reply:</label>
                    <textarea
                      value={selectedDraft.reply_body}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      readOnly
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendReply}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
                    >
                      📧 Send Reply
                    </button>
                    <button
                      onClick={() => setSelectedDraft(null)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      ❌ Discard
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Message Templates</h2>
            
            {templates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No templates created yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.template_number}</p>
                      </div>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {template.template_type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{template.template_body.substring(0, 150)}...</p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Used {template.usage_count} times</span>
                      <span className={`px-2 py-1 rounded ${template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboardStats && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-teal-900">{dashboardStats.total_time_saved_hours.toFixed(1)}h</div>
                <div className="text-sm text-teal-700">Total Time Saved</div>
                <div className="text-xs text-teal-600 mt-1">{dashboardStats.time_saved_percentage.toFixed(0)}% reduction</div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                <div className="text-3xl mb-2">✅</div>
                <div className="text-2xl font-bold text-blue-900">{dashboardStats.replied_messages}</div>
                <div className="text-sm text-blue-700">Messages Replied</div>
                <div className="text-xs text-blue-600 mt-1">{dashboardStats.new_messages} pending</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-purple-900">{(dashboardStats.avg_confidence_score * 100).toFixed(0)}%</div>
                <div className="text-sm text-purple-700">Avg Confidence</div>
                <div className="text-xs text-purple-600 mt-1">AI quality score</div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">💰 Admin Time Reduction</h3>
              <div className="space-y-2 text-sm text-green-800">
                <p>• <strong>{dashboardStats.time_saved_percentage.toFixed(0)}%</strong> reduction in email response time</p>
                <p>• <strong>{dashboardStats.total_time_saved_hours.toFixed(1)} hours</strong> saved overall</p>
                <p>• <strong>{dashboardStats.replied_messages}</strong> student queries handled with AI assistance</p>
                <p>• <strong>{(dashboardStats.avg_confidence_score * 100).toFixed(0)}%</strong> average confidence in generated replies</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
