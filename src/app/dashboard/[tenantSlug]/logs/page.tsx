'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface AuditEvent {
  id: string;
  tenant_id: string;
  event_type: string;
  severity: string;
  actor_type: string;
  actor_id: string;
  actor_username: string;
  resource_type: string;
  resource_id: string;
  action: string;
  status: string;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, any>;
  timestamp: string;
  hash: any;
  prev_hash: any;
}

export default function AuditLogsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantSlug = params.tenantSlug as string;

  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadLogs();
  }, [tenantSlug, eventTypeFilter, severityFilter, searchQuery, currentPage]);

  const loadLogs = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const data = await api.getAuditLogs(tenantSlug, authToken, {
        event_type: eventTypeFilter || undefined,
        severity: severityFilter || undefined,
        search: searchQuery || undefined,
        page: currentPage,
      });

      setLogs(data.results || data);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLog = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    if (logs.length === 0) {
      alert('No logs to verify');
      return;
    }

    try {
      const tenantId = logs[0].tenant_id;
      const result = await api.verifyAuditLog(tenantId, authToken);

      if (result.chain_valid) {
        alert(
          `✓ Audit chain verified!\n\nVerified ${result.verified_count} of ${result.total_events} events.\nChain integrity: VALID`
        );
      } else {
        alert(
          `✗ Audit chain verification FAILED!\n\nVerified: ${result.verified_count}/${result.total_events}\nBroken links: ${result.broken_links?.length || 0}\n\nSee console for details.`
        );
        console.error('Audit chain broken:', result.broken_links);
      }
    } catch (err) {
      console.error('Error verifying log:', err);
      alert('Error verifying log integrity');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading && logs.length === 0) {
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
              <Link href={`/dashboard/${tenantSlug}`} className="text-blue-600 hover:text-blue-800">
                ← Back to {tenantSlug}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600 mt-2">
            Security events and activity monitoring for {tenantSlug.replace(/-/g, ' ')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
              <select
                value={eventTypeFilter}
                onChange={e => setEventTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Events</option>
                <option value="auth">Authentication</option>
                <option value="api">API Access</option>
                <option value="admin">Admin Action</option>
                <option value="data">Data Access</option>
                <option value="config">Configuration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => {
                setEventTypeFilter('');
                setSeverityFilter('');
                setSearchQuery('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
            <div className="text-sm text-gray-600">{totalCount} total events</div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {logs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Audit Logs</h3>
            <p className="text-gray-600">No events match your current filters</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Event
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{log.action}</div>
                          <div className="text-sm text-gray-500">
                            {log.event_type} • {log.resource_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.actor_username}</div>
                          <div className="text-sm text-gray-500">{log.ip_address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(log.severity)}`}
                          >
                            {log.severity.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleVerifyLog()}
                            className="text-green-600 hover:text-green-900"
                            title="Verify entire audit chain integrity"
                          >
                            Verify Chain
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {currentPage}</span>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={logs.length < 20}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🔍 Audit Log Features</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• All events are cryptographically signed for tamper detection</li>
            <li>• Logs are immutable and form a verifiable chain</li>
            <li>• Use filters to quickly find specific events</li>
            <li>• Click "Verify" to check log integrity</li>
            <li>• Export functionality coming soon</li>
          </ul>
        </div>
      </main>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Event ID</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedLog.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timestamp</label>
                    <p className="text-sm text-gray-900">
                      {formatTimestamp(selectedLog.timestamp)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Event Type</label>
                    <p className="text-sm text-gray-900">{selectedLog.event_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Action</label>
                    <p className="text-sm text-gray-900">{selectedLog.action}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Actor</label>
                    <p className="text-sm text-gray-900">{selectedLog.actor_username}</p>
                    <p className="text-xs text-gray-500">{selectedLog.actor_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Resource</label>
                    <p className="text-sm text-gray-900">{selectedLog.resource_type}</p>
                    <p className="text-xs text-gray-500 font-mono">{selectedLog.resource_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Severity</label>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(selectedLog.severity)}`}
                    >
                      {selectedLog.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLog.status)}`}
                    >
                      {selectedLog.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">IP Address</label>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.ip_address}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">User Agent</label>
                  <p className="text-sm text-gray-900 break-all">{selectedLog.user_agent}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Metadata</label>
                  <pre className="mt-1 text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Event Hash</label>
                  <p className="text-xs text-gray-900 font-mono break-all">
                    {selectedLog.hash
                      ? typeof selectedLog.hash === 'string'
                        ? selectedLog.hash
                        : '[Binary Data]'
                      : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Previous Hash</label>
                  <p className="text-xs text-gray-900 font-mono break-all">
                    {selectedLog.prev_hash
                      ? typeof selectedLog.prev_hash === 'string'
                        ? selectedLog.prev_hash
                        : '[Binary Data]'
                      : 'Genesis Block'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleVerifyLog()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Verify Chain Integrity
                </button>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
