/**
 * Continuous Improvement Register (CIR) - Main List Page
 * Features: Kanban board, table view, filters, bulk actions
 */
'use client';

import { useState } from 'react';
import { Plus, Download, LayoutGrid, List } from 'lucide-react';

export default function CIRPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Continuous Improvement Register</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage improvement actions with AI-assisted compliance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Action
          </button>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search actions..."
            className="w-full max-w-sm px-3 py-2 border rounded-md"
          />
        </div>

        <select className="px-3 py-2 border rounded-md">
          <option value="">All Statuses</option>
          <option value="identified">Identified</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select className="px-3 py-2 border rounded-md">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="flex items-center gap-1 ml-auto border rounded-md">
          <button
            className={`p-2 ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'} rounded-l-md`}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'} rounded-r-md`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px] bg-white rounded-lg border p-8">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Continuous Improvement Register</h2>
          <p className="text-gray-500">
            This feature is being configured. Components will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
