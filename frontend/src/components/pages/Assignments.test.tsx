import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Assignments } from './Assignments';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as AssignmentHooks from '../../hooks/useAssignments';
import * as VehicleHooks from '../../hooks/useVehicles';
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
vi.mock('../../hooks/useAssignments', () => ({
  useAssignments: vi.fn(),
  useCreateAssignment: vi.fn(),
  useUpdateAssignmentStatus: vi.fn(),
}));

vi.mock('../../hooks/useVehicles', () => ({
  useVehicles: vi.fn(),
}));

vi.mock('../../hooks/useDrivers', () => ({
  useDrivers: vi.fn(),
}));

describe('Assignments Page', () => {
  const mockAssignments = [
    {
      id: '1',
      vehicleId: 'v1',
      driverId: 'd1',
      status: 'Active',
      startDate: '2026-01-01T09:00:00Z',
      endDate: '2026-01-01T17:00:00Z',
      location: 'Location A',
      progress: 50,
    },
    {
      id: '2',
      vehicleId: 'v2',
      driverId: 'd2',
      status: 'Scheduled',
      startDate: '2026-01-02T09:00:00Z',
      endDate: '2026-01-02T17:00:00Z',
      location: 'Location B',
      progress: 0,
    },
  ];

  const mockVehicles = [
    { id: 'v1', make: 'Toyota', model: 'Camry', status: 'Available' },
    { id: 'v2', make: 'Honda', model: 'Civic', status: 'Available' },
  ];

  const mockDrivers = [
    { id: 'd1', name: 'John Doe', availability: 'Available' },
    { id: 'd2', name: 'Jane Smith', availability: 'Available' },
  ];

  const mockCreateMutate = vi.fn();
  const mockUpdateStatusMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (AssignmentHooks.useAssignments as any).mockReturnValue({
      data: mockAssignments,
      isLoading: false,
    });

    (AssignmentHooks.useCreateAssignment as any).mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    });

    (AssignmentHooks.useUpdateAssignmentStatus as any).mockReturnValue({
      mutate: mockUpdateStatusMutate,
      isPending: false,
    });

    (VehicleHooks.useVehicles as any).mockReturnValue({
      data: mockVehicles,
      isLoading: false,
    });

    (DriverHooks.useDrivers as any).mockReturnValue({
      data: mockDrivers,
      isLoading: false,
    });
  });

  it('renders the assignment list', () => {
    render(<Assignments />);
    expect(screen.getByText('Assignments')).toBeInTheDocument();
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (AssignmentHooks.useAssignments as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<Assignments />);
    expect(screen.getByText('Loading assignments...')).toBeInTheDocument();
  });

  it('opens create assignment dialog', () => {
    render(<Assignments />);
    const addButton = screen.getByText('New Assignment');
    fireEvent.click(addButton);
    expect(screen.getByText('Create New Assignment')).toBeInTheDocument();
  });

  it('allows starting a scheduled assignment', () => {
    render(<Assignments />);
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    expect(mockUpdateStatusMutate).toHaveBeenCalledWith({ id: '2', status: 'Active' });
  });

  it('allows completing an active assignment', () => {
    render(<Assignments />);
    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);
    expect(mockUpdateStatusMutate).toHaveBeenCalledWith({ id: '1', status: 'Completed' });
  });
});
