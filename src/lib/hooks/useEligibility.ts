/**
 * React Query hooks for Funding Eligibility system.
 * Provides type-safe API integration for eligibility checks.
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============================================================================
// Types
// ============================================================================

export interface Jurisdiction {
  code: string;
  name: string;
  active: boolean;
  config: Record<string, any>;
}

export interface Ruleset {
  id: number;
  version: string;
  jurisdiction_code: string;
  status: 'draft' | 'active' | 'retired';
  checksum: string;
  description: string;
  changelog: string;
  artifacts: RulesetArtifact[];
  created_by: number;
  created_by_details: UserMinimal;
  created_at: string;
  activated_at: string | null;
  retired_at: string | null;
}

export interface RulesetArtifact {
  id: number;
  type: 'jsonlogic' | 'rego' | 'python';
  name: string;
  blob: string;
  description: string;
  created_at: string;
}

export interface EligibilityRequest {
  id: number;
  tenant: number;
  person_id: string;
  course_id: string;
  jurisdiction_code: string;
  input: Record<string, any>;
  evidence_refs: string[];
  status: 'pending' | 'evaluating' | 'evaluated' | 'error';
  requested_at: string;
  evaluated_at: string | null;
  requested_by: number;
  requested_by_details: UserMinimal;
  metadata: Record<string, any>;
  external_lookups: ExternalLookup[];
  decision?: EligibilityDecision;
  attachments: EvidenceAttachment[];
}

export interface ExternalLookup {
  id: number;
  request: number;
  provider: string;
  request_data: Record<string, any>;
  response_data: Record<string, any>;
  status: 'pending' | 'success' | 'error' | 'timeout';
  error_message: string;
  latency_ms: number | null;
  cached_until: string | null;
  created_at: string;
}

export interface EligibilityDecision {
  id: number;
  request: number;
  ruleset: number;
  ruleset_details: {
    id: number;
    version: string;
    jurisdiction_code: string;
    status: string;
  };
  outcome: 'eligible' | 'ineligible' | 'review';
  reasons: Array<{
    code: string;
    message: string;
  }>;
  clause_refs: string[];
  decision_data: Record<string, any>;
  explanation: string;
  decided_by: 'system' | 'user';
  decided_by_user: number | null;
  decided_by_user_details: UserMinimal | null;
  decided_at: string;
  overrides: DecisionOverride[];
}

export interface DecisionOverride {
  id: number;
  decision: number;
  reason_code: string;
  justification: string;
  final_outcome: 'eligible' | 'ineligible' | 'review';
  approver: number;
  approver_details: UserMinimal;
  approved_at: string;
  policy_version: string;
  evidence_refs: string[];
}

export interface EvidenceAttachment {
  id: number;
  request: number;
  file_uri: string;
  filename: string;
  file_size: number;
  mime_type: string;
  type:
    | 'id'
    | 'concession'
    | 'residency'
    | 'visa'
    | 'qualification'
    | 'employment'
    | 'income'
    | 'other';
  verified: boolean;
  verifier: number | null;
  verifier_details: UserMinimal | null;
  verified_at: string | null;
  verification_notes: string;
  uploaded_by: number;
  uploaded_by_details: UserMinimal;
  uploaded_at: string;
}

export interface WebhookEndpoint {
  id: number;
  tenant: number;
  name: string;
  target: 'sms' | 'lms' | 'other';
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserMinimal {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// Query Keys
// ============================================================================

export const eligibilityKeys = {
  all: ['eligibility'] as const,

  jurisdictions: () => [...eligibilityKeys.all, 'jurisdictions'] as const,

  rulesets: () => [...eligibilityKeys.all, 'rulesets'] as const,
  ruleset: (id: number) => [...eligibilityKeys.rulesets(), id] as const,
  rulesetsByJurisdiction: (jurisdiction: string) =>
    [...eligibilityKeys.rulesets(), 'jurisdiction', jurisdiction] as const,

  requests: () => [...eligibilityKeys.all, 'requests'] as const,
  request: (id: number) => [...eligibilityKeys.requests(), id] as const,
  requestsByPerson: (personId: string) =>
    [...eligibilityKeys.requests(), 'person', personId] as const,
  requestsByStatus: (status: string) => [...eligibilityKeys.requests(), 'status', status] as const,

  decisions: () => [...eligibilityKeys.all, 'decisions'] as const,
  decision: (requestId: number) => [...eligibilityKeys.decisions(), requestId] as const,

  overrides: () => [...eligibilityKeys.all, 'overrides'] as const,
  override: (id: number) => [...eligibilityKeys.overrides(), id] as const,

  attachments: () => [...eligibilityKeys.all, 'attachments'] as const,
  attachmentsByRequest: (requestId: number) =>
    [...eligibilityKeys.attachments(), 'request', requestId] as const,

  webhooks: () => [...eligibilityKeys.all, 'webhooks'] as const,
  webhook: (id: number) => [...eligibilityKeys.webhooks(), id] as const,
};

// ============================================================================
// Jurisdictions
// ============================================================================

export function useJurisdictions(tenantSlug: string, options?: UseQueryOptions<Jurisdiction[]>) {
  return useQuery({
    queryKey: [...eligibilityKeys.jurisdictions(), tenantSlug],
    queryFn: async () => {
      const response = await apiClient.get(
        `/tenants/${tenantSlug}/funding-eligibility/jurisdictions/`
      );
      // Extract results array from paginated response
      return response.data.results || response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    ...options,
  });
}

// ============================================================================
// Rulesets
// ============================================================================

export function useRulesets(
  jurisdiction?: string,
  options?: UseQueryOptions<PaginatedResponse<Ruleset>>
) {
  return useQuery({
    queryKey: jurisdiction
      ? eligibilityKeys.rulesetsByJurisdiction(jurisdiction)
      : eligibilityKeys.rulesets(),
    queryFn: async () => {
      const params = jurisdiction ? { jurisdiction } : {};
      const response = await apiClient.get('/funding-eligibility/rulesets/', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useRuleset(id: number, options?: UseQueryOptions<Ruleset>) {
  return useQuery({
    queryKey: eligibilityKeys.ruleset(id),
    queryFn: async () => {
      const response = await apiClient.get(`/funding-eligibility/rulesets/${id}/`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useActivateRuleset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rulesetId: number) => {
      const response = await apiClient.post(`/funding-eligibility/rulesets/${rulesetId}/activate/`);
      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.rulesets() });
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.ruleset(data.ruleset.id) });
    },
  });
}

export function useCreateRuleset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Ruleset>) => {
      const response = await apiClient.post('/funding-eligibility/rulesets/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.rulesets() });
    },
  });
}

// ============================================================================
// Eligibility Requests
// ============================================================================

export function useEligibilityRequests(
  filters?: {
    status?: string;
    person_id?: string;
    jurisdiction?: string;
  },
  options?: UseQueryOptions<PaginatedResponse<EligibilityRequest>>
) {
  return useQuery({
    queryKey: filters?.status
      ? eligibilityKeys.requestsByStatus(filters.status)
      : filters?.person_id
        ? eligibilityKeys.requestsByPerson(filters.person_id)
        : eligibilityKeys.requests(),
    queryFn: async () => {
      const response = await apiClient.get('/funding-eligibility/requests/', { params: filters });
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  });
}

export function useEligibilityRequest(id: number, options?: UseQueryOptions<EligibilityRequest>) {
  return useQuery({
    queryKey: eligibilityKeys.request(id),
    queryFn: async () => {
      const response = await apiClient.get(`/funding-eligibility/requests/${id}/`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: query => {
      // Auto-refresh if pending/evaluating
      const data = query.state.data;
      if (data && ['pending', 'evaluating'].includes(data.status)) {
        return 3000; // 3 seconds
      }
      return false;
    },
    ...options,
  });
}

export function useCreateEligibilityRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      person_id: string;
      course_id: string;
      jurisdiction_code: string;
      input: Record<string, any>;
      metadata?: Record<string, any>;
    }) => {
      const response = await apiClient.post('/funding-eligibility/requests/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.requests() });
    },
  });
}

export function useEvaluateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      force,
      rulesetId,
    }: {
      requestId: number;
      force?: boolean;
      rulesetId?: number;
    }) => {
      const response = await apiClient.post(
        `/funding-eligibility/requests/${requestId}/evaluate/`,
        {
          force,
          ruleset_id: rulesetId,
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.request(variables.requestId) });
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.requests() });
    },
  });
}

export function useCheckEligibility(
  requestId: number,
  options?: UseQueryOptions<{
    can_enrol: boolean;
    reason: string;
    decision?: any;
  }>
) {
  return useQuery({
    queryKey: [...eligibilityKeys.request(requestId), 'check'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(
          `/funding-eligibility/requests/${requestId}/check_eligibility/`
        );
        return response.data;
      } catch (error: any) {
        // Handle 403 as valid response
        if (error.response?.status === 403) {
          return error.response.data;
        }
        throw error;
      }
    },
    enabled: !!requestId,
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}

// ============================================================================
// Overrides
// ============================================================================

export function useDecisionOverrides(
  decisionId?: number,
  options?: UseQueryOptions<PaginatedResponse<DecisionOverride>>
) {
  return useQuery({
    queryKey: eligibilityKeys.overrides(),
    queryFn: async () => {
      const params = decisionId ? { decision: decisionId } : {};
      const response = await apiClient.get('/funding-eligibility/overrides/', { params });
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}

export function useCreateOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      decision_id: number;
      reason_code: string;
      justification: string;
      final_outcome: 'eligible' | 'ineligible' | 'review';
      policy_version: string;
      evidence_refs?: string[];
    }) => {
      const response = await apiClient.post('/funding-eligibility/overrides/', data);
      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.overrides() });
      // Invalidate the related request
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.decisions() });
    },
  });
}

// ============================================================================
// Evidence Attachments
// ============================================================================

export function useAttachments(
  requestId?: number,
  options?: UseQueryOptions<PaginatedResponse<EvidenceAttachment>>
) {
  return useQuery({
    queryKey: requestId
      ? eligibilityKeys.attachmentsByRequest(requestId)
      : eligibilityKeys.attachments(),
    queryFn: async () => {
      const params = requestId ? { request: requestId } : {};
      const response = await apiClient.get('/funding-eligibility/attachments/', { params });
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}

export function useUploadEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      type,
      file,
    }: {
      requestId: number;
      type: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append('request_id', requestId.toString());
      formData.append('type', type);
      formData.append('file', file);

      const response = await apiClient.post('/funding-eligibility/attachments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: eligibilityKeys.attachmentsByRequest(variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.request(variables.requestId) });
    },
  });
}

export function useVerifyEvidence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attachmentId, notes }: { attachmentId: number; notes?: string }) => {
      const response = await apiClient.post(
        `/funding-eligibility/attachments/${attachmentId}/verify/`,
        { notes }
      );
      return response.data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.attachments() });
      queryClient.invalidateQueries({
        queryKey: eligibilityKeys.attachmentsByRequest(data.request),
      });
    },
  });
}

// ============================================================================
// Webhooks
// ============================================================================

export function useWebhooks(options?: UseQueryOptions<PaginatedResponse<WebhookEndpoint>>) {
  return useQuery({
    queryKey: eligibilityKeys.webhooks(),
    queryFn: async () => {
      const response = await apiClient.get('/funding-eligibility/webhooks/');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
}

export function useCreateWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<WebhookEndpoint>) => {
      const response = await apiClient.post('/funding-eligibility/webhooks/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eligibilityKeys.webhooks() });
    },
  });
}

export function useTestWebhook() {
  return useMutation({
    mutationFn: async (webhookId: number) => {
      const response = await apiClient.post(`/funding-eligibility/webhooks/${webhookId}/test/`);
      return response.data;
    },
  });
}
