import { OpenAPI } from '../client';

export interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
    name?: string;
  email: string;
  password: string;
  role: string;
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Login failed. Please check your credentials.';

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        if (response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (response.status === 404) {
          errorMessage = 'Authentication service not available';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const token = data.token;
      
      // 2. Set token for subsequent requests
      localStorage.setItem('token', token);
      // Update OpenAPI token immediately for the next request
      OpenAPI.TOKEN = token;

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        role: String(data.user.role),
      };

      localStorage.setItem('user', JSON.stringify(user));

      return {
        token,
        user
      };
    } catch (error: any) {
      // Parse and throw a user-friendly error message
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (error.body) {
        // If the error body has a message field
        if (typeof error.body === 'string') {
          errorMessage = error.body;
        } else if (error.body.message) {
          errorMessage = error.body.message;
        } else if (error.body.error) {
          errorMessage = error.body.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (error.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error.status === 404) {
        errorMessage = 'Authentication service not available';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }
  },

  register: async (credentials: RegisterCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password_hash: credentials.password, // Backend expects password in password_hash field
          role: credentials.role,
                    name: credentials.name,
          is_active: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Registration failed';
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || 'Registration failed';
        }
        
        if (response.status === 400) {
          errorMessage = 'Invalid registration data. Please check your inputs.';
        } else if (response.status === 409) {
          errorMessage = 'An account with this email already exists.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const token = data.token;
      const user = data.user;

      localStorage.setItem('token', token);
      OpenAPI.TOKEN = token;
      localStorage.setItem('user', JSON.stringify(user));

      return {
        token,
        user,
      };
    } catch (error: any) {
      // Re-throw if it's already our custom error
      if (error.message) {
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    OpenAPI.TOKEN = undefined;
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};
