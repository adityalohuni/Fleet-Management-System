import React from 'react';
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as DashboardHooks from '../../hooks/useDashboard';

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('../ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: () => <div>LineChart</div>,
  Line: () => <div />,
  BarChart: () => <div>BarChart</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

// Mock hooks
vi.mock('../../hooks/useDashboard', () => ({
  useDashboardMetrics: vi.fn(),
  useDashboardUtilization: vi.fn(),
  useDashboardRecentAssignments: vi.fn(),
  useDashboardAlerts: vi.fn(),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for other hooks to avoid errors
    (DashboardHooks.useDashboardUtilization as any).mockReturnValue({ data: [], isLoading: false });
    (DashboardHooks.useDashboardRecentAssignments as any).mockReturnValue({ data: [], isLoading: false });
    (DashboardHooks.useDashboardAlerts as any).mockReturnValue({ data: [], isLoading: false });
  });

  it('renders loading skeletons when data is loading', () => {
    (DashboardHooks.useDashboardMetrics as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<Dashboard />);

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('renders KPI cards with data when loaded', () => {
    const mockMetrics = {
      totalVehicles: 100,
      availableVehicles: 80,
      activeDrivers: 50,
      driversOnDuty: 40,
      servicesInProgress: 5,
      servicesCompletedToday: 2,
      upcomingMaintenance: 3,
      overdueMaintenance: 1,
    };

    (DashboardHooks.useDashboardMetrics as any).mockReturnValue({
      data: mockMetrics,
      isLoading: false,
    });

    render(<Dashboard />);

    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('80 available now')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('40 on duty')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2 completed today')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1 overdue')).toBeInTheDocument();
  });

  it('renders charts and lists with data when loaded', () => {
    const mockMetrics = {
      totalVehicles: 100,
      availableVehicles: 80,
      activeDrivers: 50,
      driversOnDuty: 40,
      servicesInProgress: 5,
      servicesCompletedToday: 2,
      upcomingMaintenance: 3,
      overdueMaintenance: 1,
    };
    (DashboardHooks.useDashboardMetrics as any).mockReturnValue({ data: mockMetrics, isLoading: false });

    const mockUtilization = [{ label: 'Jan', value: 50 }];
    (DashboardHooks.useDashboardUtilization as any).mockReturnValue({ data: mockUtilization, isLoading: false });

    const mockAssignments = [
      { id: 'A1', vehicleName: 'V1', driverName: 'D1', status: 'Active', progress: 50 }
    ];
    (DashboardHooks.useDashboardRecentAssignments as any).mockReturnValue({ data: mockAssignments, isLoading: false });

    const mockAlerts = [
      { id: '1', message: 'Alert 1', severity: 'high' }
    ];
    (DashboardHooks.useDashboardAlerts as any).mockReturnValue({ data: mockAlerts, isLoading: false });

    render(<Dashboard />);

    expect(screen.getByText('V1')).toBeInTheDocument();
    expect(screen.getByText('D1')).toBeInTheDocument();
    expect(screen.getByText('Alert 1')).toBeInTheDocument();
  });
});
