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

          {/* TAS Generator */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-purple-200">
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
