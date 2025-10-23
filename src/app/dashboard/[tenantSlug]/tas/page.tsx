'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface TASTemplate {
  id: number;
  name: string;
  description: string;
  template_type: string;
  template_type_display: string;
  aqf_level: string;
  aqf_level_display: string;
  structure: any;
  default_sections: string[];
  gpt_prompts: Record<string, string>;
  is_active: boolean;
  is_system_template: boolean;
  created_by: number;
  created_by_details: User;
  created_at: string;
  updated_at: string;
}

interface TAS {
  id: number;
  tenant: number;
  title: string;
  code: string;
  description: string;
  qualification_name: string;
  aqf_level: string;
  aqf_level_display: string;
  training_package: string;
  template: number | null;
  template_details: TASTemplate | null;
  sections: any[];
  status: string;
  status_display: string;
  version: number;
  is_current_version: boolean;
  gpt_generated: boolean;
  gpt_generation_date: string | null;
  gpt_model_used: string;
  gpt_tokens_used: number;
  generation_time_seconds: number;
  content: any;
  metadata: any;
  time_saved: {
    traditional_hours: number;
    gpt_hours: number;
    saved_hours: number;
    percentage_saved: number;
  } | null;
  version_count: number;
  created_by: number;
  created_by_details: User;
  created_at: string;
  updated_at: string;
}

interface TASVersion {
  id: number;
  tas: number;
  version_number: number;
  change_summary: string;
  changed_sections: string[];
  content_diff: any;
  was_regenerated: boolean;
  regeneration_reason: string;
  created_by: number;
  created_by_details: User;
  created_at: string;
}

interface GenerationLog {
  id: number;
  tas: number;
  status: string;
  status_display: string;
  model_version: string;
  tokens_total: number;
  generation_time_seconds: number;
  error_message: string;
  created_at: string;
  completed_at: string | null;
}

export default function TASGeneratorPage({ params }: { params: { tenantSlug: string } }) {
  const [documents, setDocuments] = useState<TAS[]>([]);
  const [templates, setTemplates] = useState<TASTemplate[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<TAS | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [versions, setVersions] = useState<TASVersion[]>([]);
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'approved' | 'published'>('all');
  const [generating, setGenerating] = useState(false);

  // Generate form state
  const [generateForm, setGenerateForm] = useState({
    template_id: null as number | null,
    code: '',
    qualification_name: '',
    aqf_level: 'certificate_iii',
    training_package: '',
    delivery_mode: 'Face-to-face',
    duration_weeks: 52,
    units_of_competency: [] as Array<{ code: string; title: string }>,
    assessment_methods: [] as string[],
    additional_context: '',
    use_gpt4: true,
  });

  // Mock data for demonstration
  useEffect(() => {
    // Mock TAS documents
    setDocuments([
      {
        id: 1,
        tenant: 1,
        title: 'BSB50120 - Diploma of Business',
        code: 'BSB50120',
        description: 'Diploma of Business qualification',
        qualification_name: 'Diploma of Business',
        aqf_level: 'diploma',
        aqf_level_display: 'Diploma',
        training_package: 'BSB',
        template: 1,
        template_details: null,
        sections: [],
        status: 'approved',
        status_display: 'Approved',
        version: 2,
        is_current_version: true,
        gpt_generated: true,
        gpt_generation_date: '2025-10-15T10:30:00Z',
        gpt_model_used: 'gpt-4',
        gpt_tokens_used: 8500,
        generation_time_seconds: 45.5,
        content: {},
        metadata: {},
        time_saved: {
          traditional_hours: 7.6,
          gpt_hours: 0.01,
          saved_hours: 6.8,
          percentage_saved: 90,
        },
        version_count: 2,
        created_by: 1,
        created_by_details: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
        },
        created_at: '2025-10-15T10:30:00Z',
        updated_at: '2025-10-20T14:20:00Z',
      },
    ]);

    // Mock templates
    setTemplates([
      {
        id: 1,
        name: 'Standard Diploma Template',
        description: 'Standard template for Diploma level qualifications',
        template_type: 'business',
        template_type_display: 'Business/Commerce',
        aqf_level: 'diploma',
        aqf_level_display: 'Diploma',
        structure: {},
        default_sections: [
          'qualification_overview',
          'target_group',
          'entry_requirements',
          'learning_outcomes',
          'units_of_competency',
          'delivery_strategy',
          'assessment_strategy',
          'resources',
          'trainer_requirements',
          'aqf_alignment',
        ],
        gpt_prompts: {},
        is_active: true,
        is_system_template: true,
        created_by: 1,
        created_by_details: {
          id: 1,
          username: 'system',
          email: 'system@example.com',
          first_name: 'System',
          last_name: 'Admin',
        },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 2,
        name: 'Certificate III Template',
        description: 'Standard template for Certificate III qualifications',
        template_type: 'general',
        template_type_display: 'General Template',
        aqf_level: 'certificate_iii',
        aqf_level_display: 'Certificate III',
        structure: {},
        default_sections: [],
        gpt_prompts: {},
        is_active: true,
        is_system_template: true,
        created_by: 1,
        created_by_details: {
          id: 1,
          username: 'system',
          email: 'system@example.com',
          first_name: 'System',
          last_name: 'Admin',
        },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      },
    ]);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setGenerating(false);
      setShowGenerateModal(false);
      alert('TAS generated successfully! Estimated time saved: 6.8 hours (90% reduction)');
      
      // Reset form
      setGenerateForm({
        template_id: null,
        code: '',
        qualification_name: '',
        aqf_level: 'certificate_iii',
        training_package: '',
        delivery_mode: 'Face-to-face',
        duration_weeks: 52,
        units_of_competency: [],
        assessment_methods: [],
        additional_context: '',
        use_gpt4: true,
      });
    }, 3000);
  };

  const addUnit = () => {
    setGenerateForm({
      ...generateForm,
      units_of_competency: [
        ...generateForm.units_of_competency,
        { code: '', title: '' },
      ],
    });
  };

  const updateUnit = (index: number, field: 'code' | 'title', value: string) => {
    const units = [...generateForm.units_of_competency];
    units[index][field] = value;
    setGenerateForm({ ...generateForm, units_of_competency: units });
  };

  const removeUnit = (index: number) => {
    const units = generateForm.units_of_competency.filter((_, i) => i !== index);
    setGenerateForm({ ...generateForm, units_of_competency: units });
  };

  const loadVersions = (doc: TAS) => {
    // Mock version history
    setVersions([
      {
        id: 2,
        tas: doc.id,
        version_number: 2,
        change_summary: 'Updated assessment strategy section',
        changed_sections: ['assessment_strategy'],
        content_diff: {},
        was_regenerated: true,
        regeneration_reason: 'Client requested changes to assessment methods',
        created_by: 1,
        created_by_details: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
        },
        created_at: '2025-10-20T14:20:00Z',
      },
      {
        id: 1,
        tas: doc.id,
        version_number: 1,
        change_summary: 'Initial GPT-4 generated version',
        changed_sections: [],
        content_diff: {},
        was_regenerated: true,
        regeneration_reason: 'Initial generation',
        created_by: 1,
        created_by_details: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
        },
        created_at: '2025-10-15T10:30:00Z',
      },
    ]);
  };

  const loadLogs = (doc: TAS) => {
    // Mock generation logs
    setLogs([
      {
        id: 1,
        tas: doc.id,
        status: 'completed',
        status_display: 'Completed',
        model_version: 'gpt-4',
        tokens_total: 8500,
        generation_time_seconds: 45.5,
        error_message: '',
        created_at: '2025-10-15T10:30:00Z',
        completed_at: '2025-10-15T10:31:15Z',
      },
    ]);
  };

  const filteredDocuments = documents.filter((doc) => {
    if (activeTab === 'all') return true;
    return doc.status === activeTab;
  });

  const AQF_LEVELS = [
    { value: 'certificate_i', label: 'Certificate I' },
    { value: 'certificate_ii', label: 'Certificate II' },
    { value: 'certificate_iii', label: 'Certificate III' },
    { value: 'certificate_iv', label: 'Certificate IV' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'advanced_diploma', label: 'Advanced Diploma' },
    { value: 'graduate_certificate', label: 'Graduate Certificate' },
    { value: 'graduate_diploma', label: 'Graduate Diploma' },
    { value: 'bachelor', label: 'Bachelor Degree' },
    { value: 'masters', label: 'Masters Degree' },
  ];

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800',
    archived: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📄 TAS Generator</h1>
            <p className="text-gray-600">
              Auto TAS builder with GPT-4 synthesis • Version control • AQF alignment • 90% time reduction
            </p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-semibold"
          >
            ✨ Generate New TAS
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
            <div className="text-sm text-gray-600">Total Documents</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-purple-600">90%</div>
            <div className="text-sm text-gray-600">Time Saved</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">🤖</div>
            <div className="text-2xl font-bold text-blue-600">GPT-4</div>
            <div className="text-sm text-gray-600">AI Model</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
            <div className="text-sm text-gray-600">Templates</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { key: 'all', label: 'All Documents', count: documents.length },
            { key: 'draft', label: 'Drafts', count: documents.filter(d => d.status === 'draft').length },
            { key: 'approved', label: 'Approved', count: documents.filter(d => d.status === 'approved').length },
            { key: 'published', label: 'Published', count: documents.filter(d => d.status === 'published').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{doc.code}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[doc.status]}`}>
                    {doc.status_display}
                  </span>
                  {doc.gpt_generated && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      🤖 AI Generated
                    </span>
                  )}
                </div>
                <p className="text-gray-700 font-medium">{doc.qualification_name}</p>
                <p className="text-sm text-gray-500">{doc.aqf_level_display}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">v{doc.version}</div>
                <div className="text-xs text-gray-500">{doc.version_count} versions</div>
              </div>
            </div>

            {/* Time Saved Stats */}
            {doc.time_saved && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">⏱️ Time Saved</span>
                  <span className="text-lg font-bold text-purple-600">{doc.time_saved.saved_hours}h</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>Traditional: {doc.time_saved.traditional_hours}h</span>
                  <span>•</span>
                  <span>GPT-4: {doc.time_saved.gpt_hours}h</span>
                  <span>•</span>
                  <span className="font-semibold text-purple-600">{doc.time_saved.percentage_saved}% reduction</span>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <div className="text-gray-500">Training Package</div>
                <div className="font-medium text-gray-900">{doc.training_package || 'N/A'}</div>
              </div>
              <div>
                <div className="text-gray-500">GPT-4 Tokens</div>
                <div className="font-medium text-gray-900">{doc.gpt_tokens_used.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Created By</div>
                <div className="font-medium text-gray-900">{doc.created_by_details.first_name} {doc.created_by_details.last_name}</div>
              </div>
              <div>
                <div className="text-gray-500">Last Updated</div>
                <div className="font-medium text-gray-900">{new Date(doc.updated_at).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedDocument(doc);
                  setShowPreviewModal(true);
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                📄 View Document
              </button>
              <button
                onClick={() => {
                  setSelectedDocument(doc);
                  loadVersions(doc);
                  setShowVersionModal(true);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                📋 Versions ({doc.version_count})
              </button>
              <button
                onClick={() => {
                  setSelectedDocument(doc);
                  loadLogs(doc);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                📊 Logs
              </button>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No TAS documents found</h3>
            <p className="text-gray-600 mb-4">Start by generating your first TAS document with GPT-4</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              ✨ Generate New TAS
            </button>
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">✨ Generate New TAS with GPT-4</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📋 Template (Optional)
                </label>
                <select
                  value={generateForm.template_id || ''}
                  onChange={(e) => setGenerateForm({ ...generateForm, template_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">No template (use defaults)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.aqf_level_display}
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Qualification Code *
                  </label>
                  <input
                    type="text"
                    value={generateForm.code}
                    onChange={(e) => setGenerateForm({ ...generateForm, code: e.target.value })}
                    placeholder="e.g., BSB50120"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    AQF Level *
                  </label>
                  <select
                    value={generateForm.aqf_level}
                    onChange={(e) => setGenerateForm({ ...generateForm, aqf_level: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {AQF_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Qualification Name *
                </label>
                <input
                  type="text"
                  value={generateForm.qualification_name}
                  onChange={(e) => setGenerateForm({ ...generateForm, qualification_name: e.target.value })}
                  placeholder="e.g., Diploma of Business"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Training Package
                  </label>
                  <input
                    type="text"
                    value={generateForm.training_package}
                    onChange={(e) => setGenerateForm({ ...generateForm, training_package: e.target.value })}
                    placeholder="e.g., BSB"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Delivery Mode
                  </label>
                  <select
                    value={generateForm.delivery_mode}
                    onChange={(e) => setGenerateForm({ ...generateForm, delivery_mode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="Face-to-face">Face-to-face</option>
                    <option value="Online">Online</option>
                    <option value="Blended">Blended</option>
                    <option value="Workplace">Workplace</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  value={generateForm.duration_weeks}
                  onChange={(e) => setGenerateForm({ ...generateForm, duration_weeks: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Units of Competency */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Units of Competency
                  </label>
                  <button
                    onClick={addUnit}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                  >
                    + Add Unit
                  </button>
                </div>
                <div className="space-y-2">
                  {generateForm.units_of_competency.map((unit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={unit.code}
                        onChange={(e) => updateUnit(index, 'code', e.target.value)}
                        placeholder="Unit Code"
                        className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={unit.title}
                        onChange={(e) => updateUnit(index, 'title', e.target.value)}
                        placeholder="Unit Title"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeUnit(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Context for GPT-4
                </label>
                <textarea
                  value={generateForm.additional_context}
                  onChange={(e) => setGenerateForm({ ...generateForm, additional_context: e.target.value })}
                  placeholder="Provide any additional context or specific requirements for the TAS generation..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* GPT-4 Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="use-gpt4"
                  checked={generateForm.use_gpt4}
                  onChange={(e) => setGenerateForm({ ...generateForm, use_gpt4: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="use-gpt4" className="text-sm font-medium text-gray-700">
                  🤖 Use GPT-4 for content generation (90% time reduction)
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating || !generateForm.code || !generateForm.qualification_name}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {generating ? '⚡ Generating with GPT-4...' : '✨ Generate TAS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showVersionModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📋 Version History - {selectedDocument.code}</h2>
              <button onClick={() => setShowVersionModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {versions.map((version) => (
                  <div key={version.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-lg font-bold text-gray-900">Version {version.version_number}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(version.created_at).toLocaleString()} by {version.created_by_details.first_name} {version.created_by_details.last_name}
                        </div>
                      </div>
                      {version.was_regenerated && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                          🤖 Regenerated
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <div className="text-sm font-semibold text-gray-700 mb-1">Change Summary:</div>
                      <div className="text-sm text-gray-600">{version.change_summary}</div>
                    </div>
                    {version.changed_sections.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-700 mb-1">Changed Sections:</div>
                        <div className="flex flex-wrap gap-2">
                          {version.changed_sections.map((section, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {section.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">📄 {selectedDocument.code} - {selectedDocument.qualification_name}</h2>
              <button onClick={() => setShowPreviewModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-6">{selectedDocument.description || 'Training and Assessment Strategy document'}</p>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                  <h4 className="font-bold text-blue-900 mb-2">📊 Document Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>AQF Level:</strong> {selectedDocument.aqf_level_display}</div>
                    <div><strong>Training Package:</strong> {selectedDocument.training_package || 'N/A'}</div>
                    <div><strong>Version:</strong> {selectedDocument.version}</div>
                    <div><strong>Status:</strong> {selectedDocument.status_display}</div>
                  </div>
                </div>

                {selectedDocument.gpt_generated && selectedDocument.time_saved && (
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                    <h4 className="font-bold text-purple-900 mb-2">🤖 GPT-4 Generation Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Time Saved</div>
                        <div className="font-bold text-purple-600">{selectedDocument.time_saved.saved_hours}h</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tokens Used</div>
                        <div className="font-bold">{selectedDocument.gpt_tokens_used.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Reduction</div>
                        <div className="font-bold text-green-600">{selectedDocument.time_saved.percentage_saved}%</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">📄</div>
                  <p>Document content sections would be displayed here</p>
                  <p className="text-sm">Including: Qualification Overview, Learning Outcomes, Assessment Strategy, etc.</p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
              <button className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                📥 Export PDF
              </button>
              <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                📝 Edit Document
              </button>
              <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                🔄 Regenerate Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
