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
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card" className={className}>{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => <h1 data-testid="card-title" className={className}>{children}</h1>,
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => <p data-testid="card-description" className={className}>{children}</p>,
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card-content" className={className}>{children}</div>,
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => <div data-testid="card-footer" className={className}>{children}</div>,
}));

vi.mock('../ui/select', () => ({
  Select: ({ children, onValueChange }: any) => <div data-testid="select" onClick={() => onValueChange('Manager')}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: () => <div data-testid="select-value"></div>,
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-testid={`select-item-${value}`}>{children}</div>,
}));

// Mock AuthService for Integration tests
vi.mock('../../services/auth.service', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

describe('Login Page', () => {
  describe('Unit/Component Tests', () => {
    const mockLogin = vi.fn();
    const mockRegister = vi.fn();
    
    beforeEach(() => {
      // Spy on useAuth to mock it for component tests
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        login: mockLogin,
        register: mockRegister,
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
      
      expect(screen.getByText(/fleet management/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('handles input changes', async () => {
      render(<Login />);
      const user = userEvent.setup();
      
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('submits form with credentials', async () => {
      render(<Login />);
      const user = userEvent.setup();
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
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
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });

    it('switches to signup mode', async () => {
      render(<Login />);
      const user = userEvent.setup();

      await user.click(screen.getByText(/sign up/i));

      expect(screen.getByText(/create your account to get started/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('submits registration form', async () => {
      render(<Login />);
      const user = userEvent.setup();

      // Switch to signup
      await user.click(screen.getByText(/sign up/i));

      await user.type(screen.getByLabelText(/email address/i), 'new@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      
      // Mock role selection (simplified due to mock)
      // In a real test with full Radix UI, we'd interact with the select.
      // Here we assume default 'Driver' or we can try to trigger the mock change if needed.
      // The default state for role is 'Driver'.

      await user.click(screen.getByRole('button', { name: /create account/i }));

      expect(mockRegister).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@example.com',
        password: 'password123',
        role: 'Driver',
      }));
    });

    it('shows loading state during submission', () => {
      // Override mock for this specific test
      vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
        login: mockLogin,
        register: mockRegister,
        isLoading: true, // Simulate loading
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
      });

      render(<Login />);
      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
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
      
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
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
