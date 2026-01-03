import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service';
import * as Client from '../client';

vi.mock('../client', () => {
  return {
    VehicleService: { getVehicles: vi.fn() },
    DriverService: { getDrivers: vi.fn() },
    AssignmentService: { getAssignments: vi.fn() },
    MaintenanceService: { getAlerts: vi.fn() },
    FinancialService: { getMonthlySummary: vi.fn() },
  };
});

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMetrics computes counts from API payloads', async () => {
    Client.VehicleService.getVehicles.mockResolvedValue([
      { id: 'v1', status: 'Available' },
      { id: 'v2', status: 'Maintenance' },
    ]);
    Client.DriverService.getDrivers.mockResolvedValue([
      { id: 'd1', status: 'Active' },
      { id: 'd2', status: 'Inactive' },
    ]);
    Client.AssignmentService.getAssignments.mockResolvedValue([
      { id: 'a1', status: 'Active' },
      { id: 'a2', status: 'Completed' },
    ]);
    Client.MaintenanceService.getAlerts.mockResolvedValue([
      { id: 'al1', severity: 'Low' },
      { id: 'al2', severity: 'High' },
    ]);

    const metrics = await DashboardService.getMetrics();

    expect(metrics.totalVehicles).toBe(2);
    expect(metrics.availableVehicles).toBe(1);
    expect(metrics.activeDrivers).toBe(2);
    expect(metrics.driversOnDuty).toBe(1);
    expect(metrics.servicesInProgress).toBe(1);
    expect(metrics.servicesCompletedToday).toBe(1);
    expect(metrics.upcomingMaintenance).toBe(1);
    expect(metrics.overdueMaintenance).toBe(1);
  });

  it('getRecentAssignments uses real vehicle/driver identifiers (no placeholders)', async () => {
    Client.AssignmentService.getAssignments.mockResolvedValue([
      { id: 'a1', vehicle_id: 'v1', driver_id: 'd1', status: 'Active', start_time: '2026-01-01T00:00:00Z' },
    ]);
    Client.VehicleService.getVehicles.mockResolvedValue([
      { id: 'v1', license_plate: 'TRK-101', model: 'X' },
    ]);
    Client.DriverService.getDrivers.mockResolvedValue([
      { id: 'd1', name: 'Jane Driver' },
    ]);

    const items = await DashboardService.getRecentAssignments();

    expect(items).toHaveLength(1);
    expect(items[0].vehicleName).toBe('TRK-101');
    expect(items[0].driverName).toBe('Jane Driver');
    expect(items[0].location).toBe('—');
    expect(items[0].progress).toBe(50);
  });

  it('getAlerts derives message and maps severity to UI levels', async () => {
    Client.MaintenanceService.getAlerts.mockResolvedValue([
      { id: 'al1', type: 'maintenance', entity_id: 'e1', severity: 'Critical' },
      { id: 'al2', type: 'maintenance', entity_id: 'e2', severity: 'Medium' },
      { id: 'al3', type: 'maintenance', entity_id: 'e3', severity: 'Low' },
    ]);

    const alerts = await DashboardService.getAlerts();

    expect(alerts).toHaveLength(3);
    expect(alerts[0].message).toContain('e1');
    expect(alerts[0].severity).toBe('high');
    expect(alerts[1].severity).toBe('medium');
    expect(alerts[2].severity).toBe('low');
  });
});
