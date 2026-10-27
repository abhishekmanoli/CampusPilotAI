import {
  DocumentRecord,
  ConflictAlert,
  ExtractedEvent,
  ExtractedDeadline,
  PlanGenerationRequest,
  PlanGenerationResponse,
  AskQuestionResponse,
  HealthResponse,
} from '../types';

const BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = `HTTP Error ${res.status}`;
    try {
      const data = await res.json();
      errorDetail = data.detail || data.message || JSON.stringify(data);
    } catch {
      errorDetail = await res.text();
    }
    throw new ApiError(errorDetail, res.status);
  }
  return res.json();
}

export const api = {
  async login(email: string, password: string, rememberMe?: boolean): Promise<{ success: boolean; token: string; user: any }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
    return handleResponse(res);
  },

  async getCurrentUser(token?: string): Promise<{ authenticated: boolean; user: any }> {
    const storedToken = token || localStorage.getItem('campuspilot_token') || '';
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
    });
    return handleResponse(res);
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('campuspilot_token');
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('campuspilot_token');
    localStorage.removeItem('campuspilot_user');
  },

  async getProfile(): Promise<any> {
    const res = await fetch(`${BASE_URL}/profile`);
    return handleResponse(res);
  },

  async updateProfile(profile: any): Promise<any> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return handleResponse(res);
  },

  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse<HealthResponse>(res);
  },

  async updateEndpoint(baseUrl?: string, model?: string): Promise<{ success: boolean; base_url: string; model: string; details: any }> {
    const res = await fetch(`${BASE_URL}/settings/endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base_url: baseUrl, model: model }),
    });
    return handleResponse(res);
  },

  async testOllama(): Promise<{ success: boolean; model: string; base_url: string; response?: string; error?: string }> {
    const res = await fetch(`${BASE_URL}/settings/test-ollama`);
    return handleResponse(res);
  },

  async getDocuments(): Promise<DocumentRecord[]> {
    const res = await fetch(`${BASE_URL}/documents`);
    return handleResponse<DocumentRecord[]>(res);
  },

  async uploadDocuments(files: File[]): Promise<DocumentRecord[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<DocumentRecord[]>(res);
  },

  async deleteDocument(docId: string): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async analyzeDocuments(documentIds?: string[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_ids: documentIds }),
    });
    return handleResponse(res);
  },

  async getEvents(): Promise<{ events: ExtractedEvent[]; deadlines: ExtractedDeadline[] }> {
    const res = await fetch(`${BASE_URL}/events`);
    return handleResponse(res);
  },

  async getConflicts(): Promise<ConflictAlert[]> {
    const res = await fetch(`${BASE_URL}/conflicts`);
    return handleResponse<ConflictAlert[]>(res);
  },

  async generatePlan(request: PlanGenerationRequest): Promise<PlanGenerationResponse> {
    const res = await fetch(`${BASE_URL}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    return handleResponse<PlanGenerationResponse>(res);
  },

  async askQuestion(question: string, documentIds?: string[]): Promise<AskQuestionResponse> {
    const res = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, document_ids: documentIds }),
    });
    return handleResponse<AskQuestionResponse>(res);
  },

  async loadDemoData(): Promise<{
    message: string;
    documents_loaded: number;
    total_events: number;
    total_deadlines: number;
    conflicts_detected: number;
  }> {
    const res = await fetch(`${BASE_URL}/demo/load`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async clearDemoData(): Promise<{ message: string; removed_count: number }> {
    const res = await fetch(`${BASE_URL}/demo/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async resetData(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/demo/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },

  async resetAllData(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/reset`, {
      method: 'POST',
    });
    return handleResponse(res);
  },
};
