import {
  CaseResponse,
  CaseListResponse,
  CaseCreateRequest,
  ProcessingResult,
  DashboardStats,
  IntakeChannel,
  ComplaintCategory
} from './types';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to get API URL dynamically based on current host
function getApiBaseUrl(): string {
  // Check environment variable first
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, use the same host as the frontend but with port 8000
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  
  // Default for server-side rendering
  return 'http://localhost:8000';
}

export class ComplaintApiClient {
  // Get baseUrl dynamically each time to handle SSR -> client hydration
  private get baseUrl(): string {
    return getApiBaseUrl();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, `API Error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Submit text complaint
   */
  async submitTextComplaint(
    text: string,
    channel: IntakeChannel = IntakeChannel.WEB_FORM,
    categoryHint?: ComplaintCategory,
    locationHint?: string
  ): Promise<ProcessingResult> {
    const request: CaseCreateRequest = {
      text,
      intake_channel: channel,
      category_hint: categoryHint,
      location_hint: locationHint,
    };

    return this.request<ProcessingResult>('/api/v1/intake/text', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Submit audio complaint
   */
  async submitAudioComplaint(
    audioFile: File,
    channel: IntakeChannel = IntakeChannel.MOBILE_APP
  ): Promise<ProcessingResult> {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('channel', channel);

    const response = await fetch(`${this.baseUrl}/api/v1/intake/audio`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, `API Error: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get list of cases
   */
  async getCases(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    priority?: string,
    category?: string
  ): Promise<CaseListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (category) params.append('category', category);

    return this.request<CaseListResponse>(`/api/v1/cases/?${params}`);
  }

  /**
   * Get case details
   */
  async getCase(caseId: string): Promise<CaseResponse> {
    return this.request<CaseResponse>(`/api/v1/cases/${caseId}`);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/api/v1/cases/stats');
  }

  /**
   * Get detailed analytics data
   */
  async getAnalytics(): Promise<any> {
    return this.request('/api/v1/cases/analytics/');
  }

  /**
   * Update case
   */
  async updateCase(
    caseId: string,
    updates: {
      status?: string;
      priority?: string;
      assigned_to?: string;
      assigned_department?: string;
      tags?: string[];
    }
  ): Promise<CaseResponse> {
    return this.request<CaseResponse>(`/api/v1/cases/${caseId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Assign case
   */
  async assignCase(
    caseId: string,
    userId: string,
    department?: string
  ): Promise<{ message: string; case: CaseResponse }> {
    const params = new URLSearchParams({
      user_id: userId,
    });

    if (department) {
      params.append('department', department);
    }

    return this.request(`/api/v1/cases/${caseId}/assign?${params}`, {
      method: 'POST',
    });
  }

  /**
   * Resolve case
   */
  async resolveCase(
    caseId: string,
    resolutionNote?: string
  ): Promise<{ message: string; case: CaseResponse }> {
    const params = new URLSearchParams();

    if (resolutionNote) {
      params.append('resolution_note', resolutionNote);
    }

    return this.request(`/api/v1/cases/${caseId}/resolve?${params}`, {
      method: 'POST',
    });
  }
}

// Export singleton instance
export const apiClient = new ComplaintApiClient();
