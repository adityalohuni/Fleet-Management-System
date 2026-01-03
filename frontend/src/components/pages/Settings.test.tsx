import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Settings } from './Settings';
import * as SettingsHooks from '../../hooks/useSettings';

vi.mock('../ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('../ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

vi.mock('../ui/label', () => ({
  Label: ({ children }: any) => <label>{children}</label>,
}));

vi.mock('../ui/switch', () => ({
  Switch: ({ checked }: any) => <div data-testid="switch">{String(!!checked)}</div>,
}));

vi.mock('../ui/tabs', () => ({
  Tabs: ({ children }: any) => <div>{children}</div>,
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children }: any) => <button>{children}</button>,
  TabsContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../ui/separator', () => ({
  Separator: () => <hr />,
}));

vi.mock('../ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}));

vi.mock('../../hooks/useSettings', () => ({
  useAppSettings: vi.fn(),
  useUpdateAppSettings: vi.fn(),
  useUsers: vi.fn(),
}));

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (SettingsHooks.useUpdateAppSettings as any).mockReturnValue({ mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false });
    (SettingsHooks.useUsers as any).mockReturnValue({ data: [], isLoading: false });
  });

  it('renders settings values from API', () => {
    (SettingsHooks.useAppSettings as any).mockReturnValue({
      data: {
        id: 1,
        company_name: 'FleetMaster Pro',
        contact_email: 'admin@fleetmaster.com',
        phone_number: '+1',
        time_zone: 'UTC',
        address: '123',
        distance_unit: 'Miles',
        currency: 'USD ($)',
        date_format: 'MM/DD/YYYY',
        notify_maintenance_alerts: true,
        notify_license_expiry: true,
        notify_service_completion: true,
        notify_payment: true,
        notify_sms: false,
        notify_desktop: false,
        notify_weekly_summary: true,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      },
      isLoading: false,
      isError: false,
    });

    render(<Settings />);

    expect(screen.getByDisplayValue('FleetMaster Pro')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin@fleetmaster.com')).toBeInTheDocument();
  });
});
