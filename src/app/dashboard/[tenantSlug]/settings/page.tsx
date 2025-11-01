'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface TenantSettings {
  // General Settings
  name: string;
  slug: string;
  domain: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;

  // Subscription
  subscription_tier: 'free' | 'starter' | 'professional' | 'enterprise';
  billing_email: string;

  // Preferences
  settings: {
    timezone: string;
    default_model: string;
    enable_analytics: boolean;
    enable_notifications: boolean;
    notification_email: boolean;
    notification_slack: boolean;
    slack_webhook_url?: string;
  };

  // Limits & Quotas
  quota: {
    max_api_keys: number;
    max_users: number;
    monthly_api_calls: number;
    monthly_tokens: number;
    monthly_budget: number;
  };
}

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'general' | 'preferences' | 'notifications' | 'quotas' | 'advanced'
  >('general');
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [formData, setFormData] = useState<TenantSettings | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }
    loadSettings();
  }, [tenantSlug, router]);

  const loadSettings = async () => {
    setLoading(true);

    // Mock data - replace with actual API call
    // const data = await api.getTenantSettings(tenantSlug, authToken);

    setTimeout(() => {
      const mockSettings: TenantSettings = {
        name: 'Acme Training College',
        slug: 'acme-college',
        domain: 'acme-college.nextcore.ai',
        contact_name: 'Nick Edwards',
        contact_email: 'nick@acme-college.com',
        contact_phone: '+1 (555) 123-4567',
        subscription_tier: 'professional',
        billing_email: 'billing@acme-college.com',
        settings: {
          timezone: 'America/New_York',
          default_model: 'gpt-4',
          enable_analytics: true,
          enable_notifications: true,
          notification_email: true,
          notification_slack: false,
          slack_webhook_url: '',
        },
        quota: {
          max_api_keys: 10,
          max_users: 25,
          monthly_api_calls: 50000,
          monthly_tokens: 10000000,
          monthly_budget: 500,
        },
      };
      setSettings(mockSettings);
      setFormData(mockSettings);
      setLoading(false);
    }, 500);
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Mock save - replace with actual API call
      // await api.updateTenantSettings(tenantSlug, formData, authToken);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setSettings(formData);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any, nested?: string) => {
    if (!formData) return;

    if (nested) {
      setFormData({
        ...formData,
        [nested]: {
          ...(formData as any)[nested],
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!formData) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'preferences', label: 'Preferences', icon: '🎛️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'quotas', label: 'Quotas & Limits', icon: '📊' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${tenantSlug}`} className="text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">✓ {successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">✗ {errorMessage}</p>
          </div>
        )}

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-4">
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">General Settings</h2>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Organization Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => handleInputChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                        <input
                          type="text"
                          value={formData.slug}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Domain
                      </label>
                      <input
                        type="text"
                        value={formData.domain}
                        onChange={e => handleInputChange('domain', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your custom domain for API access
                      </p>
                    </div>

                    <hr className="border-gray-200" />

                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={e => handleInputChange('contact_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          value={formData.contact_email}
                          onChange={e => handleInputChange('contact_email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={e => handleInputChange('contact_phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Billing Email
                      </label>
                      <input
                        type="email"
                        value={formData.billing_email}
                        onChange={e => handleInputChange('billing_email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Where invoices will be sent</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={formData.settings.timezone}
                        onChange={e => handleInputChange('timezone', e.target.value, 'settings')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="UTC">UTC</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Australia/Sydney">Sydney (AEST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default AI Model
                      </label>
                      <select
                        value={formData.settings.default_model}
                        onChange={e =>
                          handleInputChange('default_model', e.target.value, 'settings')
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="gpt-4">GPT-4 (Most Capable)</option>
                        <option value="gpt-4-turbo">GPT-4 Turbo (Fast & Capable)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast & Affordable)</option>
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Default model for API requests without model specification
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable Analytics</h4>
                        <p className="text-sm text-gray-600">
                          Track usage statistics and performance metrics
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.settings.enable_analytics}
                          onChange={e =>
                            handleInputChange('enable_analytics', e.target.checked, 'settings')
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable Notifications</h4>
                        <p className="text-sm text-gray-600">
                          Receive alerts about important events
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.settings.enable_notifications}
                          onChange={e =>
                            handleInputChange('enable_notifications', e.target.checked, 'settings')
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {formData.settings.enable_notifications && (
                      <>
                        <hr className="border-gray-200" />

                        <h3 className="text-lg font-semibold text-gray-900">
                          Notification Channels
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                            <p className="text-sm text-gray-600">
                              Send alerts to {formData.contact_email}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.settings.notification_email}
                              onChange={e =>
                                handleInputChange(
                                  'notification_email',
                                  e.target.checked,
                                  'settings'
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Slack Notifications</h4>
                            <p className="text-sm text-gray-600">Send alerts to Slack channel</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.settings.notification_slack}
                              onChange={e =>
                                handleInputChange(
                                  'notification_slack',
                                  e.target.checked,
                                  'settings'
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {formData.settings.notification_slack && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Slack Webhook URL
                            </label>
                            <input
                              type="url"
                              value={formData.settings.slack_webhook_url || ''}
                              onChange={e =>
                                handleInputChange('slack_webhook_url', e.target.value, 'settings')
                              }
                              placeholder="https://hooks.slack.com/services/..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              <a
                                href="https://api.slack.com/messaging/webhooks"
                                target="_blank"
                                className="text-blue-600 hover:underline"
                              >
                                Learn how to create a Slack webhook
                              </a>
                            </p>
                          </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">
                            What you'll be notified about:
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Quota limits reached (80%, 90%, 100%)</li>
                            <li>• API key usage from new locations</li>
                            <li>• Failed authentication attempts</li>
                            <li>• Service disruptions or downtime</li>
                            <li>• Monthly usage reports</li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quotas */}
              {activeTab === 'quotas' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Quotas & Limits</h2>

                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      ℹ️ These limits are determined by your subscription tier. Upgrade your plan to
                      increase limits.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max API Keys
                        </label>
                        <div className="text-3xl font-bold text-gray-900">
                          {formData.quota.max_api_keys}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum number of active API keys
                        </p>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Team Members
                        </label>
                        <div className="text-3xl font-bold text-gray-900">
                          {formData.quota.max_users}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum users in your organization
                        </p>
                      </div>
                    </div>

                    <hr className="border-gray-200" />

                    <h3 className="text-lg font-semibold text-gray-900">Monthly Limits</h3>

                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Calls per Month
                        </label>
                        <div className="text-3xl font-bold text-gray-900">
                          {formData.quota.monthly_api_calls.toLocaleString()}
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: '31%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">15,847 used (31% of limit)</p>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tokens per Month
                        </label>
                        <div className="text-3xl font-bold text-gray-900">
                          {(formData.quota.monthly_tokens / 1000000).toFixed(1)}M
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-blue-600 rounded-full"
                            style={{ width: '28%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">2.8M used (28% of limit)</p>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monthly Budget
                        </label>
                        <div className="text-3xl font-bold text-gray-900">
                          ${formData.quota.monthly_budget}
                        </div>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-600 rounded-full"
                            style={{ width: '25%' }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">$127.45 used (25% of limit)</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Current Plan: Professional
                      </h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Need higher limits? Upgrade to Enterprise for unlimited API calls and custom
                        quotas.
                      </p>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                        View Plans & Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced */}
              {activeTab === 'advanced' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Settings</h2>

                  <div className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        API Configuration
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Advanced settings for API behavior and security
                      </p>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">Require HTTPS</h4>
                            <p className="text-sm text-gray-600">Only accept requests over HTTPS</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked disabled className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-400 rounded-full peer peer-checked:bg-gray-400 cursor-not-allowed"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">IP Whitelist</h4>
                            <p className="text-sm text-gray-600">
                              Restrict API access to specific IP addresses
                            </p>
                          </div>
                          <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Irreversible and destructive actions
                      </p>

                      <div className="space-y-3">
                        <button className="w-full px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                          Export All Data
                        </button>

                        <button className="w-full px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                          Reset All API Keys
                        </button>

                        <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                          Delete Organization
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Organization ID</h3>
                      <code className="block text-sm bg-white p-3 rounded border border-gray-200 font-mono">
                        01894d35-1a67-4980-b34f-07b3814517e5
                      </code>
                      <p className="text-xs text-gray-500 mt-2">
                        Use this ID when contacting support
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setFormData(settings);
                    setSuccessMessage('');
                    setErrorMessage('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Changes
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
