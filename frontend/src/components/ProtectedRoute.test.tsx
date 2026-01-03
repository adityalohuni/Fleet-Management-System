import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { vi, describe, it, expect, Mock } from 'vitest';

// Mock useAuth hook
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock Login component
vi.mock('./pages/Login', () => ({
  Login: () => <div data-testid="login-page">Login Page</div>,
}));

describe('ProtectedRoute', () => {
  it('shows loading spinner when loading', () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Check for the spinner class
    expect(container.getElementsByClassName('animate-spin').length).toBe(1);
  });

  it('renders login page when not authenticated', () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});
