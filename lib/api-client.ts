import {
  CaseResponse,
  CaseListResponse,
  CaseCreateRequest,
  ProcessingResult,
  DashboardStats,
  AnalyticsResponse,
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
    options: RequestInit = {},
    timeoutMs: number = 30000
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, `API Error: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(0, 'Превышено время ожидания ответа от сервера');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/intake/audio`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(response.status, `API Error: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(0, 'Превышено время ожидания обработки аудио');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get list of cases
   */
  async getCases(
    page: number = 1,
    pageSize: number = 20,
    status?: string,
    priority?: string,
    category?: string,
    search?: string
  ): Promise<CaseListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (category) params.append('category', category);
    if (search) params.append('search', search);

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
  async getAnalytics(): Promise<AnalyticsResponse> {
    return this.request<AnalyticsResponse>('/api/v1/cases/analytics/');
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

    return this.request<{ message: string; case: CaseResponse }>(`/api/v1/cases/${caseId}/assign?${params}`, {
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

    return this.request<{ message: string; case: CaseResponse }>(`/api/v1/cases/${caseId}/resolve?${params}`, {
      method: 'POST',
    });
  }

  /**
   * Send operator message to a case
   */
  async sendOperatorMessage(
    caseId: string,
    content: string,
    operatorId: string = 'operator',
    operatorToken?: string
  ): Promise<{ id: string; content: string; is_from_reporter: boolean; created_at: string }> {
    const params = new URLSearchParams({ operator_id: operatorId });

    const headers: Record<string, string> = {};
    if (operatorToken) {
      headers['X-Operator-Token'] = operatorToken;
    }

    return this.request<{ id: string; content: string; is_from_reporter: boolean; created_at: string }>(`/api/v1/chat/${caseId}/operator/message?${params}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      headers,
    });
  }
}

// Export singleton instance
export const apiClient = new ComplaintApiClient();
