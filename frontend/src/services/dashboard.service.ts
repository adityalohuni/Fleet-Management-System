import { 
  VehicleService, 
  DriverService, 
  AssignmentService, 
  MaintenanceService, 
  FinancialService 
} from '../client';
import { DashboardMetrics, ChartData, Assignment, Alert } from '../types';

export const DashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const [vehicles, drivers, assignments, alerts] = await Promise.all([
        VehicleService.getVehicles(),
        DriverService.getDrivers(),
        AssignmentService.getAssignments(),
        MaintenanceService.getAlerts(),
      ]);

      return {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter(v => v.status === 'Available').length,
        activeDrivers: drivers.length,
        driversOnDuty: drivers.filter(d => d.status === 'OnDuty').length,
        servicesInProgress: assignments.filter(a => a.status === 'Active').length,
        servicesCompletedToday: assignments.filter(a => a.status === 'Completed').length, // Simplified logic
        upcomingMaintenance: alerts.filter(a => a.severity !== 'high').length,
        overdueMaintenance: alerts.filter(a => a.severity === 'high').length,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard metrics', error);
      // Return zeroed metrics on error to prevent crash
      return {
        totalVehicles: 0,
        availableVehicles: 0,
        activeDrivers: 0,
        driversOnDuty: 0,
        servicesInProgress: 0,
        servicesCompletedToday: 0,
        upcomingMaintenance: 0,
        overdueMaintenance: 0,
      };
    }
  },

  getUtilization: async (): Promise<ChartData[]> => {
    try {
      const summary = await FinancialService.getMonthlySummary();
      return summary.map(s => ({
        label: s.month,
        value: parseFloat(s.profit) // Using profit as proxy for utilization for now
      }));
    } catch (error) {
      console.error('Failed to fetch utilization', error);
      return [];
    }
  },

  getRecentAssignments: async (): Promise<Assignment[]> => {
    try {
      const assignments = await AssignmentService.getAssignments();
      // Map generated Assignment to frontend Assignment type
      return assignments.slice(0, 5).map(a => ({
        id: a.id || '',
        vehicleId: a.vehicle_id || '',
        driverId: a.driver_id || '',
        vehicleName: 'Vehicle ' + a.vehicle_id?.substring(0, 4), // Placeholder
        driverName: 'Driver ' + a.driver_id?.substring(0, 4), // Placeholder
        status: a.status as any,
        startDate: a.start_time || '',
        endDate: a.end_time || '',
        location: 'Unknown',
        progress: a.status === 'Completed' ? 100 : 50,
      }));
    } catch (error) {
      console.error('Failed to fetch assignments', error);
      return [];
    }
  },

  getAlerts: async (): Promise<Alert[]> => {
    try {
      const alerts = await MaintenanceService.getAlerts();
      return alerts.map(a => ({
        id: a.id,
        type: 'maintenance', // Default type
        message: a.message || '',
        severity: (a.severity as any) || 'low',
        date: a.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to fetch alerts', error);
      return [];
    }
  },
};
