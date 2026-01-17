/**
 * API client for MINDPT Backend
 */

import { auth } from './auth';

// Use Next.js API proxy instead of direct backend calls
const API_BASE_URL = '/api/proxy';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper with automatic token injection and error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = auth.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('[API] Fetching:', url, 'Method:', options.method || 'GET');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    console.log('[API] Response:', response.status, response.statusText);
    return await handleResponse(response);
  } catch (error) {
    console.error('[API] Fetch error:', error);
    throw new ApiError(0, `Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleResponse(response: Response): Promise<any> {

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    auth.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Unauthorized - please login again');
  }

  // Handle other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Session {
  id: number;
  user_id: number;
  title: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  user_id: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface AIReplyResponse {
  session_id: number;
  user_message_id: number;
  assistant_message_id: number;
  assistant_content: string;
}

// API methods
export const api = {
  /**
   * Register a new user
   */
  async register(username: string, email: string, password: string): Promise<User> {
    return fetchAPI<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    // OAuth2 password flow uses form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new ApiError(response.status, errorData.detail || 'Login failed');
    }

    return response.json();
  },

  /**
   * Get current user info
   */
  async getMe(): Promise<User> {
    return fetchAPI<User>('/auth/me');
  },

  /**
   * Create a new session
   */
  async createSession(title?: string): Promise<Session> {
    return fetchAPI<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ title: title || null }),
    });
  },

  /**
   * Get all sessions for current user
   */
  async getSessions(): Promise<Session[]> {
    return fetchAPI<Session[]>('/sessions');
  },

  /**
   * Get a specific session
   */
  async getSession(sessionId: number): Promise<Session> {
    return fetchAPI<Session>(`/sessions/${sessionId}`);
  },

  /**
   * Get messages for a session
   */
  async getSessionMessages(sessionId: number): Promise<Message[]> {
    return fetchAPI<Message[]>(`/sessions/${sessionId}/messages`);
  },

  /**
   * Send a message and get AI reply
   */
  async sendMessage(sessionId: number, content: string): Promise<AIReplyResponse> {
    return fetchAPI<AIReplyResponse>('/ai/reply', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, content }),
    });
  },
};
