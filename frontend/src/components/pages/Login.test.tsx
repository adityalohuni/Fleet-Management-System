import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from './Login';
import { AuthProvider } from '../../contexts/AuthContext';
import { AuthService } from '../../services/auth.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as AuthContextModule from '../../contexts/AuthContext';

// Mock UI components to simplify testing and avoid issues with Radix UI in JSDOM if any
vi.mock('../ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h1 data-testid="card-title">{children}</h1>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));

// Mock AuthService for Integration tests
vi.mock('../../services/auth.service', () => ({
  AuthService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

describe('Login Page', () => {
  describe('Unit/Component Tests', () => {
    const mockLogin = vi.fn();
    
    beforeEach(() => {
      // Spy on useAuth to mock it for component tests
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        login: mockLogin,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('renders login form correctly', () => {
      render(<Login />);
      
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('handles input changes', async () => {
      render(<Login />);
      const user = userEvent.setup();
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('submits form with credentials', async () => {
      render(<Login />);
      const user = userEvent.setup();
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('displays error message on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Failed'));
      render(<Login />);
      const user = userEvent.setup();
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', () => {
      // Override mock for this specific test
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        login: mockLogin,
        isLoading: true, // Simulate loading
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
      });

      render(<Login />);
      expect(screen.getByRole('button')).toHaveTextContent(/signing in/i);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Integration Tests (with AuthProvider)', () => {
    beforeEach(() => {
      vi.restoreAllMocks(); // Restore useAuth spy to use real implementation
      localStorage.clear();
    });

    it('calls AuthService and updates state on successful login', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'admin' };
      const mockToken = 'valid-token';
      
      // Mock the service call
      (AuthService.login as any).mockResolvedValue({ token: mockToken, user: mockUser });
      (AuthService.getCurrentUser as any).mockReturnValue(null);
      (AuthService.isAuthenticated as any).mockReturnValue(false);

      render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      );
      
      const user = userEvent.setup();
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(AuthService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });
});
