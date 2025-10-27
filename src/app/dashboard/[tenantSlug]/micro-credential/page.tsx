'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface MicroCredential {
  id: number;
  code: string;
  title: string;
  description: string;
  duration_hours: number;
  delivery_mode: string;
  delivery_mode_display: string;
  status: string;
  status_display: string;
  target_audience: string;
  learning_outcomes: string[];
  source_units: Array<{
    code: string;
    title: string;
    nominal_hours: number;
  }>;
  tags: string[];
  skills_covered: string[];
  industry_sectors: string[];
  price: string | null;
  enrollment_count: number;
  gpt_generated: boolean;
  created_at: string;
  created_by_details: {
    first_name: string;
    last_name: string;
  };
}

interface GenerateFormData {
  unit_codes: string[];
  title: string;
  target_duration: number;
  delivery_mode: string;
  target_audience: string;
}

export default function MicroCredentialPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [microCredentials, setMicroCredentials] = useState<MicroCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<MicroCredential | null>(null);

  const [generateForm, setGenerateForm] = useState<GenerateFormData>({
    unit_codes: [''],
    title: '',
    target_duration: 40,
    delivery_mode: 'blended',
    target_audience: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchMicroCredentials();
  }, [tenantSlug]);

  const fetchMicroCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/tenants/${tenantSlug}/micro-credentials`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        console.error('Failed to fetch micro-credentials:', response.status, response.statusText);
        throw new Error('Failed to fetch micro-credentials');
      }

      const data = await response.json();
      setMicroCredentials(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error fetching micro-credentials:', error);
      // Don't alert on initial load failure - might just be empty
      setMicroCredentials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMicroCredential = async () => {
    // Validate
    const validUnits = generateForm.unit_codes.filter(code => code.trim() !== '');
    if (validUnits.length === 0) {
      alert('Please enter at least one unit code');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch(
        `${API_URL}/api/tenants/${tenantSlug}/micro-credentials/generate_from_units/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            ...generateForm,
            unit_codes: validUnits,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to generate micro-credential';
        try {
          const error = await response.json();
          errorMessage = error.error || error.detail || JSON.stringify(error);
        } catch (e) {
          errorMessage = `Server responded with ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const newCredential = await response.json();
      setMicroCredentials([newCredential, ...microCredentials]);
      setShowGenerateModal(false);
      
      // Reset form
      setGenerateForm({
        unit_codes: [''],
        title: '',
        target_duration: 40,
        delivery_mode: 'blended',
        target_audience: '',
      });

      alert('✅ Micro-credential generated successfully!');
    } catch (error: any) {
      console.error('Error generating micro-credential:', error);
      alert(`Failed to generate: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const addUnitCodeField = () => {
    setGenerateForm({
      ...generateForm,
      unit_codes: [...generateForm.unit_codes, ''],
    });
  };

  const updateUnitCode = (index: number, value: string) => {
    const newCodes = [...generateForm.unit_codes];
    newCodes[index] = value.toUpperCase();
    setGenerateForm({ ...generateForm, unit_codes: newCodes });
  };

  const removeUnitCode = (index: number) => {
    const newCodes = generateForm.unit_codes.filter((_, i) => i !== index);
    setGenerateForm({ ...generateForm, unit_codes: newCodes });
  };

  const handleViewDetails = (credential: MicroCredential) => {
    setSelectedCredential(credential);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      published: 'bg-blue-100 text-blue-800',
      archived: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎓</div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Micro-Credential Builder</h1>
                <p className="text-teal-100 text-lg">
                  Generate short courses from units • Curriculum compression + metadata tagging • New course creation in minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-white text-teal-700 rounded-lg hover:bg-teal-50 transition-all shadow-lg font-semibold flex items-center gap-2"
            >
              <span className="text-2xl">✨</span>
              <span>Generate New Course</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📚</div>
            <div>
              <p className="text-gray-600 text-sm">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{microCredentials.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">✅</div>
            <div>
              <p className="text-gray-600 text-sm">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {microCredentials.filter(c => c.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📝</div>
            <div>
              <p className="text-gray-600 text-sm">Drafts</p>
              <p className="text-2xl font-bold text-gray-600">
                {microCredentials.filter(c => c.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">👥</div>
            <div>
              <p className="text-gray-600 text-sm">Total Enrollments</p>
              <p className="text-2xl font-bold text-blue-600">
                {microCredentials.reduce((sum, c) => sum + c.enrollment_count, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Micro-Credentials List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Micro-Credentials</h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading micro-credentials...</p>
          </div>
        ) : microCredentials.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Micro-Credentials Yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by generating your first micro-credential from training package units
            </p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-semibold"
            >
              ✨ Generate First Course
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {microCredentials.map((credential) => (
              <div
                key={credential.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewDetails(credential)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {credential.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-mono">{credential.code}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(credential.status)}`}>
                    {credential.status_display}
                  </span>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {credential.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>⏱️</span>
                    <span>{credential.duration_hours} hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📦</span>
                    <span>{credential.source_units.length} units</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🎯</span>
                    <span>{credential.delivery_mode_display}</span>
                  </div>
                  {credential.gpt_generated && (
                    <div className="flex items-center gap-2 text-sm text-teal-600">
                      <span>✨</span>
                      <span>AI Generated</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {credential.industry_sectors.slice(0, 2).map((sector, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full"
                    >
                      {sector}
                    </span>
                  ))}
                  {credential.industry_sectors.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{credential.industry_sectors.length - 2} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {credential.enrollment_count} enrolled
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(credential);
                    }}
                    className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">✨ Generate Micro-Credential</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Unit Codes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Codes *
                </label>
                <div className="space-y-2">
                  {generateForm.unit_codes.map((code, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => updateUnitCode(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono"
                        placeholder="e.g., ICTICT418, BSBXCS404"
                      />
                      {generateForm.unit_codes.length > 1 && (
                        <button
                          onClick={() => removeUnitCode(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addUnitCodeField}
                  className="mt-2 text-sm text-teal-600 hover:text-teal-800 font-medium"
                >
                  + Add Another Unit
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title (Optional - AI will generate if empty)
                </label>
                <input
                  type="text"
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., Cybersecurity Fundamentals"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Duration (hours)
                </label>
                <input
                  type="number"
                  value={generateForm.target_duration}
                  onChange={(e) => setGenerateForm({ ...generateForm, target_duration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="10"
                  max="200"
                />
              </div>

              {/* Delivery Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Mode
                </label>
                <select
                  value={generateForm.delivery_mode}
                  onChange={(e) => setGenerateForm({ ...generateForm, delivery_mode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="online">Online</option>
                  <option value="face_to_face">Face to Face</option>
                  <option value="blended">Blended</option>
                  <option value="workplace">Workplace</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience (Optional)
                </label>
                <textarea
                  value={generateForm.target_audience}
                  onChange={(e) => setGenerateForm({ ...generateForm, target_audience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., IT professionals seeking cybersecurity upskilling"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={generating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateMicroCredential}
                  disabled={generating}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {generating ? '🔄 Generating...' : '✨ Generate Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCredential && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCredential.title}</h2>
                  <p className="text-teal-100 mt-1 font-mono">{selectedCredential.code}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCredential.status)}`}>
                    {selectedCredential.status_display}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedCredential.duration_hours} hours
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedCredential.description}</p>
              </div>

              {/* Source Units */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Source Units</h3>
                <div className="space-y-2">
                  {selectedCredential.source_units.map((unit, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-mono text-sm text-teal-600">{unit.code}</p>
                        <p className="text-sm text-gray-700">{unit.title}</p>
                      </div>
                      <span className="text-sm text-gray-600">{unit.nominal_hours}h</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              {selectedCredential.learning_outcomes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Learning Outcomes</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedCredential.learning_outcomes.map((outcome, idx) => (
                      <li key={idx} className="text-sm">{outcome}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Covered */}
              {selectedCredential.skills_covered.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Skills Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCredential.skills_covered.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Industry Sectors */}
              {selectedCredential.industry_sectors.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Industry Sectors</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCredential.industry_sectors.map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-teal-100 text-teal-800 text-sm rounded-full"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Created by {selectedCredential.created_by_details?.first_name} {selectedCredential.created_by_details?.last_name}
                  {' • '}
                  {new Date(selectedCredential.created_at).toLocaleDateString()}
                  {selectedCredential.gpt_generated && ' • AI Generated ✨'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
