'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Types
interface Integration {
  id: string;
  integration_type: string;
  integration_type_display: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  status_display: string;
  config: Record<string, any>;
  api_base_url: string;
  api_key: string;
  webhook_url: string;
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  last_sync_status: string;
  created_at: string;
  updated_at: string;
}

interface IntegrationLog {
  id: string;
  action: string;
  action_display: string;
  status: string;
  message: string;
  created_at: string;
}

const INTEGRATION_CONFIGS = {
  axcelerate: {
    name: 'Axcelerate',
    description: 'Training management and RTO compliance platform',
    icon: '📚',
    color: 'from-purple-600 to-purple-700',
    features: ['Student Management', 'Course Sync', 'Compliance Reporting', 'USI Validation'],
    fields: [
      { key: 'axcelerate_subdomain', label: 'Subdomain', type: 'text', placeholder: 'yourschool' },
      { key: 'axcelerate_wstoken', label: 'WS Token', type: 'password', placeholder: 'Enter WS Token' },
    ],
  },
  canvas: {
    name: 'Canvas LMS',
    description: 'Learning management system for education',
    icon: '🎨',
    color: 'from-red-600 to-red-700',
    features: ['Course Management', 'Gradebook Sync', 'Assignment Integration', 'Student Analytics'],
    fields: [
      { key: 'canvas_domain', label: 'Canvas Domain', type: 'text', placeholder: 'yourschool.instructure.com' },
      { key: 'canvas_account_id', label: 'Account ID', type: 'text', placeholder: '12345' },
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter Canvas API Key' },
    ],
  },
  xero: {
    name: 'Xero',
    description: 'Cloud accounting and financial management',
    icon: '💰',
    color: 'from-blue-600 to-blue-700',
    features: ['Invoice Sync', 'Payment Tracking', 'Financial Reporting', 'Bank Reconciliation'],
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'OAuth Client ID' },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'OAuth Client Secret' },
      { key: 'xero_tenant_id', label: 'Tenant ID', type: 'text', placeholder: 'Xero Tenant ID' },
    ],
  },
  myob: {
    name: 'MYOB',
    description: 'Business and accounting software',
    icon: '📊',
    color: 'from-green-600 to-green-700',
    features: ['Accounting Integration', 'Invoicing', 'Payroll Sync', 'GST Reporting'],
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', placeholder: 'OAuth Client ID' },
      { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'OAuth Client Secret' },
      { key: 'myob_company_file_id', label: 'Company File ID', type: 'text', placeholder: 'Company File ID' },
    ],
  },
};

export default function IntegrationsPage() {
  const params = useParams();
  const tenantSlug = params.tenantSlug as string;

  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [showLogsModal, setShowLogsModal] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, [tenantSlug]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      // const response = await api.getIntegrations(tenantSlug);
      const mockData: Integration[] = [
        {
          id: '1',
          integration_type: 'canvas',
          integration_type_display: 'Canvas LMS',
          name: 'Canvas LMS Integration',
          description: 'Learning management system integration',
          status: 'active',
          status_display: 'Active',
          config: { canvas_domain: 'demo.instructure.com', canvas_account_id: '12345' },
          api_base_url: 'https://demo.instructure.com/api/v1',
          api_key: '***',
          webhook_url: '',
          auto_sync_enabled: true,
          sync_interval_minutes: 60,
          last_sync_at: '2025-10-24T10:30:00Z',
          last_sync_status: 'success',
          created_at: '2025-10-01T00:00:00Z',
          updated_at: '2025-10-24T10:30:00Z',
        },
      ];
      setIntegrations(mockData);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIntegration = (type: string) => {
    setSelectedType(type);
    setFormData({
      integration_type: type,
      name: `${INTEGRATION_CONFIGS[type as keyof typeof INTEGRATION_CONFIGS].name} Integration`,
      description: '',
      status: 'pending',
      config: {},
      auto_sync_enabled: false,
      sync_interval_minutes: 60,
    });
    setShowAddModal(true);
  };

  const handleSaveIntegration = async () => {
    try {
      setSaving(true);
      // In production: await api.createIntegration(tenantSlug, formData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Integration configured successfully!');
      setShowAddModal(false);
      setShowConfigModal(false);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to save integration:', error);
      alert('Failed to save integration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async (integration: Integration) => {
    try {
      // In production: await api.connectIntegration(tenantSlug, integration.id);
      alert(`${integration.name} connected successfully!`);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return;
    }
    
    try {
      // In production: await api.disconnectIntegration(tenantSlug, integration.id);
      alert(`${integration.name} disconnected`);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const handleSync = async (integration: Integration) => {
    try {
      // In production: await api.syncIntegration(tenantSlug, integration.id);
      alert(`Sync initiated for ${integration.name}`);
      loadIntegrations();
    } catch (error) {
      console.error('Failed to sync integration:', error);
    }
  };

  const loadLogs = async (integration: Integration) => {
    try {
      // In production: const response = await api.getIntegrationLogs(tenantSlug, integration.id);
      const mockLogs: IntegrationLog[] = [
        {
          id: '1',
          action: 'sync',
          action_display: 'Synced',
          status: 'success',
          message: 'Successfully synced 150 students',
          created_at: '2025-10-24T10:30:00Z',
        },
        {
          id: '2',
          action: 'connect',
          action_display: 'Connected',
          status: 'success',
          message: 'Integration connected successfully',
          created_at: '2025-10-24T09:00:00Z',
        },
      ];
      setLogs(mockLogs);
      setShowLogsModal(true);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={`/dashboard/${tenantSlug}`} className="hover:text-gray-700">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900">Integrations</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="mt-2 text-gray-600">
                Connect your third-party services and automate workflows
              </p>
            </div>
          </div>
        </div>

        {/* Active Integrations */}
        {integrations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((integration) => {
                const config = INTEGRATION_CONFIGS[integration.integration_type as keyof typeof INTEGRATION_CONFIGS];
                return (
                  <div key={integration.id} className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center text-2xl`}>
                          {config.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{config.name}</h3>
                          <p className="text-sm text-gray-600">{config.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(integration.status)}
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Sync:</span>
                        <span className="font-medium text-gray-900">{formatDate(integration.last_sync_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Auto-Sync:</span>
                        <span className="font-medium text-gray-900">
                          {integration.auto_sync_enabled ? `Every ${integration.sync_interval_minutes} min` : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {integration.status === 'active' ? (
                        <>
                          <button
                            onClick={() => handleSync(integration)}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Sync Now
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setFormData(integration);
                              setShowConfigModal(true);
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Configure
                          </button>
                          <button
                            onClick={() => loadLogs(integration)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            Logs
                          </button>
                          <button
                            onClick={() => handleDisconnect(integration)}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Integrations */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(INTEGRATION_CONFIGS).map(([type, config]) => {
              const existingIntegration = integrations.find(i => i.integration_type === type);
              if (existingIntegration) return null;

              return (
                <div key={type} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-lg flex items-center justify-center text-3xl mb-4`}>
                    {config.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{config.description}</p>
                  
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-medium mb-2">Features:</p>
                    <ul className="space-y-1">
                      {config.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                          <svg className="w-3 h-3 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => handleAddIntegration(type)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Add Integration
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Integration Modal */}
        {showAddModal && selectedType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Configure {INTEGRATION_CONFIGS[selectedType as keyof typeof INTEGRATION_CONFIGS].name}
                </h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    {INTEGRATION_CONFIGS[selectedType as keyof typeof INTEGRATION_CONFIGS].description}
                  </p>
                </div>

                <form className="space-y-4">
                  {/* Integration Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Integration Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Integration-specific fields */}
                  {INTEGRATION_CONFIGS[selectedType as keyof typeof INTEGRATION_CONFIGS].fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.key] || formData.config?.[field.key] || ''}
                        onChange={(e) => {
                          if (field.key.startsWith('axcelerate_') || field.key.startsWith('canvas_') || field.key.startsWith('xero_') || field.key.startsWith('myob_')) {
                            setFormData({
                              ...formData,
                              config: { ...formData.config, [field.key]: e.target.value }
                            });
                          } else {
                            setFormData({ ...formData, [field.key]: e.target.value });
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}

                  {/* Auto-sync settings */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium text-gray-900">Auto-Sync</p>
                        <p className="text-sm text-gray-600">Automatically sync data at regular intervals</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.auto_sync_enabled || false}
                          onChange={(e) => setFormData({ ...formData, auto_sync_enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.auto_sync_enabled && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sync Interval (minutes)
                        </label>
                        <input
                          type="number"
                          min="15"
                          value={formData.sync_interval_minutes || 60}
                          onChange={(e) => setFormData({ ...formData, sync_interval_minutes: parseInt(e.target.value) })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </form>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIntegration}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Integration'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configure Modal (similar to Add Modal) */}
        {showConfigModal && selectedIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Configure {selectedIntegration.name}
                </h2>
                <button 
                  onClick={() => setShowConfigModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">
                  Update integration settings and credentials.
                </p>

                <form className="space-y-4">
                  {/* Similar form fields as Add Modal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Integration Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Auto-Sync</p>
                        <p className="text-sm text-gray-600">Automatically sync data at regular intervals</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.auto_sync_enabled || false}
                          onChange={(e) => setFormData({ ...formData, auto_sync_enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </form>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveIntegration}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs Modal */}
        {showLogsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Integration Logs</h2>
                <button 
                  onClick={() => setShowLogsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {log.action_display}
                          </span>
                          <span className="text-sm text-gray-600">{formatDate(log.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-900">{log.message}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setShowLogsModal(false)}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
