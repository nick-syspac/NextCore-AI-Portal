'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Types
interface Evidence {
  id: number;
  evidence_number: string;
  title: string;
  description: string;
  evidence_type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  extracted_text: string;
  ner_entities: NEREntity[];
  ner_processed_at: string | null;
  status: string;
  tags: string[];
  evidence_date: string;
  uploaded_at: string;
  uploaded_by_name: string;
  tagged_clauses_count: number;
  auto_tagged_count: number;
}

interface NEREntity {
  entity: string;
  type: string;
  start: number;
  end: number;
  value?: string;
}

interface ClauseEvidence {
  id: number;
  clause_number: string;
  clause_title: string;
  clause_compliance_level: string;
  mapping_type: string;
  mapping_type_display: string;
  confidence_score: number;
  matched_keywords: string[];
  matched_entities: NEREntity[];
  is_verified: boolean;
  verified_by_name: string | null;
}

interface AuditReport {
  id: number;
  report_number: string;
  title: string;
  status: string;
  status_display: string;
  total_clauses: number;
  clauses_with_evidence: number;
  clauses_without_evidence: number;
  compliance_percentage: number;
  critical_compliance_percentage: number;
  auto_tagged_count: number;
  verified_evidence_count: number;
  created_at: string;
  audit_period_start: string;
  audit_period_end: string;
}

interface AuditReportClause {
  id: number;
  clause_number: string;
  clause_title: string;
  clause_text: string;
  compliance_status: string;
  compliance_status_display: string;
  evidence_count: number;
  verified_evidence_count: number;
  finding: string;
  severity: string;
  recommendation: string;
  evidence_details: Evidence[];
}

export default function AuditAssistantPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState<'evidence' | 'reports' | 'gaps'>('evidence');
  
  // Evidence state
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [taggedClauses, setTaggedClauses] = useState<ClauseEvidence[]>([]);
  
  // Report state
  const [auditReports, setAuditReports] = useState<AuditReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AuditReport | null>(null);
  const [reportClauses, setReportClauses] = useState<AuditReportClause[]>([]);
  
  // Upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    evidence_number: '',
    title: '',
    description: '',
    evidence_type: 'policy',
    evidence_date: new Date().toISOString().split('T')[0],
    auto_tag: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [showClauseModal, setShowClauseModal] = useState(false);
  
  // NER entities modal
  const [showNERModal, setShowNERModal] = useState(false);

  // Mock data
  useEffect(() => {
    // Mock evidence
    setEvidenceList([
      {
        id: 1,
        evidence_number: 'EV-2024-001',
        title: 'Assessment and Validation Policy',
        description: 'Comprehensive policy covering assessment practices',
        evidence_type: 'policy',
        file_url: '/evidence/assessment-policy.pdf',
        file_name: 'assessment-policy.pdf',
        file_size: 524288,
        extracted_text: 'This policy outlines the assessment and validation procedures per Standard 1.8...',
        ner_entities: [
          { entity: 'Standard 1.8', type: 'STANDARD', start: 75, end: 86, value: '1.8' },
          { entity: 'Clause 1.8.1', type: 'CLAUSE', start: 120, end: 131, value: '1.8.1' },
          { entity: 'TAE40116', type: 'QUALIFICATION', start: 200, end: 208 },
          { entity: 'ASQA', type: 'ORG', start: 250, end: 254 },
        ],
        ner_processed_at: '2024-10-20T10:30:00Z',
        status: 'tagged',
        tags: ['assessment', 'validation', 'critical'],
        evidence_date: '2024-01-15',
        uploaded_at: '2024-10-20T09:00:00Z',
        uploaded_by_name: 'Sarah Johnson',
        tagged_clauses_count: 8,
        auto_tagged_count: 6,
      },
      {
        id: 2,
        evidence_number: 'EV-2024-002',
        title: 'Trainer Qualification Records',
        description: 'Records of trainer qualifications and industry experience',
        evidence_type: 'record',
        file_url: '/evidence/trainer-records.xlsx',
        file_name: 'trainer-records.xlsx',
        file_size: 102400,
        extracted_text: 'Trainer qualifications as per Standard 1.13, 1.14, and 1.15...',
        ner_entities: [
          { entity: 'Standard 1.13', type: 'STANDARD', start: 35, end: 48, value: '1.13' },
          { entity: 'Standard 1.14', type: 'STANDARD', start: 50, end: 63, value: '1.14' },
          { entity: 'TAE40116', type: 'QUALIFICATION', start: 100, end: 108 },
        ],
        ner_processed_at: '2024-10-22T14:15:00Z',
        status: 'reviewed',
        tags: ['trainers', 'qualifications'],
        evidence_date: '2024-06-01',
        uploaded_at: '2024-10-22T14:00:00Z',
        uploaded_by_name: 'Michael Chen',
        tagged_clauses_count: 5,
        auto_tagged_count: 4,
      },
    ]);

    // Mock audit reports
    setAuditReports([
      {
        id: 1,
        report_number: 'AR-2024-001',
        title: 'Annual ASQA Compliance Audit 2024',
        status: 'in_progress',
        status_display: 'In Progress',
        total_clauses: 45,
        clauses_with_evidence: 32,
        clauses_without_evidence: 13,
        compliance_percentage: 71.1,
        critical_compliance_percentage: 85.0,
        auto_tagged_count: 25,
        verified_evidence_count: 18,
        created_at: '2024-10-01T08:00:00Z',
        audit_period_start: '2023-10-01',
        audit_period_end: '2024-09-30',
      },
    ]);
  }, []);

  const handleUploadEvidence = () => {
    if (!selectedFile) return;

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newEvidence: Evidence = {
        id: evidenceList.length + 1,
        evidence_number: uploadForm.evidence_number,
        title: uploadForm.title,
        description: uploadForm.description,
        evidence_type: uploadForm.evidence_type,
        file_url: URL.createObjectURL(selectedFile),
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        extracted_text: '[Text extraction in progress...]',
        ner_entities: [],
        ner_processed_at: null,
        status: 'processing',
        tags: [],
        evidence_date: uploadForm.evidence_date,
        uploaded_at: new Date().toISOString(),
        uploaded_by_name: 'Current User',
        tagged_clauses_count: 0,
        auto_tagged_count: 0,
      };

      setEvidenceList([newEvidence, ...evidenceList]);
      setUploading(false);
      setShowUploadModal(false);
      setUploadForm({
        evidence_number: '',
        title: '',
        description: '',
        evidence_type: 'policy',
        evidence_date: new Date().toISOString().split('T')[0],
        auto_tag: true,
      });
      setSelectedFile(null);

      // Simulate NER processing after 2 seconds
      setTimeout(() => {
        setEvidenceList(prev => prev.map(ev => 
          ev.id === newEvidence.id 
            ? { ...ev, status: 'tagged', tagged_clauses_count: 3, auto_tagged_count: 3, ner_processed_at: new Date().toISOString() }
            : ev
        ));
      }, 2000);
    }, 1500);
  };

  const handleViewTaggedClauses = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    // Mock tagged clauses
    setTaggedClauses([
      {
        id: 1,
        clause_number: '1.8',
        clause_title: 'Assessment System',
        clause_compliance_level: 'critical',
        mapping_type: 'auto_ner',
        mapping_type_display: 'Auto-tagged (NER)',
        confidence_score: 0.92,
        matched_keywords: ['assessment', 'validation', 'moderation'],
        matched_entities: [{ entity: 'Standard 1.8', type: 'STANDARD', start: 75, end: 86 }],
        is_verified: true,
        verified_by_name: 'Sarah Johnson',
      },
      {
        id: 2,
        clause_number: '1.8.1',
        clause_title: 'Assessment Practices',
        clause_compliance_level: 'critical',
        mapping_type: 'auto_rule',
        mapping_type_display: 'Auto-tagged (Rule-based)',
        confidence_score: 0.88,
        matched_keywords: ['assessment', 'practices', 'quality'],
        matched_entities: [{ entity: 'Clause 1.8.1', type: 'CLAUSE', start: 120, end: 131 }],
        is_verified: false,
        verified_by_name: null,
      },
    ]);
  };

  const handleViewReport = (report: AuditReport) => {
    setSelectedReport(report);
    // Mock report clauses
    setReportClauses([
      {
        id: 1,
        clause_number: '1.1',
        clause_title: 'Training and Assessment',
        clause_text: 'The RTO must ensure quality training and assessment across all operations.',
        compliance_status: 'compliant',
        compliance_status_display: 'Compliant',
        evidence_count: 3,
        verified_evidence_count: 2,
        finding: 'Sufficient evidence provided',
        severity: '',
        recommendation: '',
        evidence_details: evidenceList.slice(0, 2),
      },
      {
        id: 2,
        clause_number: '1.13',
        clause_title: 'Trainer Qualifications',
        clause_text: 'Trainers must hold required qualifications and industry experience.',
        compliance_status: 'partial',
        compliance_status_display: 'Partially Compliant',
        evidence_count: 1,
        verified_evidence_count: 0,
        finding: 'Limited evidence, requires additional documentation',
        severity: 'minor',
        recommendation: 'Upload additional trainer qualification records and industry experience documentation',
        evidence_details: [evidenceList[1]],
      },
      {
        id: 3,
        clause_number: '2.1',
        clause_title: 'Recruitment Requirements',
        clause_text: 'The RTO must have recruitment processes that ensure trainers meet qualification requirements.',
        compliance_status: 'non_compliant',
        compliance_status_display: 'Non-Compliant',
        evidence_count: 0,
        verified_evidence_count: 0,
        finding: 'No evidence provided for recruitment processes',
        severity: 'major',
        recommendation: 'Upload recruitment policy and trainer onboarding procedures',
        evidence_details: [],
      },
    ]);
    setShowReportModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-gray-100 text-gray-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'tagged': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'non_compliant': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNERTypeColor = (type: string) => {
    switch (type) {
      case 'STANDARD': return 'bg-blue-100 text-blue-800';
      case 'CLAUSE': return 'bg-indigo-100 text-indigo-800';
      case 'QUALIFICATION': return 'bg-purple-100 text-purple-800';
      case 'ORG': return 'bg-cyan-100 text-cyan-800';
      case 'DATE': return 'bg-pink-100 text-pink-800';
      case 'POLICY': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Audit Assistant</h1>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              🤖 NER Powered
            </span>
          </div>
          <p className="text-gray-600">Upload evidence, auto-tag with NER, generate clause-by-clause audit reports</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'evidence'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Evidence ({evidenceList.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'reports'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Audit Reports ({auditReports.length})
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'gaps'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Evidence Gaps
          </button>
        </div>

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Evidence Documents</h2>
                <p className="text-sm text-gray-600">Upload and auto-tag evidence using NER</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                📤 Upload Evidence
              </button>
            </div>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {evidenceList.map(evidence => (
                <div key={evidence.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{evidence.evidence_number}</h3>
                      <p className="text-gray-600">{evidence.title}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evidence.status)}`}>
                      {evidence.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{evidence.evidence_type.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">File:</span>
                      <span className="font-medium">{evidence.file_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Date:</span>
                      <span className="font-medium">{new Date(evidence.evidence_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* NER Stats */}
                  {evidence.ner_processed_at && (
                    <div className="bg-purple-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-purple-900">NER Analysis</span>
                        <span className="px-2 py-0.5 rounded text-xs bg-purple-200 text-purple-800">
                          {evidence.ner_entities.length} entities
                        </span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {evidence.ner_entities.slice(0, 3).map((entity, idx) => (
                          <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${getNERTypeColor(entity.type)}`}>
                            {entity.entity}
                          </span>
                        ))}
                        {evidence.ner_entities.length > 3 && (
                          <button
                            onClick={() => {
                              setSelectedEvidence(evidence);
                              setShowNERModal(true);
                            }}
                            className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                          >
                            +{evidence.ner_entities.length - 3} more
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Auto-tagging Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Auto-tagged:</span>
                      <span className="font-semibold text-purple-600">{evidence.auto_tagged_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Total clauses:</span>
                      <span className="font-semibold text-gray-900">{evidence.tagged_clauses_count}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewTaggedClauses(evidence)}
                      className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                    >
                      View Tagged Clauses
                    </button>
                    {evidence.ner_processed_at && (
                      <button
                        onClick={() => {
                          setSelectedEvidence(evidence);
                          setShowNERModal(true);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        NER Entities
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Audit Reports</h2>
                <p className="text-sm text-gray-600">Clause-by-clause audit reports with evidence mapping</p>
              </div>
            </div>

            <div className="space-y-6">
              {auditReports.map(report => (
                <div key={report.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{report.report_number}</h3>
                      <p className="text-gray-600">{report.title}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {report.status_display}
                    </span>
                  </div>

                  {/* Compliance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-gray-900">{report.compliance_percentage}%</div>
                      <div className="text-sm text-gray-600">Overall Compliance</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-900">{report.clauses_with_evidence}</div>
                      <div className="text-sm text-purple-700">Clauses with Evidence</div>
                    </div>
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-pink-900">{report.auto_tagged_count}</div>
                      <div className="text-sm text-pink-700">Auto-tagged</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-emerald-900">{report.critical_compliance_percentage}%</div>
                      <div className="text-sm text-emerald-700">Critical Clauses</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Evidence Coverage</span>
                      <span className="font-medium">{report.clauses_with_evidence}/{report.total_clauses} clauses</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${report.compliance_percentage}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewReport(report)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    View Clause-by-Clause Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gaps Tab */}
        {activeTab === 'gaps' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Evidence Gaps</h2>
              <p className="text-sm text-gray-600">Clauses requiring additional evidence</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="space-y-4">
                <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">Clause 2.1 - Recruitment Requirements</h3>
                      <p className="text-sm text-gray-600">Critical • Standard 2</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium border-2 ${getSeverityColor('critical')}`}>
                      CRITICAL GAP
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Evidence needed:</strong> 0 documents found
                  </div>
                  <div className="bg-white rounded p-3 text-sm">
                    <strong className="text-gray-900">Recommendations:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                      <li>Upload recruitment policy and procedures</li>
                      <li>Provide trainer onboarding documentation</li>
                      <li>Include qualification verification processes</li>
                    </ul>
                  </div>
                </div>

                <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">Clause 1.13 - Trainer Qualifications</h3>
                      <p className="text-sm text-gray-600">Critical • Standard 1</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-medium border-2 ${getSeverityColor('minor')}`}>
                      MINOR GAP
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 mb-3">
                    <strong>Evidence needed:</strong> 1 document (unverified)
                  </div>
                  <div className="bg-white rounded p-3 text-sm">
                    <strong className="text-gray-900">Recommendations:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1 text-gray-600">
                      <li>Verify existing trainer qualification records</li>
                      <li>Upload additional supporting documentation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Evidence Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Upload Evidence</h2>
                <p className="text-gray-600">Upload files and auto-tag with NER</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Number</label>
                  <input
                    type="text"
                    value={uploadForm.evidence_number}
                    onChange={(e) => setUploadForm({ ...uploadForm, evidence_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="EV-2024-003"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Document title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                    placeholder="Brief description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Type</label>
                    <select
                      value={uploadForm.evidence_type}
                      onChange={(e) => setUploadForm({ ...uploadForm, evidence_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="policy">Policy Document</option>
                      <option value="procedure">Procedure</option>
                      <option value="record">Record/Log</option>
                      <option value="template">Template/Form</option>
                      <option value="certificate">Certificate</option>
                      <option value="qualification">Qualification Document</option>
                      <option value="training_material">Training Material</option>
                      <option value="assessment">Assessment Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Date</label>
                    <input
                      type="date"
                      value={uploadForm.evidence_date}
                      onChange={(e) => setUploadForm({ ...uploadForm, evidence_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">Supported: PDF, Word, Excel, Text, Images</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={uploadForm.auto_tag}
                    onChange={(e) => setUploadForm({ ...uploadForm, auto_tag: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700">
                    Enable auto-tagging with NER (Named Entity Recognition)
                  </label>
                </div>

                {uploadForm.auto_tag && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600">🤖</span>
                      <div className="text-sm text-purple-900">
                        <strong>NER will automatically:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Extract text from your document</li>
                          <li>Identify ASQA standards, clauses, and qualifications</li>
                          <li>Auto-tag relevant ASQA clauses with confidence scores</li>
                          <li>Match keywords and entity references</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadEvidence}
                  disabled={uploading || !selectedFile || !uploadForm.evidence_number || !uploadForm.title}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload & Process'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NER Entities Modal */}
        {showNERModal && selectedEvidence && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">NER Entities - {selectedEvidence.evidence_number}</h2>
                <p className="text-gray-600">{selectedEvidence.ner_entities.length} entities identified</p>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {selectedEvidence.ner_entities.map((entity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getNERTypeColor(entity.type)}`}>
                        {entity.type}
                      </span>
                      <span className="font-medium text-gray-900">{entity.entity}</span>
                      {entity.value && (
                        <span className="text-sm text-gray-600">→ {entity.value}</span>
                      )}
                      <span className="text-xs text-gray-500 ml-auto">Position: {entity.start}-{entity.end}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowNERModal(false)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tagged Clauses Modal */}
        {selectedEvidence && taggedClauses.length > 0 && !showNERModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Tagged Clauses - {selectedEvidence.evidence_number}</h2>
                <p className="text-gray-600">{taggedClauses.length} ASQA clauses automatically tagged</p>
              </div>

              <div className="p-6 space-y-4">
                {taggedClauses.map(clause => (
                  <div key={clause.id} className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{clause.clause_number} - {clause.clause_title}</h3>
                        <span className="text-sm text-gray-600">{clause.clause_compliance_level}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {clause.mapping_type_display}
                        </span>
                        {clause.is_verified && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Confidence Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                            style={{ width: `${clause.confidence_score * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{Math.round(clause.confidence_score * 100)}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Matched Keywords</div>
                        <div className="flex gap-1 flex-wrap">
                          {clause.matched_keywords.map((kw, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Matched Entities</div>
                        <div className="flex gap-1 flex-wrap">
                          {clause.matched_entities.map((entity, idx) => (
                            <span key={idx} className={`px-2 py-1 rounded text-xs ${getNERTypeColor(entity.type)}`}>
                              {entity.entity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedEvidence(null);
                    setTaggedClauses([]);
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Clauses Modal */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.report_number}</h2>
                <p className="text-gray-600">Clause-by-Clause Audit Report</p>
              </div>

              <div className="p-6 space-y-4">
                {reportClauses.map(clause => (
                  <div key={clause.id} className={`border-2 rounded-lg p-4 ${
                    clause.compliance_status === 'compliant' ? 'border-green-200 bg-green-50' :
                    clause.compliance_status === 'partial' ? 'border-yellow-200 bg-yellow-50' :
                    'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{clause.clause_number} - {clause.clause_title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{clause.clause_text}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          clause.compliance_status === 'compliant' ? 'bg-green-100 text-green-800' :
                          clause.compliance_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {clause.compliance_status_display}
                        </span>
                        {clause.severity && (
                          <span className={`px-3 py-1 rounded text-xs font-medium border ${getSeverityColor(clause.severity)}`}>
                            {clause.severity.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-white rounded p-2">
                        <div className="text-xs text-gray-600">Evidence</div>
                        <div className="text-lg font-semibold">{clause.evidence_count}</div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-xs text-gray-600">Verified</div>
                        <div className="text-lg font-semibold text-green-600">{clause.verified_evidence_count}</div>
                      </div>
                      <div className="bg-white rounded p-2">
                        <div className="text-xs text-gray-600">Status</div>
                        <div className={`text-sm font-semibold ${getComplianceColor(clause.compliance_status)}`}>
                          {clause.compliance_status_display}
                        </div>
                      </div>
                    </div>

                    {clause.finding && (
                      <div className="bg-white rounded p-3 mb-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">Finding:</div>
                        <div className="text-sm text-gray-700">{clause.finding}</div>
                      </div>
                    )}

                    {clause.recommendation && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">Recommendation:</div>
                        <div className="text-sm text-blue-800">{clause.recommendation}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReport(null);
                    setReportClauses([]);
                  }}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
