import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Drivers } from './Drivers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as DriverHooks from '../../hooks/useDrivers';

// Mock UI components
vi.mock('../ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
}));

vi.mock('../ui/dialog', async () => {
  const React = await import('react');
  const DialogContext = React.createContext<{ open: boolean; onOpenChange: (open: boolean) => void }>({
    open: false,
    onOpenChange: () => {},
  });
  
  return {
    Dialog: ({ children, open, onOpenChange }: { children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) => (
      <DialogContext.Provider value={{ open, onOpenChange }}>
        <div data-testid="dialog">{children}</div>
      </DialogContext.Provider>
    ),
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <DialogContext.Consumer>
        {({ open }) => open ? <div data-testid="dialog-content">{children}</div> : null}
      </DialogContext.Consumer>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
    DialogTrigger: ({ children }: { children: React.ReactNode }) => (
      <DialogContext.Consumer>
        {({ onOpenChange }) => (
          <div data-testid="dialog-trigger" onClick={() => onOpenChange(true)}>
            {children}
          </div>
        )}
      </DialogContext.Consumer>
    ),
  };
});

vi.mock('../ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead data-testid="table-header">{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody data-testid="table-body">{children}</tbody>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr data-testid="table-row">{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th data-testid="table-head">{children}</th>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td data-testid="table-cell">{children}</td>,
}));

// Mock hooks
vi.mock('../../hooks/useDrivers', () => ({
  useDrivers: vi.fn(),
  useCreateDriver: vi.fn(),
  useUpdateDriver: vi.fn(),
  useDeleteDriver: vi.fn(),
}));

describe('Drivers Page', () => {
  const mockDrivers = [
    {
      id: '1',
      name: 'John Doe',
      license: 'DL-12345',
      licenseExpiry: '2026-01-01',
      availability: 'Available',
      hoursThisWeek: 40,
      wageRate: 25,
      phone: '555-0123',
      email: 'john@example.com',
    },
    {
      id: '2',
      name: 'Jane Smith',
      license: 'DL-67890',
      licenseExpiry: '2026-02-01',
      availability: 'On Duty',
      hoursThisWeek: 35,
      wageRate: 28,
      phone: '555-0456',
      email: 'jane@example.com',
    },
  ];

  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (DriverHooks.useDrivers as any).mockReturnValue({
      data: mockDrivers,
      isLoading: false,
    });

    (DriverHooks.useCreateDriver as any).mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    });

    (DriverHooks.useUpdateDriver as any).mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    });

    (DriverHooks.useDeleteDriver as any).mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    });
  });

  it('renders the driver list', () => {
    render(<Drivers />);
    expect(screen.getByText('Driver Management')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (DriverHooks.useDrivers as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<Drivers />);
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('opens add driver dialog', () => {
    render(<Drivers />);
    const addButton = screen.getByText('Add Driver');
    fireEvent.click(addButton);
    expect(screen.getByText('Add New Driver')).toBeInTheDocument();
  });

  it('opens edit driver dialog', () => {
    render(<Drivers />);
    const editButtons = screen.getAllByLabelText('Edit driver');
    fireEvent.click(editButtons[0]);
    expect(screen.getByText('Edit Driver')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });
});
