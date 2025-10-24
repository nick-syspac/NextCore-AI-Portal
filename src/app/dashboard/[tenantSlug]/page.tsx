'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UsageOverview } from '@/components/usage/UsageOverview';
import { QuotaWidget } from '@/components/usage/QuotaWidget';

export default function TenantDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                {tenantSlug}
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 capitalize">
            {tenantSlug.replace(/-/g, ' ')} Dashboard
          </h2>
          <p className="text-gray-600 mt-2">
            Tenant-specific features and management
          </p>
        </div>

        {/* Usage Overview Widget */}
        <div className="mb-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UsageOverview tenantSlug={tenantSlug} />
          </div>
          <div>
            <QuotaWidget tenantSlug={tenantSlug} />
          </div>
        </div>

        {/* EduAI Compliance Suite */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">🎓</div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">EduAI Compliance Suite</h2>
                <p className="text-blue-100 text-lg">
                  AI-powered tools for RTO compliance, audit readiness, and quality assurance
                </p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white text-sm font-medium">6 AI Tools</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* TAS Generator */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">TAS Generator</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-xs font-medium rounded-full">
                  ⚡ AI Powered
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Auto TAS builder • GPT-4 synthesis • 90% time reduction
              </p>
              <Link href={`/dashboard/${tenantSlug}/tas`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md font-semibold">
                  ✨ Generate TAS
                </button>
              </Link>
            </div>

            {/* Policy Comparator */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-blue-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Policy Comparator</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs font-medium rounded-full">
                  🤖 NLP Powered
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Compare policies to ASQA • Text similarity • Instant gap detection
              </p>
              <Link href={`/dashboard/${tenantSlug}/policy-comparator`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-md font-semibold">
                  🔍 Compare Policies
                </button>
              </Link>
            </div>

            {/* Audit Assistant */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Audit Assistant</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium rounded-full">
                  🤖 NER Powered
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Upload evidence • Auto-tag clauses • Clause-by-clause reports
              </p>
              <Link href={`/dashboard/${tenantSlug}/audit-assistant`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md font-semibold">
                  📋 Start Audit
                </button>
              </Link>
            </div>

            {/* Continuous Improvement Register */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">CI Register</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-xs font-medium rounded-full">
                  🤖 AI Classified
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Track improvements • AI classification • Real-time compliance
              </p>
              <Link href={`/dashboard/${tenantSlug}/continuous-improvement`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all shadow-md font-semibold">
                  📊 Manage Actions
                </button>
              </Link>
            </div>

            {/* Funding Eligibility Checker */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-indigo-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Funding Eligibility</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-xs font-medium rounded-full">
                  ⚖️ Rules Engine
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Validate eligibility • Rules engine • Prevent non-compliant enrolments
              </p>
              <Link href={`/dashboard/${tenantSlug}/funding-eligibility`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md font-semibold">
                  ✓ Check Eligibility
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* AssessAI Suite */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-lg shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">📝</div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">AssessAI Suite</h2>
                <p className="text-orange-100 text-lg">
                  Automate assessment writing, marking, moderation, and feedback
                </p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white text-sm font-medium">7 AI Tools</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Assessment Builder */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-orange-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Assessment Builder</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs font-medium rounded-full">
                  🎓 GPT-4
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Generate assessments from unit codes • Bloom's taxonomy detection • Compliant design
              </p>
              <Link href={`/dashboard/${tenantSlug}/assessment-builder`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all shadow-md font-semibold">
                  ✨ Build Assessment
                </button>
              </Link>
            </div>
            
            {/* Rubric Generator */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-pink-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Rubric Generator</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-red-100 text-pink-800 text-xs font-medium rounded-full">
                  📊 NLP Powered
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Auto-create marking guides • NLP summarization • Taxonomy tagging
              </p>
              <Link href={`/dashboard/${tenantSlug}/rubric-generator`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 transition-all shadow-md font-semibold">
                  📋 Generate Rubric
                </button>
              </Link>
            </div>

            {/* Auto-Marker */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Auto-Marker</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 text-xs font-medium rounded-full">
                  🤖 Semantic AI
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Grade short answers automatically • Semantic similarity scoring • 70% faster turnaround
              </p>
              <Link href={`/dashboard/${tenantSlug}/auto-marker`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md font-semibold">
                  ⚡ Auto-Mark
                </button>
              </Link>
            </div>

            {/* Feedback Assistant */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-teal-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Feedback Assistant</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 text-xs font-medium rounded-full">
                  💬 AI Powered
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Generate personalised feedback • Sentiment control + rubric mapping • Professional feedback at scale
              </p>
              <Link href={`/dashboard/${tenantSlug}/feedback-assistant`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md font-semibold">
                  ✨ Generate Feedback
                </button>
              </Link>
            </div>

            {/* Moderation Tool */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Moderation Tool</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 text-xs font-medium rounded-full">
                  ⚖️ Fairness AI
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Compare assessor decisions • Outlier detection + bias scoring • Validation & fairness evidence
              </p>
              <Link href={`/dashboard/${tenantSlug}/moderation-tool`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-md font-semibold">
                  ⚖️ Moderate Now
                </button>
              </Link>
            </div>

            {/* Evidence Mapper */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-indigo-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Evidence Mapper</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-800 text-xs font-medium rounded-full">
                  🔍 Search AI
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Tag submissions to criteria • Text extraction + embedding search • Stronger audit trail
              </p>
              <Link href={`/dashboard/${tenantSlug}/evidence-mapper`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md font-semibold">
                  🗂️ Map Evidence
                </button>
              </Link>
            </div>

            {/* Authenticity Check */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Authenticity Check</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-xs font-medium rounded-full">
                  🔍 Integrity AI
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Plagiarism + metadata verification • Embedding + anomaly detection • Academic integrity compliance
              </p>
              <Link href={`/dashboard/${tenantSlug}/authenticity-check`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md font-semibold">
                  🛡️ Check Authenticity
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* LearnAI Suite */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-lg shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">🎯</div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">LearnAI Suite</h2>
                <p className="text-emerald-100 text-lg">
                  Predict learner performance, personalise delivery, and enhance engagement
                </p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-white text-sm font-medium">Learning AI</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* LLN Predictor */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-emerald-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">LLN Predictor</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs font-medium rounded-full">
                  📚 NLP + ACSF
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Assess student foundation skills • NLP + ACSF model • Auto ACSF level predictions
              </p>
              <Link href={`/dashboard/${tenantSlug}/lln-predictor`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md font-semibold">
                  📊 Predict LLN
                </button>
              </Link>
            </div>

            {/* Risk Engine */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Risk Engine</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-orange-100 text-red-800 text-xs font-medium rounded-full">
                  ⚠️ ML + Sentiment
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Predict dropout risk • Logistic regression + sentiment fusion • Early warning alerts
              </p>
              <Link href={`/dashboard/${tenantSlug}/risk-engine`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md font-semibold">
                  🚨 Assess Risk
                </button>
              </Link>
            </div>

            {/* Adaptive Learning Pathway */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Adaptive Learning Pathway</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 text-xs font-medium rounded-full">
                  🎓 CF + Embeddings
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Recommend next learning step • Collaborative filtering + embeddings • Higher course completion rates
              </p>
              <Link href={`/dashboard/${tenantSlug}/adaptive-pathway`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md font-semibold">
                  🚀 Get Pathway
                </button>
              </Link>
            </div>

            {/* Engagement Heatmap */}
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-orange-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Engagement Heatmap</h3>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-medium rounded-full">
                  📊 Sentiment + Activity
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Track attendance, LMS use, discussion tone • Sentiment & activity analysis • Visual risk dashboard
              </p>
              <Link href={`/dashboard/${tenantSlug}/engagement-heatmap`}>
                <button className="w-full px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all shadow-md font-semibold">
                  🔥 View Heatmap
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Other Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Management</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Gateway */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Gateway</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Access AI models and manage API keys
              </p>
              <Link href={`/dashboard/${tenantSlug}/api-keys`}>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Manage API Keys
                </button>
              </Link>
            </div>

            {/* Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  5 Users
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Invite and manage team members
              </p>
              <Link href={`/dashboard/${tenantSlug}/members`}>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Team Members
                </button>
              </Link>
            </div>

            {/* Audit Logs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Audit Logs</h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  24h
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                View activity and security events
              </p>
              <Link href={`/dashboard/${tenantSlug}/logs`}>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Logs
                </button>
              </Link>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Configure tenant preferences
              </p>
              <Link href={`/dashboard/${tenantSlug}/settings`}>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Settings
                </button>
              </Link>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Billing</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Paid
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Subscription and payment info
              </p>
              <Link href={`/dashboard/${tenantSlug}/billing`}>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Billing
                </button>
              </Link>
            </div>

            {/* Integrations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Integrations</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Connect Axcelerate, Canvas, Xero, MYOB
              </p>
              <Link href={`/dashboard/${tenantSlug}/integrations`}>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Manage Integrations
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🚧 Feature Implementation In Progress
          </h3>
          <p className="text-blue-800">
            This is a placeholder dashboard. The actual tenant-specific features (API keys, user management, audit logs, etc.) 
            will be implemented based on your requirements. Each card above represents a planned feature area.
          </p>
        </div>
      </main>
    </div>
  );
}
