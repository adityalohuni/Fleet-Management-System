import api from './api';
import { MaintenanceRecord, Alert } from '../types';
import { CreateAlertDto } from '../client/models/CreateAlertDto';

export const MaintenanceService = {
  getAlerts: async (): Promise<Alert[]> => {
    try {
      const { data } = await api.get<any[]>('/maintenance/alerts');
      if (!Array.isArray(data)) {
        console.error('Expected array from alerts endpoint, got:', typeof data);
        return [];
      }
      return data.map(a => ({
        id: a.id || '',
        entityId: a.entity_id || '',
        type: a.type || '',
        message: a.message || '',
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

  createAlert: async (alert: { entityId: string; type: string; severity: 'Low' | 'Medium' | 'High' | 'Critical' }): Promise<Alert> => {
    try {
      const dto: CreateAlertDto = {
        entity_id: alert.entityId,
        type: alert.type,
        severity: alert.severity as any,
      };
      const { data } = await api.post<any>('/maintenance/alerts', dto);
      return {
        id: data.id || '',
        entityId: data.entity_id || '',
        type: data.type || '',
        message: data.message || '',
        severity: (data.severity as any) || 'Low',
        isResolved: data.is_resolved || false,
        createdAt: data.created_at || new Date().toISOString(),
        resolvedAt: data.resolved_at,
      };
    } catch (error) {
      console.error('Failed to create alert', error);
      throw error;
    }
  },

  resolveAlert: async (id: string): Promise<void> => {
    try {
      await api.patch(`/maintenance/alerts/${id}/resolve`);
    } catch (error) {
      console.error('Failed to resolve alert', error);
      throw error;
    }
  },

  getRecordsByVehicle: async (vehicleId: string): Promise<MaintenanceRecord[]> => {
    try {
      const { data } = await api.get<any[]>(`/maintenance/records/vehicle/${vehicleId}`);
      return data.map(r => ({
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
      const { data } = await api.post<any>('/maintenance/records', {
        vehicle_id: record.vehicleId || '',
        type: (record.type as any) || 'Preventive',
        cost: record.cost.toString(),
        date: record.date,
        provider: record.provider,
        description: record.description,
      });
      return {
        id: data.id || '',
        vehicleId: data.vehicle_id || '',
        type: (data.type as any) || 'Preventive',
        cost: parseFloat(data.cost || '0'),
        date: data.date || '',
        provider: data.provider || '',
        description: data.description || '',
      };
    } catch (error) {
      console.error('Failed to create maintenance record', error);
      throw error;
    }
  }
};

