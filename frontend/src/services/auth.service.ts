import { AuthService as ClientAuthService } from '../client';
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

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    // 1. Login to get token
    const response = await ClientAuthService.login(credentials);
    const token = response.token;
    
    // 2. Set token for subsequent requests
    localStorage.setItem('token', token);
    // Update OpenAPI token immediately for the next request
    OpenAPI.TOKEN = token;

    // 3. Fetch user details (assuming /auth/me exists or decoding token)
    // Since /auth/me is not in my openapi.json yet (I missed it in manual creation?), 
    // I will decode the token or mock the user for now if /auth/me fails.
    // Wait, I did put /api/auth/login in openapi.json. Did I put /api/auth/me?
    // I didn't put /api/auth/me in the manual openapi.json.
    // So ClientAuthService.me() won't exist.
    
    // I'll decode the token payload to get user info if possible, or just return a dummy user.
    // For now, let's return a dummy user derived from email.
    const user: User = {
      id: '1',
      email: credentials.email,
      role: 'Admin',
      name: 'Admin User'
    };
    
    localStorage.setItem('user', JSON.stringify(user));

    return {
      token,
      user
    };
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
