/**
 * Continuous Improvement Register (CIR) - Main List Page
 * Features: Kanban board, table view, filters, bulk actions
 */
'use client';

import { useState } from 'react';
import { Plus, Filter, Download, LayoutGrid, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ImprovementActionList } from '@/components/cir/ImprovementActionList';
import { ImprovementKanban } from '@/components/cir/ImprovementKanban';
import { CreateActionDialog } from '@/components/cir/CreateActionDialog';
import { useImprovementActions } from '@/lib/hooks/useCIR';

export default function CIRPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    compliance: '',
    category: '',
    assignee: '',
    search: '',
    overdue: false,
  });
  
  // Fetch actions with filters
  const { data: actions, isLoading, refetch } = useImprovementActions(filters);
  
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleClearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      compliance: '',
      category: '',
      assignee: '',
      search: '',
      overdue: false,
    });
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Continuous Improvement Register
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage improvement actions with AI-assisted compliance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Action
          </Button>
        </div>
      </div>
      
      {/* Filters & Controls */}
      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search actions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="identified">Identified</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Priority Filter */}
        <Select
          value={filters.priority}
          onValueChange={(value) => handleFilterChange('priority', value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Compliance Filter */}
        <Select
          value={filters.compliance}
          onValueChange={(value) => handleFilterChange('compliance', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Compliance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Clear Filters */}
        {Object.values(filters).some(v => v) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
        )}
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 ml-auto border rounded-md">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px]">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading actions...</p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          <ImprovementKanban actions={actions || []} refetch={refetch} />
        ) : (
          <ImprovementActionList actions={actions || []} refetch={refetch} />
        )}
      </div>
      
      {/* Create Dialog */}
      <CreateActionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
