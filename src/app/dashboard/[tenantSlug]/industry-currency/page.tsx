'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface TrainerProfile {
  id: number;
  profile_number: string;
  trainer_name: string;
  primary_industry: string;
  linkedin_url: string;
  github_url: string;
  currency_status: string;
  currency_score: number;
  last_verified_date: string;
  specializations: string[];
}

interface VerificationScan {
  id: number;
  scan_number: string;
  scan_type: string;
  scan_status: string;
  sources_to_scan: string[];
  currency_score: number;
  total_items_found: number;
  relevant_items_count: number;
  created_at: string;
  completed_at: string;
}

interface LinkedInActivity {
  id: number;
  activity_number: string;
  activity_type: string;
  title: string;
  description: string;
  activity_date: string;
  skills_mentioned: string[];
  technologies: string[];
  relevance_score: number;
  is_industry_relevant: boolean;
}

interface GitHubActivity {
  id: number;
  activity_number: string;
  activity_type: string;
  repository_name: string;
  description: string;
  language: string;
  technologies: string[];
  stars: number;
  commits_count: number;
  relevance_score: number;
  is_industry_relevant: boolean;
}

interface CurrencyEvidence {
  id: number;
  evidence_number: string;
  evidence_type: string;
  title: string;
  currency_score: number;
  total_activities: number;
  created_at: string;
}

interface DashboardStats {
  total_profiles: number;
  current_profiles: number;
  expiring_soon: number;
  expired_profiles: number;
  total_scans: number;
  avg_currency_score: number;
  total_linkedin_activities: number;
  total_github_activities: number;
  total_evidence_docs: number;
}

export default function IndustryCurrencyPage() {
  const params = useParams();
  const tenantSlug = params?.tenantSlug as string;

  const [activeTab, setActiveTab] = useState('profiles');
  const [loading, setLoading] = useState(true);

  // Data states
  const [profiles, setProfiles] = useState<TrainerProfile[]>([]);
  const [scans, setScans] = useState<VerificationScan[]>([]);
  const [linkedInActivities, setLinkedInActivities] = useState<LinkedInActivity[]>([]);
  const [githubActivities, setGithubActivities] = useState<GitHubActivity[]>([]);
  const [evidenceDocuments, setEvidenceDocuments] = useState<CurrencyEvidence[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    trainer_id: 'trainer-001',
    trainer_name: '',
    email: '',
    linkedin_url: '',
    github_url: '',
    primary_industry: '',
    specializations: [] as string[],
    years_experience: 0,
  });

  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [selectedScan, setSelectedScan] = useState<number | null>(null);

  // Load data
  useEffect(() => {
    loadDashboard();
    loadProfiles();
    loadScans();
    loadLinkedInActivities();
    loadGithubActivities();
    loadEvidenceDocuments();
  }, [tenantSlug]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/industry-currency/profiles/dashboard/?tenant=${tenantSlug}`
      );
      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const response = await fetch(`/api/industry-currency/profiles/?tenant=${tenantSlug}`);
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  };

  const loadScans = async () => {
    try {
      const response = await fetch(`/api/industry-currency/scans/`);
      const data = await response.json();
      setScans(data);
    } catch (error) {
      console.error('Failed to load scans:', error);
    }
  };

  const loadLinkedInActivities = async () => {
    try {
      const response = await fetch(`/api/industry-currency/linkedin-activities/`);
      const data = await response.json();
      setLinkedInActivities(data);
    } catch (error) {
      console.error('Failed to load LinkedIn activities:', error);
    }
  };

  const loadGithubActivities = async () => {
    try {
      const response = await fetch(`/api/industry-currency/github-activities/`);
      const data = await response.json();
      setGithubActivities(data);
    } catch (error) {
      console.error('Failed to load GitHub activities:', error);
    }
  };

  const loadEvidenceDocuments = async () => {
    try {
      const response = await fetch(`/api/industry-currency/evidence/`);
      const data = await response.json();
      setEvidenceDocuments(data);
    } catch (error) {
      console.error('Failed to load evidence documents:', error);
    }
  };

  const handleCreateProfile = async () => {
    try {
      const response = await fetch('/api/industry-currency/profiles/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant: tenantSlug,
          ...profileForm,
        }),
      });

      if (response.ok) {
        alert('Profile created successfully!');
        loadProfiles();
        loadDashboard();
        // Reset form
        setProfileForm({
          ...profileForm,
          trainer_name: '',
          email: '',
          linkedin_url: '',
          github_url: '',
          primary_industry: '',
          specializations: [],
          years_experience: 0,
        });
      }
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Failed to create profile');
    }
  };

  const handleVerifyProfile = async (profileId: number) => {
    if (!profileId) {
      alert('Please select a profile');
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch('/api/industry-currency/profiles/verify-profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          scan_linkedin: true,
          scan_github: true,
          analyze_currency: true,
          generate_evidence: true,
          evidence_type: 'combined_report',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `Verification complete! Currency: ${data.currency_status} (${data.currency_score}/100)`
        );
        loadProfiles();
        loadScans();
        loadDashboard();
      }
    } catch (error) {
      console.error('Failed to verify profile:', error);
      alert('Failed to verify profile');
    } finally {
      setVerifying(false);
    }
  };

  const handleStartScan = async (profileId: number) => {
    try {
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      const response = await fetch('/api/industry-currency/profiles/start-scan/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          scan_type: 'manual',
          sources_to_scan: ['linkedin', 'github'],
          linkedin_url: profile.linkedin_url,
          github_url: profile.github_url,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Scan started! Scan ID: ${data.scan_number}`);
        setSelectedScan(data.scan_id);

        // Auto-scan LinkedIn and GitHub
        if (profile.linkedin_url) {
          await handleScanLinkedIn(data.scan_id, profile.linkedin_url);
        }
        if (profile.github_url) {
          await handleScanGitHub(data.scan_id, profile.github_url);
        }

        // Analyze currency
        await handleAnalyzeCurrency(data.scan_id, profile.primary_industry);

        loadScans();
      }
    } catch (error) {
      console.error('Failed to start scan:', error);
      alert('Failed to start scan');
    }
  };

  const handleScanLinkedIn = async (scanId: number, linkedinUrl: string) => {
    try {
      const response = await fetch('/api/industry-currency/profiles/scan-linkedin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          linkedin_url: linkedinUrl,
          extract_posts: true,
          extract_certifications: true,
          extract_positions: true,
          max_items: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`LinkedIn scan: ${data.activities_found} activities found`);
        loadLinkedInActivities();
      }
    } catch (error) {
      console.error('Failed to scan LinkedIn:', error);
    }
  };

  const handleScanGitHub = async (scanId: number, githubUrl: string) => {
    try {
      const username = githubUrl.split('/').pop() || '';
      const response = await fetch('/api/industry-currency/profiles/scan-github/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          github_username: username,
          extract_repos: true,
          extract_commits: true,
          extract_contributions: true,
          max_items: 50,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`GitHub scan: ${data.activities_found} activities found`);
        loadGithubActivities();
      }
    } catch (error) {
      console.error('Failed to scan GitHub:', error);
    }
  };

  const handleAnalyzeCurrency = async (scanId: number, industry: string) => {
    try {
      const response = await fetch('/api/industry-currency/profiles/analyze-currency/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          industry: industry,
          recency_weight: 0.4,
          relevance_weight: 0.4,
          frequency_weight: 0.2,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Currency analyzed: ${data.currency_score}/100`);
        loadProfiles();
        loadDashboard();
      }
    } catch (error) {
      console.error('Failed to analyze currency:', error);
    }
  };

  const handleGenerateEvidence = async (scanId: number) => {
    try {
      const response = await fetch('/api/industry-currency/profiles/generate-evidence/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          evidence_type: 'combined_report',
          file_format: 'markdown',
          include_raw_data: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Evidence generated! ${data.title}`);
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
      current: 'bg-teal-100 text-teal-800',
      expiring_soon: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      not_verified: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getScanStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-800',
      scanning: 'bg-blue-100 text-blue-800',
      extracting: 'bg-purple-100 text-purple-800',
      analyzing: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-teal-100 text-teal-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !dashboardStats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading Industry Currency Verifier...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔍</span>
          <h1 className="text-3xl font-bold text-gray-900">Industry Currency Verifier</h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800">
            NLP + Web Scraping
          </span>
        </div>
        <p className="text-gray-600">
          Scan LinkedIn/GitHub for relevance • NLP entity extraction + web scraping • Automated
          currency evidence
        </p>
      </div>

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-teal-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Total Profiles</div>
            <div className="text-2xl font-bold text-teal-600">{dashboardStats.total_profiles}</div>
            <div className="text-xs text-gray-500 mt-1">
              {dashboardStats.current_profiles} current
            </div>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Expiring Soon</div>
            <div className="text-2xl font-bold text-yellow-600">{dashboardStats.expiring_soon}</div>
            <div className="text-xs text-gray-500 mt-1">
              {dashboardStats.expired_profiles} expired
            </div>
          </div>

          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Verification Scans</div>
            <div className="text-2xl font-bold text-blue-600">{dashboardStats.total_scans}</div>
            <div className="text-xs text-gray-500 mt-1">
              Avg score: {dashboardStats.avg_currency_score.toFixed(1)}
            </div>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 mb-1">Activities Found</div>
            <div className="text-2xl font-bold text-purple-600">
              {dashboardStats.total_linkedin_activities + dashboardStats.total_github_activities}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {dashboardStats.total_evidence_docs} evidence docs
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-4">
          {[
            { id: 'profiles', label: '👤 Profiles' },
            { id: 'verify', label: '🔍 Verify' },
            { id: 'scans', label: '📊 Scans' },
            { id: 'linkedin', label: '💼 LinkedIn' },
            { id: 'github', label: '💻 GitHub' },
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
        {/* Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trainer Profiles</h2>

            {/* Create Profile Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Create New Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={profileForm.trainer_name}
                  onChange={e => setProfileForm({ ...profileForm, trainer_name: e.target.value })}
                  placeholder="Trainer Name"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="Email"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="url"
                  value={profileForm.linkedin_url}
                  onChange={e => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                  placeholder="LinkedIn URL (e.g., https://linkedin.com/in/username)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="url"
                  value={profileForm.github_url}
                  onChange={e => setProfileForm({ ...profileForm, github_url: e.target.value })}
                  placeholder="GitHub URL (e.g., https://github.com/username)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="text"
                  value={profileForm.primary_industry}
                  onChange={e =>
                    setProfileForm({ ...profileForm, primary_industry: e.target.value })
                  }
                  placeholder="Primary Industry (e.g., Information Technology)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="number"
                  value={profileForm.years_experience}
                  onChange={e =>
                    setProfileForm({ ...profileForm, years_experience: parseInt(e.target.value) })
                  }
                  placeholder="Years of Experience"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={handleCreateProfile}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
              >
                ➕ Create Profile
              </button>
            </div>

            {/* Profiles List */}
            {profiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No profiles created yet. Create your first profile above.
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map(profile => (
                  <div
                    key={profile.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{profile.trainer_name}</h3>
                        <p className="text-sm text-gray-600">
                          {profile.profile_number} • {profile.primary_industry}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(profile.currency_status)}`}
                      >
                        {profile.currency_status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-teal-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Currency Score</div>
                        <div className="text-xl font-bold text-teal-600">
                          {profile.currency_score.toFixed(1)}/100
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Last Verified</div>
                        <div className="text-sm font-medium text-blue-600">
                          {profile.last_verified_date || 'Never'}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 text-sm mb-3">
                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          💼 LinkedIn
                        </a>
                      )}
                      {profile.github_url && (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline"
                        >
                          💻 GitHub
                        </a>
                      )}
                    </div>

                    {profile.specializations && profile.specializations.length > 0 && (
                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">Specializations:</div>
                        <div className="flex flex-wrap gap-2">
                          {profile.specializations.map((spec, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded text-xs"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleVerifyProfile(profile.id)}
                        disabled={verifying}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium disabled:opacity-50"
                      >
                        {verifying ? '🔄 Verifying...' : '🔍 Quick Verify'}
                      </button>
                      <button
                        onClick={() => handleStartScan(profile.id)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                      >
                        📊 Start Scan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verify Industry Currency</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Scan LinkedIn profile for posts, certifications, and work history</li>
                <li>Scrape GitHub repositories, commits, and contributions</li>
                <li>Extract entities using NLP (technologies, skills, companies)</li>
                <li>Calculate currency score based on recency, relevance, and frequency</li>
                <li>Generate automated evidence documents for RTO compliance</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Profile to Verify
              </label>
              <select
                value={selectedProfile || ''}
                onChange={e => setSelectedProfile(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              >
                <option value="">-- Select a profile --</option>
                {profiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.trainer_name} - {profile.primary_industry}
                  </option>
                ))}
              </select>

              <button
                onClick={() => selectedProfile && handleVerifyProfile(selectedProfile)}
                disabled={!selectedProfile || verifying}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? '🔄 Verifying...' : '🔍 Start Full Verification'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">💼</div>
                <div className="font-semibold text-blue-900">LinkedIn Scan</div>
                <div className="text-sm text-blue-700">Extract activities & skills</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">💻</div>
                <div className="font-semibold text-purple-900">GitHub Scan</div>
                <div className="text-sm text-purple-700">Analyze repos & commits</div>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🤖</div>
                <div className="font-semibold text-teal-900">NLP Analysis</div>
                <div className="text-sm text-teal-700">Entity extraction & relevance</div>
              </div>
            </div>
          </div>
        )}

        {/* Scans Tab */}
        {activeTab === 'scans' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verification Scans</h2>

            {scans.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No scans performed yet. Start a verification scan from the "Profiles" or "Verify"
                tab.
              </div>
            ) : (
              <div className="space-y-4">
                {scans.map(scan => (
                  <div key={scan.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{scan.scan_number}</h3>
                        <p className="text-sm text-gray-600">
                          {scan.scan_type} scan • {new Date(scan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getScanStatusColor(scan.scan_status)}`}
                      >
                        {scan.scan_status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-teal-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Currency Score</div>
                        <div className="text-xl font-bold text-teal-600">
                          {scan.currency_score.toFixed(1)}/100
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Items Found</div>
                        <div className="text-xl font-bold text-blue-600">
                          {scan.total_items_found}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Relevant</div>
                        <div className="text-xl font-bold text-purple-600">
                          {scan.relevant_items_count}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mb-3">
                      {scan.sources_to_scan &&
                        scan.sources_to_scan.map((source, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            {source === 'linkedin'
                              ? '💼 LinkedIn'
                              : source === 'github'
                                ? '💻 GitHub'
                                : source}
                          </span>
                        ))}
                    </div>

                    {scan.scan_status === 'completed' && (
                      <button
                        onClick={() => handleGenerateEvidence(scan.id)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium"
                      >
                        📋 Generate Evidence
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LinkedIn Tab */}
        {activeTab === 'linkedin' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">LinkedIn Activities</h2>

            {linkedInActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No LinkedIn activities extracted yet. Run a verification scan to extract activities.
              </div>
            ) : (
              <div className="space-y-4">
                {linkedInActivities
                  .filter(a => a.is_industry_relevant)
                  .map(activity => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{activity.title}</h3>
                          <p className="text-sm text-gray-600">
                            {activity.activity_number} • {activity.activity_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-teal-600">
                            {(activity.relevance_score * 100).toFixed(0)}% relevant
                          </div>
                          <div className="text-xs text-gray-500">{activity.activity_date}</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{activity.description}</p>

                      {activity.skills_mentioned && activity.skills_mentioned.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-600 mb-1">Skills:</div>
                          <div className="flex flex-wrap gap-1">
                            {activity.skills_mentioned.map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activity.technologies && activity.technologies.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Technologies:</div>
                          <div className="flex flex-wrap gap-1">
                            {activity.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* GitHub Tab */}
        {activeTab === 'github' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">GitHub Activities</h2>

            {githubActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No GitHub activities extracted yet. Run a verification scan to extract activities.
              </div>
            ) : (
              <div className="space-y-4">
                {githubActivities
                  .filter(a => a.is_industry_relevant)
                  .map(activity => (
                    <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{activity.repository_name}</h3>
                          <p className="text-sm text-gray-600">
                            {activity.activity_number} • {activity.activity_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-purple-600">
                            {(activity.relevance_score * 100).toFixed(0)}% relevant
                          </div>
                          <div className="text-xs text-gray-500">⭐ {activity.stars} stars</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{activity.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Language:</span>
                          <span className="ml-2 font-medium">{activity.language}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Commits:</span>
                          <span className="ml-2 font-medium">{activity.commits_count}</span>
                        </div>
                      </div>

                      {activity.technologies && activity.technologies.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Technologies:</div>
                          <div className="flex flex-wrap gap-1">
                            {activity.technologies.map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">Currency Evidence Documents</h2>

            {evidenceDocuments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No evidence documents generated yet. Generate evidence from completed scans.
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
                        <h3 className="font-bold text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-600">{doc.evidence_number}</p>
                      </div>
                      <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                        {doc.evidence_type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="bg-teal-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600">Currency Score</div>
                        <div className="text-lg font-bold text-teal-600">
                          {doc.currency_score.toFixed(1)}/100
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600">Total Activities</div>
                        <div className="text-lg font-bold text-blue-600">
                          {doc.total_activities}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="text-xs text-gray-600">Created</div>
                        <div className="text-sm font-medium text-purple-600">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-medium">
                      📥 Download Evidence
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
