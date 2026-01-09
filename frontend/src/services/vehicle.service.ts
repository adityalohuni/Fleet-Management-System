import api from './api';
import { Vehicle, MaintenanceRecord } from '../types';

export const VehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    try {
      const { data: vehicles } = await api.get<any[]>('/vehicles');
      if (!Array.isArray(vehicles)) {
        console.error('Expected array from vehicles endpoint, got:', typeof vehicles);
        return [];
      }
      return vehicles.map(v => ({
        id: v.id || '',
        model: `${v.make || ''} ${v.model || ''}`,
        type: 'Truck', // Default
        status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
        mileage: v.current_mileage || 0,
        lastService: v.last_service_date || '2024-01-01',
        utilization: 0 // Placeholder
      }));
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Vehicle> => {
    try {
      const { data: v } = await api.get<any>(`/vehicles/${id}`);
      return {
          id: v.id || '',
          model: `${v.make || ''} ${v.model || ''}`,
          type: 'Truck',
          status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
          mileage: v.current_mileage || 0,
          lastService: v.last_service_date || '2024-01-01',
          utilization: 0
      };
    } catch (error) {
      console.error('Failed to fetch vehicle', error);
      throw error;
    }
  },

  create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    try {
      const { data: v } = await api.post<any>('/vehicles', {
        make: vehicle.model.split(' ')[0] || 'Unknown',
        model: vehicle.model.split(' ').slice(1).join(' ') || 'Unknown',
        year: 2024,
        vin: `VIN${Date.now()}`,
        license_plate: `PLATE${Date.now()}`,
        type: 'Truck',
        current_mileage: vehicle.mileage || 0,
        fuel_type: 'Diesel',
        specs: null
      });
      return {
        id: v.id || '',
        model: `${v.make || ''} ${v.model || ''}`,
        type: 'Truck',
        status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
        mileage: v.current_mileage || 0,
        lastService: v.last_service_date || '2024-01-01',
        utilization: 0
      };
    } catch (error) {
      console.error('Failed to create vehicle', error);
      throw error;
    }
  },

  update: async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const { data: v } = await api.put<any>(`/vehicles/${id}`, {
        status: vehicle.status ? (vehicle.status === 'Assigned' ? 'Assigned' : vehicle.status === 'In Maintenance' ? 'Maintenance' : 'Available') : undefined
      });
      return {
        id: v.id || '',
        model: `${v.make || ''} ${v.model || ''}`,
        type: 'Truck',
        status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
        mileage: v.current_mileage || 0,
        lastService: v.last_service_date || '2024-01-01',
        utilization: 0
      };
    } catch (error) {
      console.error('Failed to update vehicle', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/vehicles/${id}`);
    } catch (error) {
      console.error('Failed to delete vehicle', error);
      throw error;
    }
  },

  getMaintenanceHistory: async (id: string): Promise<MaintenanceRecord[]> => {
    try {
      const { data: records } = await api.get<any[]>(`/maintenance/records/vehicle/${id}`);
      return Array.isArray(records) ? records.map((r: any) => ({
        id: r.id,
        date: r.maintenance_date || r.date,
        type: r.maintenance_type || r.type,
        cost: parseFloat(r.cost) || 0,
        provider: r.provider || 'N/A',
        description: r.description,
        vehicleId: id,
      })) : [];
    } catch (error) {
      console.error('Failed to fetch maintenance history', error);
      return [];
    }
  },
};
