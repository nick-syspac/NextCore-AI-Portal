'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface EvidenceMapping {
  id: number;
  mapping_number: string;
  name: string;
  description: string;
  assessment_type: string;
  status: string;
  total_criteria: number;
  total_submissions: number;
  total_evidence_tagged: number;
  total_text_extracted: number;
  embeddings_generated: number;
  coverage_percentage: number;
  auto_extract_text: boolean;
  generate_embeddings: boolean;
  created_at: string;
}

interface SubmissionEvidence {
  id: number;
  evidence_number: string;
  student_id: string;
  student_name: string;
  submission_type: string;
  extracted_text: string;
  text_length: number;
  extraction_status: string;
  total_tags: number;
  metadata: any;
  tags?: CriteriaTag[];
}

interface CriteriaTag {
  id: number;
  tag_number: string;
  criterion_id: string;
  criterion_name: string;
  tagged_text: string;
  text_start_position: number;
  text_end_position: number;
  context_before: string;
  context_after: string;
  tag_type: string;
  confidence_level: string;
  confidence_score: number;
  is_validated: boolean;
}

interface AuditLog {
  id: number;
  action: string;
  description: string;
  performed_by: string;
  processing_time_ms: number;
  timestamp: string;
}

interface SearchResult {
  evidence_number: string;
  student_id: string;
  similarity_score: number;
  matched_text: string;
}

export default function EvidenceMapperPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('create');
  const [mappings, setMappings] = useState<EvidenceMapping[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<EvidenceMapping | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionEvidence[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionEvidence | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [mappingName, setMappingName] = useState('');
  const [mappingDescription, setMappingDescription] = useState('');
  const [assessmentType, setAssessmentType] = useState('written');
  const [totalCriteria, setTotalCriteria] = useState(5);
  const [autoExtract, setAutoExtract] = useState(true);
  const [generateEmbeddings, setGenerateEmbeddings] = useState(true);

  // Tagging states
  const [selectedText, setSelectedText] = useState('');
  const [textStartPos, setTextStartPos] = useState(0);
  const [textEndPos, setTextEndPos] = useState(0);
  const [criterionId, setCriterionId] = useState('');
  const [criterionName, setCriterionName] = useState('');
  const [tagType, setTagType] = useState('direct');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [minSimilarity, setMinSimilarity] = useState(0.7);
  const [searchLimit, setSearchLimit] = useState(10);

  const statistics = selectedMapping
    ? [
        {
          label: 'Total Submissions',
          value: selectedMapping.total_submissions,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          label: 'Text Extracted',
          value: selectedMapping.total_text_extracted,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          label: 'Evidence Tagged',
          value: selectedMapping.total_evidence_tagged,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          label: 'Coverage',
          value: `${selectedMapping.coverage_percentage.toFixed(1)}%`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
      ]
    : [];

  const handleCreateMapping = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tenants/${tenantSlug}/evidence-mapper/mappings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mappingName,
          description: mappingDescription,
          assessment_type: assessmentType,
          total_criteria: totalCriteria,
          auto_extract_text: autoExtract,
          generate_embeddings: generateEmbeddings,
          created_by: 'current_user',
        }),
      });

      if (response.ok) {
        const newMapping = await response.json();
        setMappings([newMapping, ...mappings]);
        setSelectedMapping(newMapping);
        setMappingName('');
        setMappingDescription('');
      }
    } catch (error) {
      console.error('Failed to create mapping:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractText = async (submissionId: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/evidence-mapper/submissions/${submissionId}/extract_text/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            extraction_method: 'mock_ocr',
            generate_embedding: generateEmbeddings,
          }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setSubmissions(submissions.map(s => (s.id === submissionId ? updated : s)));
        if (selectedSubmission?.id === submissionId) {
          setSelectedSubmission(updated);
        }
      }
    } catch (error) {
      console.error('Failed to extract text:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagEvidence = async () => {
    if (!selectedSubmission || !selectedText) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/evidence-mapper/submissions/${selectedSubmission.id}/tag_evidence/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            criterion_id: criterionId,
            criterion_name: criterionName,
            tagged_text: selectedText,
            text_start_position: textStartPos,
            text_end_position: textEndPos,
            tag_type: tagType,
            tagged_by: 'current_user',
          }),
        }
      );

      if (response.ok) {
        // Refresh submission to see new tag
        const refreshResponse = await fetch(
          `/api/tenants/${tenantSlug}/evidence-mapper/submissions/${selectedSubmission.id}/`
        );
        if (refreshResponse.ok) {
          const updated = await refreshResponse.json();
          setSelectedSubmission(updated);
        }

        // Clear form
        setSelectedText('');
        setCriterionId('');
        setCriterionName('');
      }
    } catch (error) {
      console.error('Failed to tag evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchEmbeddings = async () => {
    if (!selectedMapping || !searchQuery) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/tenants/${tenantSlug}/evidence-mapper/submissions/search_embeddings/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mapping_id: selectedMapping.id,
            query: searchQuery,
            search_type: 'similarity',
            min_similarity: minSimilarity,
            limit: searchLimit,
          }),
        }
      );

      if (response.ok) {
        const results = await response.json();
        setSearchResults(results.results || []);
      }
    } catch (error) {
      console.error('Failed to search embeddings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-gray-100 text-gray-700', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-700', label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
    };
    const variant = variants[status] || variants.pending;
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${variant.color}`}>
        {variant.label}
      </span>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🗂️ Evidence Mapper</h1>
        <p className="text-gray-600">
          Tag submissions to criteria • Text extraction + embedding search • Stronger audit trail
        </p>
      </div>

      {/* Statistics Dashboard */}
      {selectedMapping && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {statistics.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <div className={`h-6 w-6 ${stat.color}`}>📊</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {['create', 'submissions', 'tagging', 'search', 'audit'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Create Mapping Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Create Evidence Mapping</h3>
              <p className="text-gray-600 mb-6">
                Set up a new evidence mapping for linking submissions to assessment criteria
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mapping Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Python Project Evidence"
                      value={mappingName}
                      onChange={e => setMappingName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assessment Type
                    </label>
                    <select
                      value={assessmentType}
                      onChange={e => setAssessmentType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="written">Written Assignment</option>
                      <option value="practical">Practical Demonstration</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="project">Project Work</option>
                      <option value="presentation">Presentation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the purpose of this evidence mapping..."
                    value={mappingDescription}
                    onChange={e => setMappingDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Criteria: {totalCriteria}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={totalCriteria}
                    onChange={e => setTotalCriteria(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoExtract}
                      onChange={e => setAutoExtract(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-extract text from submissions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={generateEmbeddings}
                      onChange={e => setGenerateEmbeddings(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Generate embeddings for search</span>
                  </label>
                </div>

                <button
                  onClick={handleCreateMapping}
                  disabled={!mappingName || loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '⏳ Creating...' : '📤 Create Mapping'}
                </button>
              </div>
            </div>

            {/* Existing Mappings */}
            {mappings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Existing Mappings</h3>
                <div className="space-y-2">
                  {mappings.map(mapping => (
                    <div
                      key={mapping.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedMapping?.id === mapping.id ? 'border-indigo-500 bg-indigo-50' : ''
                      }`}
                      onClick={() => setSelectedMapping(mapping)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{mapping.name}</p>
                          <p className="text-sm text-gray-600">{mapping.mapping_number}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                            {mapping.status}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {mapping.total_submissions} submissions •{' '}
                            {mapping.coverage_percentage.toFixed(0)}% coverage
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Submission Evidence</h3>
            <p className="text-gray-600 mb-6">View and extract text from student submissions</p>

            {!selectedMapping ? (
              <p className="text-gray-500 text-center py-8">Select a mapping first</p>
            ) : submissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {submissions.map(submission => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold">
                          {submission.student_name || submission.student_id}
                        </p>
                        <p className="text-sm text-gray-600">{submission.evidence_number}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.extraction_status)}
                        {submission.extraction_status === 'pending' && (
                          <button
                            onClick={() => handleExtractText(submission.id)}
                            disabled={loading}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                          >
                            📄 Extract Text
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          👁️ View
                        </button>
                      </div>
                    </div>

                    {submission.extraction_status === 'completed' && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>
                          Text length: {submission.text_length} chars • Tags:{' '}
                          {submission.total_tags}
                        </p>
                        {submission.metadata && (
                          <p>
                            Language: {submission.metadata.language} • Readability:{' '}
                            {submission.metadata.readability_score}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Text Viewer */}
            {selectedSubmission && selectedSubmission.extracted_text && (
              <div className="mt-6 border-t pt-6">
                <h4 className="font-semibold mb-2">
                  Extracted Text - {selectedSubmission.evidence_number}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Select text to tag evidence. Highlighted sections are already tagged.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border whitespace-pre-wrap">
                  {selectedSubmission.extracted_text}
                </div>

                {selectedSubmission.tags && selectedSubmission.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Tagged Evidence</h4>
                    <div className="space-y-2">
                      {selectedSubmission.tags.map(tag => (
                        <div key={tag.id} className="p-3 bg-white border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{tag.criterion_name}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                                {tag.tag_type}
                              </span>
                              <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                                {tag.confidence_level}
                              </span>
                              {tag.is_validated && <span className="text-green-600">✓</span>}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 italic">"{tag.tagged_text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tagging Tab */}
        {activeTab === 'tagging' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Tag Evidence to Criteria</h3>
            <p className="text-gray-600 mb-6">
              Link selected text from submissions to assessment criteria
            </p>

            {!selectedSubmission ? (
              <p className="text-gray-500 text-center py-8">
                Select a submission from the Submissions tab first
              </p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Text
                  </label>
                  <textarea
                    value={selectedText}
                    onChange={e => setSelectedText(e.target.value)}
                    placeholder="Select text from the submission viewer..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Criterion ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., CRIT-001"
                      value={criterionId}
                      onChange={e => setCriterionId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Criterion Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Code Quality"
                      value={criterionName}
                      onChange={e => setCriterionName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Evidence Type
                  </label>
                  <select
                    value={tagType}
                    onChange={e => setTagType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="direct">Direct Evidence</option>
                    <option value="indirect">Indirect Evidence</option>
                    <option value="supporting">Supporting Evidence</option>
                    <option value="reference">Reference Material</option>
                  </select>
                </div>

                <button
                  onClick={handleTagEvidence}
                  disabled={!selectedText || !criterionId || !criterionName || loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '⏳ Tagging...' : '🏷️ Tag Evidence'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Semantic Search</h3>
            <p className="text-gray-600 mb-6">
              Search across all submissions using embedding-based similarity
            </p>

            {!selectedMapping ? (
              <p className="text-gray-500 text-center py-8">Select a mapping first</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Query
                  </label>
                  <textarea
                    placeholder="Enter your search query..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Similarity: {minSimilarity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={minSimilarity}
                    onChange={e => setMinSimilarity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Lower values show more results, higher values show more relevant matches
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Result Limit: {searchLimit}
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={searchLimit}
                    onChange={e => setSearchLimit(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={handleSearchEmbeddings}
                  disabled={!searchQuery || loading}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? '⏳ Searching...' : '🔍 Search Embeddings'}
                </button>

                {searchResults.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Search Results ({searchResults.length})</h4>
                    <div className="space-y-3">
                      {searchResults.map((result, index) => (
                        <div key={index} className="p-4 bg-white border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{result.student_id}</span>
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                              {(result.similarity_score * 100).toFixed(1)}% match
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 italic">"{result.matched_text}"</p>
                          <p className="text-xs text-gray-500 mt-1">{result.evidence_number}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
            <p className="text-gray-600 mb-6">
              Complete history of all actions performed on this evidence mapping
            </p>

            {auditLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No audit logs yet</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-gray-50 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">🕒</span>
                        <span className="font-medium">
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>By: {log.performed_by}</span>
                      {log.processing_time_ms && (
                        <span>Processing time: {log.processing_time_ms}ms</span>
                      )}
                    </div>
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
