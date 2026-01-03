import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { AuthService } from '../services/auth.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock AuthService
vi.mock('../services/auth.service', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

const TestComponent = () => {
  const { user, login, register, logout, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-email">{user?.email}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>Login</button>
      <button onClick={() => register({ email: 'new@example.com', password: 'password', role: 'Driver' })}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('initializes with no user when not authenticated', async () => {
    (AuthService.getCurrentUser as any).mockReturnValue(null);
    (AuthService.isAuthenticated as any).mockReturnValue(false);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
  });

  it('initializes with user when authenticated', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'admin' };
    (AuthService.getCurrentUser as any).mockReturnValue(mockUser);
    (AuthService.isAuthenticated as any).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('logs in successfully', async () => {
    (AuthService.getCurrentUser as any).mockReturnValue(null);
    (AuthService.isAuthenticated as any).mockReturnValue(false);
    const mockUser = { id: '1', email: 'test@example.com', role: 'admin' };
    const mockToken = 'fake-token';
    (AuthService.login as any).mockImplementation(async () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { token: mockToken, user: mockUser };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated'));

    await act(async () => {
      await userEvent.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('registers successfully', async () => {
    (AuthService.getCurrentUser as any).mockReturnValue(null);
    (AuthService.isAuthenticated as any).mockReturnValue(false);
    const mockUser = { id: '2', email: 'new@example.com', role: 'Driver' };
    const mockToken = 'new-token';
    (AuthService.register as any).mockResolvedValue({ token: mockToken, user: mockUser });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated'));

    await act(async () => {
      await userEvent.click(screen.getByText('Register'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('new@example.com');
    });

    // Note: In the real implementation, register also sets localStorage.
    // Since we mocked AuthService.register, we rely on the AuthProvider to update state.
    // The AuthProvider calls AuthService.register which returns the user.
    // The AuthProvider then sets the user state.
  });

  it('logs out successfully', async () => {
    const mockUser = { id: '1', email: 'test@example.com', role: 'admin' };
    (AuthService.getCurrentUser as any).mockReturnValue(mockUser);
    (AuthService.isAuthenticated as any).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated'));

    await act(async () => {
      await userEvent.click(screen.getByText('Logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    expect(AuthService.logout).toHaveBeenCalled();
  });
});
