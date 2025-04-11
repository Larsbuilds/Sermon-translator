import { User, Session, Language, UserRole } from '../types/index';

const API_URL = 'http://localhost:3001';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name?: string;
  role?: UserRole;
}

interface CreateSessionData {
  title: string;
  description?: string;
  defaultLang: Language;
  isPublic: boolean;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string | null) {
    console.log('Setting token:', token ? 'Token present' : 'No token');
    this.token = token;
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    console.log('Making request to:', `${API_URL}${endpoint}`);
    console.log('Request headers:', headers);
    console.log('Request options:', { ...options, headers });

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Failed to parse error response' };
        }
        
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          endpoint,
          errorData
        });
        
        const errorMessage = errorData.error || errorData.details || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      console.error('Fetch Error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Something broke!');
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    return this.fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    return this.fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Session endpoints
  async createSession(data: CreateSessionData): Promise<Session> {
    return this.fetchWithAuth('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessions(): Promise<Session[]> {
    return this.fetchWithAuth('/api/sessions/active');
  }

  async joinSession(sessionId: string, language: Language): Promise<Session> {
    return this.fetchWithAuth('/api/sessions/join', {
      method: 'POST',
      body: JSON.stringify({ sessionId, language }),
    });
  }

  async updateUserRole(role: UserRole | undefined): Promise<User> {
    console.log('Updating user role to:', role);
    console.log('Current token:', this.token);
    try {
      const response = await this.fetchWithAuth('/auth/role', {
        method: 'PATCH',
        body: JSON.stringify({ role: role }),
      });
      console.log('Role update result:', response);
      if (!response) {
        throw new Error('Invalid response from role update');
      }
      // If the response includes a message about already having the role,
      // we should still consider it a success
      if (response.message && response.message.includes('already has the requested role')) {
        console.log('User already has the requested role:', role);
        return response.user;
      }
      return response;
    } catch (error) {
      console.error('Error updating role:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update role: ${error.message}`);
      }
      throw new Error('Failed to update role: Unknown error');
    }
  }

  async leaveSession(sessionId: string): Promise<void> {
    await this.fetchWithAuth(`/api/sessions/${sessionId}/leave`, {
      method: 'POST',
    });
    // Reset role to null after leaving session
    await this.updateUserRole(undefined);
  }
}

export const api = new ApiService(); 