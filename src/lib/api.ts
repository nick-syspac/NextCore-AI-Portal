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
        'Authorization': `Token ${authToken}`,
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
        'Authorization': `Token ${authToken}`,
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
        'Authorization': `Token ${authToken}`,
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
        'Authorization': `Token ${authToken}`,
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
        'Authorization': `Token ${authToken}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }
    return response.json();
  },
};
