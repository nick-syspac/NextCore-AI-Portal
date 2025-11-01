'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface DiaryEntry {
  id: number;
  entry_number: string;
  trainer_name: string;
  session_date: string;
  course_name: string;
  course_code: string;
  student_count: number;
  session_duration_minutes: number;
  delivery_mode: string;
  raw_transcript: string;
  manual_notes: string;
  session_summary: string;
  key_topics_covered: string[];
  follow_up_actions: string[];
  entry_status: string;
  created_at: string;
}

interface AudioRecording {
  id: number;
  recording_number: string;
  recording_filename: string;
  recording_duration_seconds: number;
  processing_status: string;
  transcript_text: string;
  transcript_confidence: number;
  uploaded_at: string;
}

interface DailySummary {
  id: number;
  summary_number: string;
  summary_date: string;
  total_sessions: number;
  total_teaching_hours: number;
  total_students: number;
  daily_highlights: string;
  key_achievements: string[];
}

interface EvidenceDocument {
  id: number;
  document_number: string;
  document_title: string;
  document_type: string;
  document_format: string;
  created_at: string;
}

interface DashboardStats {
  total_entries: number;
  entries_this_week: number;
  entries_this_month: number;
  total_teaching_hours: number;
  total_students_taught: number;
  total_recordings: number;
  pending_transcriptions: number;
  daily_summaries_count: number;
  evidence_documents_count: number;
  recent_entries: DiaryEntry[];
  courses_taught: string[];
}

export default function TrainerDiaryPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('record');
  const [loading, setLoading] = useState(true);

  // Data states
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [recordings, setRecordings] = useState<AudioRecording[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [evidenceDocuments, setEvidenceDocuments] = useState<EvidenceDocument[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Form states
  const [diaryForm, setDiaryForm] = useState({
    trainer_id: 'trainer-001',
    trainer_name: 'John Smith',
    session_date: new Date().toISOString().split('T')[0],
    session_time_start: '',
    session_time_end: '',
    session_duration_minutes: 0,
    course_name: '',
    course_code: '',
    unit_of_competency: '',
    student_count: 0,
    delivery_mode: 'face_to_face',
    manual_notes: '',
    learning_outcomes_addressed: [] as string[],
    assessment_activities: '',
    resources_used: [] as string[],
  });

  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [selectedEntryForAudio, setSelectedEntryForAudio] = useState<number | null>(null);
  const [selectedEntryForSummary, setSelectedEntryForSummary] = useState<number | null>(null);

  // Load data
  useEffect(() => {
    loadDashboard();
    loadDiaryEntries();
    loadRecordings();
    loadDailySummaries();
    loadEvidenceDocuments();
  }, [tenantSlug]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/trainer-diary/diary-entries/dashboard/?tenant=${tenantSlug}&trainer_id=trainer-001`
      );
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiaryEntries = async () => {
    try {
      const response = await fetch(
        `/api/trainer-diary/diary-entries/?tenant=${tenantSlug}&trainer_id=trainer-001`
      );
      const data = await response.json();
      setDiaryEntries(data);
    } catch (error) {
      console.error('Failed to load diary entries:', error);
    }
  };

  const loadRecordings = async () => {
    try {
      const response = await fetch(`/api/trainer-diary/audio-recordings/`);
      const data = await response.json();
      setRecordings(data);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    }
  };

  const loadDailySummaries = async () => {
    try {
      const response = await fetch(
        `/api/trainer-diary/daily-summaries/?tenant=${tenantSlug}&trainer_id=trainer-001`
      );
      const data = await response.json();
      setDailySummaries(data);
    } catch (error) {
      console.error('Failed to load daily summaries:', error);
    }
  };

  const loadEvidenceDocuments = async () => {
    try {
      const response = await fetch(`/api/trainer-diary/evidence-documents/`);
      const data = await response.json();
      setEvidenceDocuments(data);
    } catch (error) {
      console.error('Failed to load evidence documents:', error);
    }
  };

  const handleRecordSession = async () => {
    try {
      const response = await fetch('/api/trainer-diary/diary-entries/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          ...diaryForm,
        }),
      });

      if (response.ok) {
        alert('Session recorded successfully!');
        loadDiaryEntries();
        loadDashboard();
        // Reset form
        setDiaryForm({
          ...diaryForm,
          course_name: '',
          course_code: '',
          unit_of_competency: '',
          student_count: 0,
          manual_notes: '',
          assessment_activities: '',
        });
      }
    } catch (error) {
      console.error('Failed to record session:', error);
      alert('Failed to record session');
    }
  };

  const handleUploadAudio = async () => {
    if (!selectedAudioFile || !selectedEntryForAudio) {
      alert('Please select a diary entry and audio file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('diary_entry_id', selectedEntryForAudio.toString());
      formData.append('audio_file', selectedAudioFile);
      formData.append('recording_filename', selectedAudioFile.name);
      formData.append('language', 'en');

      const response = await fetch('/api/trainer-diary/diary-entries/upload-audio/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Audio uploaded successfully! Recording: ${data.recording_number}`);
        loadRecordings();
        loadDashboard();
        setSelectedAudioFile(null);
      }
    } catch (error) {
      console.error('Failed to upload audio:', error);
      alert('Failed to upload audio');
    }
  };

  const handleTranscribe = async (recordingId: number) => {
    try {
      const response = await fetch('/api/trainer-diary/diary-entries/transcribe-audio/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recording_id: recordingId,
          transcription_engine: 'whisper',
          language: 'en',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Transcription queued! Job: ${data.job_number}`);
        loadRecordings();
      }
    } catch (error) {
      console.error('Failed to start transcription:', error);
      alert('Failed to start transcription');
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedEntryForSummary) {
      alert('Please select a diary entry');
      return;
    }

    try {
      const response = await fetch('/api/trainer-diary/diary-entries/generate-summary/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diary_entry_id: selectedEntryForSummary,
          include_transcript: true,
          include_manual_notes: true,
          summary_style: 'detailed',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Summary generated successfully!');
        loadDiaryEntries();
        loadDashboard();
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert('Failed to generate summary');
    }
  };

  const handleCreateDailySummary = async (date: string) => {
    try {
      const response = await fetch('/api/trainer-diary/diary-entries/create-daily-summary/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainer_id: 'trainer-001',
          summary_date: date,
          include_draft_entries: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Daily summary created! ${data.message}`);
        loadDailySummaries();
        loadDashboard();
      }
    } catch (error) {
      console.error('Failed to create daily summary:', error);
      alert('Failed to create daily summary');
    }
  };

  const handleGenerateEvidence = async (entryId: number, docType: string) => {
    try {
      const response = await fetch('/api/trainer-diary/diary-entries/generate-evidence/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diary_entry_id: entryId,
          document_type: docType,
          document_format: 'markdown',
          include_attachments: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Evidence generated! ${data.document_title}`);
        loadEvidenceDocuments();
        loadDashboard();
      }
    } catch (error) {
      console.error('Failed to generate evidence:', error);
      alert('Failed to generate evidence');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      transcribing: 'bg-blue-100 text-blue-800',
      summarizing: 'bg-purple-100 text-purple-800',
      complete: 'bg-teal-100 text-teal-800',
      archived: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProcessingColor = (status: string) => {
    const colors: Record<string, string> = {
      uploaded: 'bg-blue-100 text-blue-800',
      queued: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-purple-100 text-purple-800',
      completed: 'bg-teal-100 text-teal-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading Trainer Diary...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🎤</span>
          <h1 className="text-3xl font-bold text-gray-900">Trainer Diary Writer</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800">
            Speech-to-Text + AI
          </span>
        </div>
        <p className="text-gray-600">
          Auto-summarise teaching sessions with speech-to-text and AI. Daily evidence creation.
        </p>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-teal-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Entries</div>
            <div className="text-2xl font-bold text-teal-600">{dashboardStats.total_entries}</div>
            <div className="text-xs text-gray-500 mt-1">
              {dashboardStats.entries_this_week} this week
            </div>
          </div>

          <div className="bg-white border-2 border-cyan-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Teaching Hours</div>
            <div className="text-2xl font-bold text-cyan-600">
              {dashboardStats.total_teaching_hours}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {dashboardStats.total_students_taught} students taught
            </div>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Audio Recordings</div>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardStats.total_recordings}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {dashboardStats.pending_transcriptions} pending
            </div>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Daily Summaries</div>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardStats.daily_summaries_count}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {dashboardStats.evidence_documents_count} evidence docs
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          {[
            { id: 'record', label: '📝 Record Session' },
            { id: 'upload', label: '🎙️ Upload Audio' },
            { id: 'sessions', label: '📚 Sessions' },
            { id: 'transcripts', label: '💬 Transcripts' },
            { id: 'daily', label: '📅 Daily Summaries' },
            { id: 'evidence', label: '📋 Evidence' },
          ].map(tab => (
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
        {/* Record Session Tab */}
        {activeTab === 'record' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Record Teaching Session</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Date</label>
                <input
                  type="date"
                  value={diaryForm.session_date}
                  onChange={e => setDiaryForm({ ...diaryForm, session_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={diaryForm.session_duration_minutes}
                  onChange={e =>
                    setDiaryForm({
                      ...diaryForm,
                      session_duration_minutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                <input
                  type="text"
                  value={diaryForm.course_name}
                  onChange={e => setDiaryForm({ ...diaryForm, course_name: e.target.value })}
                  placeholder="e.g., Certificate IV in Training and Assessment"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                <input
                  type="text"
                  value={diaryForm.course_code}
                  onChange={e => setDiaryForm({ ...diaryForm, course_code: e.target.value })}
                  placeholder="e.g., TAE40116"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Competency
                </label>
                <input
                  type="text"
                  value={diaryForm.unit_of_competency}
                  onChange={e => setDiaryForm({ ...diaryForm, unit_of_competency: e.target.value })}
                  placeholder="e.g., TAEDES401"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Students
                </label>
                <input
                  type="number"
                  value={diaryForm.student_count}
                  onChange={e =>
                    setDiaryForm({ ...diaryForm, student_count: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Mode
                </label>
                <select
                  value={diaryForm.delivery_mode}
                  onChange={e => setDiaryForm({ ...diaryForm, delivery_mode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="face_to_face">Face to Face</option>
                  <option value="online_live">Online Live</option>
                  <option value="online_self_paced">Online Self-Paced</option>
                  <option value="blended">Blended</option>
                  <option value="workplace">Workplace</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Manual Notes</label>
                <textarea
                  value={diaryForm.manual_notes}
                  onChange={e => setDiaryForm({ ...diaryForm, manual_notes: e.target.value })}
                  placeholder="Enter your notes about the session..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Activities
                </label>
                <textarea
                  value={diaryForm.assessment_activities}
                  onChange={e =>
                    setDiaryForm({ ...diaryForm, assessment_activities: e.target.value })
                  }
                  placeholder="Describe assessment activities conducted..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              onClick={handleRecordSession}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
            >
              📝 Record Session
            </button>
          </div>
        )}

        {/* Upload Audio Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Audio Recording</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Diary Entry
                </label>
                <select
                  value={selectedEntryForAudio || ''}
                  onChange={e => setSelectedEntryForAudio(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Select a session --</option>
                  {diaryEntries.map(entry => (
                    <option key={entry.id} value={entry.id}>
                      {entry.session_date} - {entry.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audio File (MP3, WAV, M4A)
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => setSelectedAudioFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {selectedAudioFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {selectedAudioFile.name} (
                    {(selectedAudioFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Upload your teaching session audio for automatic
                  speech-to-text transcription. Supports MP3, WAV, and M4A formats up to 100MB.
                </p>
              </div>

              <button
                onClick={handleUploadAudio}
                disabled={!selectedAudioFile || !selectedEntryForAudio}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🎙️ Upload & Transcribe
              </button>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Teaching Sessions</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">
                  Generate Summary For:
                </label>
                <select
                  value={selectedEntryForSummary || ''}
                  onChange={e => setSelectedEntryForSummary(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mr-2"
                >
                  <option value="">-- Select session --</option>
                  {diaryEntries.map(entry => (
                    <option key={entry.id} value={entry.id}>
                      {entry.session_date} - {entry.course_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateSummary}
                  disabled={!selectedEntryForSummary}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md font-medium disabled:opacity-50"
                >
                  ✨ Generate AI Summary
                </button>
              </div>
            </div>

            {diaryEntries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No teaching sessions recorded yet. Record your first session in the "Record Session"
                tab.
              </div>
            ) : (
              <div className="space-y-4">
                {diaryEntries.map(entry => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{entry.course_name}</h3>
                        <p className="text-sm text-gray-600">
                          {entry.entry_number} • {entry.session_date}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.entry_status)}`}
                      >
                        {entry.entry_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">
                          {entry.session_duration_minutes} min
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Students:</span>
                        <span className="ml-2 font-medium">{entry.student_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Code:</span>
                        <span className="ml-2 font-medium">{entry.course_code || 'N/A'}</span>
                      </div>
                    </div>

                    {entry.session_summary && (
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-3">
                        <div className="font-medium text-teal-900 mb-1">AI Summary:</div>
                        <p className="text-sm text-teal-800">{entry.session_summary}</p>
                      </div>
                    )}

                    {entry.key_topics_covered && entry.key_topics_covered.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-700 mb-1">Key Topics:</div>
                        <div className="flex flex-wrap gap-2">
                          {entry.key_topics_covered.map((topic, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.follow_up_actions && entry.follow_up_actions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Follow-up Actions:
                        </div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {entry.follow_up_actions.map((action, idx) => (
                            <li key={idx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => handleGenerateEvidence(entry.id, 'teaching_evidence')}
                        className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors"
                      >
                        📋 Generate Evidence
                      </button>
                      <button
                        onClick={() => handleGenerateEvidence(entry.id, 'session_plan')}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        📝 Session Plan
                      </button>
                      <button
                        onClick={() => handleGenerateEvidence(entry.id, 'professional_reflection')}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                      >
                        💭 Reflection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transcripts Tab */}
        {activeTab === 'transcripts' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Audio Transcripts</h2>

            {recordings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No audio recordings uploaded yet. Upload audio in the "Upload Audio" tab.
              </div>
            ) : (
              <div className="space-y-4">
                {recordings.map(recording => (
                  <div key={recording.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{recording.recording_filename}</h3>
                        <p className="text-sm text-gray-600">{recording.recording_number}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getProcessingColor(recording.processing_status)}`}
                      >
                        {recording.processing_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">
                          {Math.floor(recording.recording_duration_seconds / 60)} min
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confidence:</span>
                        <span className="ml-2 font-medium">
                          {recording.transcript_confidence
                            ? `${(recording.transcript_confidence * 100).toFixed(1)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {recording.transcript_text && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <div className="font-medium text-gray-900 mb-1">Transcript:</div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {recording.transcript_text}
                        </p>
                      </div>
                    )}

                    {recording.processing_status === 'uploaded' && (
                      <button
                        onClick={() => handleTranscribe(recording.id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md font-medium"
                      >
                        🎤 Start Transcription
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Daily Summaries Tab */}
        {activeTab === 'daily' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Daily Summaries</h2>
              <button
                onClick={() => handleCreateDailySummary(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
              >
                📅 Create Today's Summary
              </button>
            </div>

            {dailySummaries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No daily summaries created yet. Create your first daily summary above.
              </div>
            ) : (
              <div className="space-y-4">
                {dailySummaries.map(summary => (
                  <div
                    key={summary.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{summary.summary_date}</h3>
                        <p className="text-sm text-gray-600">{summary.summary_number}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-teal-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Sessions</div>
                        <div className="text-xl font-bold text-teal-600">
                          {summary.total_sessions}
                        </div>
                      </div>
                      <div className="bg-cyan-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Teaching Hours</div>
                        <div className="text-xl font-bold text-cyan-600">
                          {summary.total_teaching_hours}
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Students</div>
                        <div className="text-xl font-bold text-blue-600">
                          {summary.total_students}
                        </div>
                      </div>
                    </div>

                    {summary.daily_highlights && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="font-medium text-yellow-900 mb-1">Daily Highlights:</div>
                        <p className="text-sm text-yellow-800">{summary.daily_highlights}</p>
                      </div>
                    )}

                    {summary.key_achievements && summary.key_achievements.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Key Achievements:
                        </div>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {summary.key_achievements.map((achievement, idx) => (
                            <li key={idx}>{achievement}</li>
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

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Evidence Documents</h2>

            {evidenceDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No evidence documents generated yet. Generate evidence from the "Sessions" tab.
              </div>
            ) : (
              <div className="space-y-4">
                {evidenceDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{doc.document_title}</h3>
                        <p className="text-sm text-gray-600">{doc.document_number}</p>
                      </div>
                      <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                        {doc.document_type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>Format: {doc.document_format.toUpperCase()}</span>
                      <span>•</span>
                      <span>Created: {new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>

                    <button className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium">
                      📥 Download
                    </button>
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
