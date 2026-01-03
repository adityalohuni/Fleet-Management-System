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

      const isSevere = (sev?: string) => sev === 'High' || sev === 'Critical';
      const isAvailableVehicle = (status?: string) => status === 'Available';
      const isActiveDriver = (status?: string) => status === 'Active';

      return {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter(v => isAvailableVehicle(v.status)).length,
        activeDrivers: drivers.length,
        driversOnDuty: drivers.filter(d => isActiveDriver(d.status)).length,
        servicesInProgress: assignments.filter(a => a.status === 'Active').length,
        servicesCompletedToday: assignments.filter(a => a.status === 'Completed').length,
        upcomingMaintenance: alerts.filter(a => !isSevere(a.severity)).length,
        overdueMaintenance: alerts.filter(a => isSevere(a.severity)).length,
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
      const [assignments, vehicles, drivers] = await Promise.all([
        AssignmentService.getAssignments(),
        VehicleService.getVehicles(),
        DriverService.getDrivers(),
      ]);

      const vehicleNameById = new Map(
        vehicles
          .filter(v => !!v.id)
          .map(v => [v.id as string, v.license_plate || v.model || (v.id as string)] as const)
      );

      const driverNameById = new Map(
        drivers
          .filter(d => !!d.id)
          .map(d => [d.id as string, d.name || d.user_id || (d.id as string)] as const)
      );

      const progressForStatus = (status?: string) => {
        if (status === 'Completed') return 100;
        if (status === 'Active') return 50;
        return 0;
      };

      return assignments.slice(0, 5).map(a => {
        const vehicleId = a.vehicle_id || '';
        const driverId = a.driver_id || '';
        return {
          id: a.id || '',
          vehicleId,
          driverId,
          vehicleName: vehicleNameById.get(vehicleId) || vehicleId,
          driverName: driverNameById.get(driverId) || driverId,
          status: a.status as any,
          startDate: a.start_time || '',
          endDate: a.end_time || '',
          location: '—',
          progress: progressForStatus(a.status),
        };
      });
    } catch (error) {
      console.error('Failed to fetch assignments', error);
      return [];
    }
  },

  getAlerts: async (): Promise<Alert[]> => {
    try {
      const alerts = await MaintenanceService.getAlerts();

      const toUiSeverity = (sev?: string): 'high' | 'medium' | 'low' => {
        if (sev === 'Critical' || sev === 'High') return 'high';
        if (sev === 'Medium') return 'medium';
        return 'low';
      };

      return alerts.map(a => ({
        id: a.id || '',
        type: 'maintenance',
        message: `${a.type || 'Alert'} for ${a.entity_id || 'unknown entity'}`,
        severity: toUiSeverity(a.severity),
      }));
    } catch (error) {
      console.error('Failed to fetch alerts', error);
      return [];
    }
  },
};
