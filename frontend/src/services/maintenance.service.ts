import { MaintenanceService as ClientMaintenanceService } from '../client';
import { MaintenanceRecord, Alert } from '../types';

export const MaintenanceService = {
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const alerts = await ClientMaintenanceService.getAlerts();
      return alerts.map(a => ({
        id: a.id || '',
        entityId: a.entity_id || '',
        type: a.type || '',
        severity: (a.severity as any) || 'Low',
        isResolved: a.is_resolved || false,
        createdAt: a.created_at || new Date().toISOString(),
        resolvedAt: a.resolved_at,
      }));
    } catch (error) {
      console.error('Failed to fetch alerts', error);
      return [];
    }
  },

  resolveAlert: async (id: string): Promise<void> => {
    try {
      await ClientMaintenanceService.resolveAlert(id);
    } catch (error) {
      console.error('Failed to resolve alert', error);
      throw error;
    }
  },

  getRecordsByVehicle: async (vehicleId: string): Promise<MaintenanceRecord[]> => {
    try {
      const records = await ClientMaintenanceService.getVehicleMaintenanceRecords(vehicleId);
      return records.map(r => ({
        id: r.id || '',
        vehicleId: r.vehicle_id || '',
        type: (r.type as any) || 'Preventive',
        cost: parseFloat(r.cost || '0'),
        date: r.date || new Date().toISOString(),
        provider: r.provider || '',
        description: r.description || '',
      }));
    } catch (error) {
      console.error('Failed to fetch maintenance records', error);
      return [];
    }
  },

  createRecord: async (record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> => {
    try {
      const r = await ClientMaintenanceService.createMaintenanceRecord({
        vehicle_id: record.vehicleId || '',
        type: (record.type as any) || 'Preventive',
        cost: record.cost.toString(),
        date: record.date,
        provider: record.provider,
        description: record.description,
      });
      return {
        id: r.id || '',
        vehicleId: r.vehicle_id || '',
        type: (r.type as any) || 'Preventive',
        cost: parseFloat(r.cost || '0'),
        date: r.date || '',
        provider: r.provider || '',
        description: r.description || '',
      };
    } catch (error) {
      console.error('Failed to create maintenance record', error);
      throw error;
    }
  }
};
