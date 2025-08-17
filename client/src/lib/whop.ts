// Whop SDK Integration for EventFlow
// Using direct API calls since the SDK has dependency conflicts

interface WhopUser {
  id: string;
  email: string;
  username?: string;
  profile_pic_url?: string;
}

interface WhopConfig {
  apiKey: string;
  appId: string;
  agentUserId: string;
  companyId: string;
}

class WhopClient {
  private config: WhopConfig;
  private baseUrl = 'https://api.whop.com/api/v2';

  constructor() {
    this.config = {
      apiKey: import.meta.env.WHOP_API_KEY || '',
      appId: import.meta.env.NEXT_PUBLIC_WHOP_APP_ID || '',
      agentUserId: import.meta.env.NEXT_PUBLIC_WHOP_AGENT_USER_ID || '',
      companyId: import.meta.env.NEXT_PUBLIC_WHOP_COMPANY_ID || ''
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Whop API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(userId: string): Promise<WhopUser> {
    return this.makeRequest(`/users/${userId}`);
  }

  async getCurrentUser(): Promise<WhopUser> {
    return this.makeRequest('/me');
  }

  async verifyAccess(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Whop access verification failed:', error);
      return false;
    }
  }

  getConfig() {
    return this.config;
  }
}

export const whopClient = new WhopClient();
export type { WhopUser };