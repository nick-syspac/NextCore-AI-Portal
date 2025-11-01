/**
 * React Query hooks for Continuous Improvement Register (CIR) API
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types
export interface ImprovementAction {
  id: number;
  action_number: string;
  title: string;
  description: string;
  category: number;
  category_name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priority_display: string;
  source: string;
  source_display: string;
  status: 'identified' | 'planned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  status_display: string;
  compliance_status: 'compliant' | 'at_risk' | 'overdue' | 'completed';
  compliance_status_display: string;
  is_overdue: boolean;
  days_until_due: number | null;
  progress_percentage: number;
  responsible_person: number | null;
  responsible_person_name: string | null;
  identified_date: string;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  ai_summary: string;
  ai_keywords: string[];
  ai_related_standards: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ActionStep {
  id: number;
  improvement_action: number;
  title: string;
  description: string;
  sequence_order: number;
  owner: number | null;
  owner_name: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  status_display: string;
  due_date: string | null;
  is_overdue: boolean;
}

export interface Comment {
  id: number;
  improvement_action: number;
  body: string;
  visibility: string;
  author: number;
  author_name: string;
  author_email: string;
  created_at: string;
  edited: boolean;
  replies_count: number;
}

export interface ClauseLink {
  id: number;
  improvement_action: number;
  clause: number;
  clause_number: string;
  clause_title: string;
  standard_name: string;
  source: 'ai' | 'human';
  confidence: number;
  reviewed: boolean;
}

export interface DashboardStats {
  total_actions: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  overdue_count: number;
  at_risk_count: number;
  completion_rate: number;
  avg_days_to_complete: number;
  critical_compliance_count: number;
  recent_completions: number;
}

// Query keys
export const cirKeys = {
  all: ['cir'] as const,
  actions: () => [...cirKeys.all, 'actions'] as const,
  action: (id: number) => [...cirKeys.actions(), id] as const,
  actionsByFilter: (filters: any) => [...cirKeys.actions(), 'filtered', filters] as const,
  steps: (actionId: number) => [...cirKeys.all, 'steps', actionId] as const,
  comments: (actionId: number) => [...cirKeys.all, 'comments', actionId] as const,
  clauseLinks: (actionId: number) => [...cirKeys.all, 'clause-links', actionId] as const,
  dashboardStats: () => [...cirKeys.all, 'dashboard-stats'] as const,
  complianceDashboard: () => [...cirKeys.all, 'compliance-dashboard'] as const,
};

// Hooks

/**
 * Fetch list of improvement actions with filters
 */
export function useImprovementActions(filters?: {
  status?: string;
  priority?: string;
  compliance?: string;
  category?: string;
  assignee?: string;
  search?: string;
  overdue?: boolean;
}) {
  return useQuery({
    queryKey: cirKeys.actionsByFilter(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.compliance) params.append('compliance_status', filters.compliance);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.assignee) params.append('responsible_person', filters.assignee);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.overdue) params.append('overdue', 'true');

      const response = await apiClient.get<ImprovementAction[]>(
        `/continuous_improvement/actions/?${params.toString()}`
      );

      return response.data;
    },
  });
}

/**
 * Fetch single improvement action detail
 */
export function useImprovementAction(id: number) {
  return useQuery({
    queryKey: cirKeys.action(id),
    queryFn: async () => {
      const response = await apiClient.get<ImprovementAction>(
        `/continuous_improvement/actions/${id}/`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Create new improvement action
 */
export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ImprovementAction>) => {
      const response = await apiClient.post('/continuous_improvement/actions/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cirKeys.actions() });
      queryClient.invalidateQueries({ queryKey: cirKeys.dashboardStats() });
    },
  });
}

/**
 * Update improvement action
 */
export function useUpdateAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ImprovementAction>) => {
      const response = await apiClient.patch(`/continuous_improvement/actions/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cirKeys.action(id) });
      queryClient.invalidateQueries({ queryKey: cirKeys.actions() });
      queryClient.invalidateQueries({ queryKey: cirKeys.dashboardStats() });
    },
  });
}

/**
 * Trigger AI classification for an action
 */
export function useClassifyAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        `/continuous_improvement/actions-cir/${id}/ai_classify/`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cirKeys.action(id) });
      queryClient.invalidateQueries({ queryKey: cirKeys.clauseLinks(id) });
    },
  });
}

/**
 * Trigger AI summarization for an action
 */
export function useSummarizeAction(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options?: { max_length?: number; style?: string }) => {
      const response = await apiClient.post(
        `/continuous_improvement/actions-cir/${id}/ai_summarize/`,
        options
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cirKeys.action(id) });
    },
  });
}

/**
 * Fetch action steps
 */
export function useActionSteps(actionId: number) {
  return useQuery({
    queryKey: cirKeys.steps(actionId),
    queryFn: async () => {
      const response = await apiClient.get<ActionStep[]>(
        `/continuous_improvement/steps/?action_id=${actionId}`
      );
      return response.data;
    },
    enabled: !!actionId,
  });
}

/**
 * Create action step
 */
export function useCreateActionStep(actionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ActionStep>) => {
      const response = await apiClient.post('/continuous_improvement/steps/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cirKeys.steps(actionId) });
      queryClient.invalidateQueries({ queryKey: cirKeys.action(actionId) });
    },
  });
}

/**
 * Fetch comments for an action
 */
export function useComments(actionId: number) {
  return useQuery({
    queryKey: cirKeys.comments(actionId),
    queryFn: async () => {
      const response = await apiClient.get<Comment[]>(
        `/continuous_improvement/comments/?action_id=${actionId}`
      );
      return response.data;
    },
    enabled: !!actionId,
  });
}

/**
 * Create comment
 */
export function useCreateComment(actionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Comment>) => {
      const response = await apiClient.post('/continuous_improvement/comments/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cirKeys.comments(actionId) });
    },
  });
}

/**
 * Fetch clause links for an action
 */
export function useClauseLinks(actionId: number) {
  return useQuery({
    queryKey: cirKeys.clauseLinks(actionId),
    queryFn: async () => {
      const response = await apiClient.get<ClauseLink[]>(
        `/continuous_improvement/clause-links/?action_id=${actionId}`
      );
      return response.data;
    },
    enabled: !!actionId,
  });
}

/**
 * Create manual clause link
 */
export function useCreateClauseLink(actionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ClauseLink>) => {
      const response = await apiClient.post('/continuous_improvement/clause-links/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cirKeys.clauseLinks(actionId) });
    },
  });
}

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: cirKeys.dashboardStats(),
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>(
        '/continuous_improvement/actions/dashboard_stats/'
      );
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Fetch compliance dashboard data
 */
export function useComplianceDashboard() {
  return useQuery({
    queryKey: cirKeys.complianceDashboard(),
    queryFn: async () => {
      const response = await apiClient.get(
        '/continuous_improvement/actions-cir/compliance_dashboard/'
      );
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
