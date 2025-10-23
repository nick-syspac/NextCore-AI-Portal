'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Tenant {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  role: string;
  joined_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard: checking auth...');
    const authToken = localStorage.getItem('authToken');
    console.log('Dashboard: authToken exists?', !!authToken);
    
    if (!authToken) {
      console.log('Dashboard: No token, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('Dashboard: Fetching user data...');
    Promise.all([
      api.getMyTenants(authToken),
      api.getProfile(authToken)
    ])
      .then(([tenantsData, profileData]) => {
        console.log('Dashboard: Tenants data:', tenantsData);
        console.log('Dashboard: Profile data:', profileData);
        setTenants(tenantsData);
        setProfile(profileData);
      })
      .catch((error) => {
        console.error('Dashboard: API error:', error);
        localStorage.removeItem('authToken');
        router.push('/login');
      })
      .finally(() => setLoading(false));
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
            <h1 className="text-xl font-semibold text-gray-900">NextCore AI Cloud</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{profile?.username}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-2">
            Welcome back, {profile?.first_name || profile?.username}!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Tenants</h3>
          {tenants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                You don't belong to any tenants yet.
              </p>
              <p className="text-sm text-gray-500">
                Ask your administrator to send you an invitation.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenants.map((tenant) => (
                <Link
                  key={tenant.tenant_id}
                  href={`/dashboard/${tenant.tenant_slug}`}
                  className="block p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {tenant.tenant_name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    /{tenant.tenant_slug}
                  </p>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    tenant.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                    tenant.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                    tenant.role === 'member' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.role.toUpperCase()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {(profile?.is_superuser || tenants.some((t: Tenant) => t.role === 'admin' || t.role === 'owner')) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Admin Functions
            </h3>
            <p className="text-blue-800 text-sm mb-4">
              Invite new users to your tenants
            </p>
            <Link
              href="/invitations/create"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Invitation
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
