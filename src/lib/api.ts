const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  invitation_token?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface InvitationData {
  tenant: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  message?: string;
}

export const api = {
  async register(data: RegisterData) {
    const response = await fetch(`${API_URL}/api/users/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async login(data: LoginData) {
    const response = await fetch(`${API_URL}/api/auth/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async verifyEmail(token: string) {
    const response = await fetch(`${API_URL}/api/users/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async getInvitationDetails(token: string) {
    const response = await fetch(`${API_URL}/api/users/invitations/${token}/`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async acceptInvitation(token: string, authToken: string) {
    const response = await fetch(`${API_URL}/api/users/accept-invitation/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async createInvitation(data: InvitationData, authToken: string) {
    const response = await fetch(`${API_URL}/api/users/invitations/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async getMyTenants(authToken: string) {
    const response = await fetch(`${API_URL}/api/users/my-tenants/`, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    const data = await response.json();
    // API returns {tenants: [...]} so extract the array
    return data.tenants || [];
  },

  async getProfile(authToken: string) {
    const response = await fetch(`${API_URL}/api/users/profile/`, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async getTenantUsers(tenantSlug: string, authToken: string) {
    const response = await fetch(`${API_URL}/api/tenant-users/?tenant__slug=${tenantSlug}`, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async getAPIKeys(tenantSlug: string, authToken: string) {
    const response = await fetch(`${API_URL}/api/api-keys/?tenant__slug=${tenantSlug}`, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async createAPIKey(
    data: { tenant: string; name: string; description?: string },
    authToken: string
  ) {
    const response = await fetch(`${API_URL}/api/api-keys/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${authToken}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async revokeAPIKey(keyId: string, authToken: string) {
    const response = await fetch(`${API_URL}/api/api-keys/${keyId}/revoke/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async getAuditLogs(
    tenantSlug: string,
    authToken: string,
    filters?: {
      event_type?: string;
      severity?: string;
      search?: string;
      page?: number;
    }
  ) {
    const params = new URLSearchParams();
    params.append('tenant__slug', tenantSlug);
    if (filters?.event_type) params.append('event_type', filters.event_type);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await fetch(`${API_URL}/api/audit/events/?${params.toString()}`, {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },

  async verifyAuditLog(tenantId: string, authToken: string) {
    const response = await fetch(`${API_URL}/api/audit/verify/?tenant_id=${tenantId}`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },
};
