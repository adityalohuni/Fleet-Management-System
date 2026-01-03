import { VehicleService as ClientVehicleService } from '../client';
import { Vehicle, MaintenanceRecord } from '../types';

export const VehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    try {
      const vehicles = await ClientVehicleService.getVehicles();
      return vehicles.map(v => ({
        id: v.id || '',
        model: `${v.make || ''} ${v.model || ''}`,
        type: 'Truck', // Default
        status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
        mileage: 0, // Placeholder
        lastService: '2024-01-01', // Placeholder
        utilization: 0 // Placeholder
      }));
    } catch (error) {
      console.error('Failed to fetch vehicles', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Vehicle> => {
    try {
      const v = await ClientVehicleService.getVehicleById(id);
      return {
          id: v.id || '',
          model: `${v.make || ''} ${v.model || ''}`,
          type: 'Truck',
          status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
          mileage: 0,
          lastService: '2024-01-01',
          utilization: 0
      };
    } catch (error) {
      console.error('Failed to fetch vehicle', error);
      throw error;
    }
  },

  create: async (vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    try {
      const v = await ClientVehicleService.createVehicle({
        make: vehicle.model.split(' ')[0] || 'Unknown',
        model: vehicle.model.split(' ').slice(1).join(' ') || 'Unknown',
        year: 2024, // Default
        status: (vehicle.status === 'Assigned' ? 'InUse' : vehicle.status === 'In Maintenance' ? 'Maintenance' : 'Available') as any
      });
      return {
        id: v.id || '',
        model: `${v.make || ''} ${v.model || ''}`,
        type: 'Truck',
        status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
        mileage: 0,
        lastService: '2024-01-01',
        utilization: 0
      };
    } catch (error) {
      console.error('Failed to create vehicle', error);
      throw error;
    }
  },

  update: async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    try {
      const v = await ClientVehicleService.updateVehicle(id, {
        make: vehicle.model?.split(' ')[0],
        model: vehicle.model?.split(' ').slice(1).join(' '),
        status: vehicle.status ? (vehicle.status === 'Assigned' ? 'InUse' : vehicle.status === 'In Maintenance' ? 'Maintenance' : 'Available') as any : undefined
      });
      return {
        id: v.id || '',
        model: `${v.make || ''} ${v.model || ''}`,
        type: 'Truck',
        status: (v.status === 'InUse' ? 'Assigned' : v.status === 'Maintenance' ? 'In Maintenance' : 'Available') as any,
        mileage: 0,
        lastService: '2024-01-01',
        utilization: 0
      };
    } catch (error) {
      console.error('Failed to update vehicle', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await ClientVehicleService.deleteVehicle(id);
    } catch (error) {
      console.error('Failed to delete vehicle', error);
      throw error;
    }
  },

  getMaintenanceHistory: async (id: string): Promise<MaintenanceRecord[]> => {
    return [];
  },
};
