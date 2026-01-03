import { DriverService as ClientDriverService } from '../client';
import { Driver, Assignment } from '../types';

export const DriverService = {
  getAll: async (): Promise<Driver[]> => {
    try {
      const drivers = await ClientDriverService.getDrivers();
      return drivers.map(d => ({
        id: d.id || '',
        name: d.name || 'Unknown',
        license: d.license_number || 'N/A',
        licenseExpiry: '2025-01-01', // Placeholder
        availability: (d.status === 'Active' ? 'Available' : 'Off Duty') as any,
        hoursThisWeek: 0, // Placeholder
        wageRate: 25, // Placeholder
        phone: '555-0123', // Placeholder
        email: 'driver@example.com' // Placeholder
      }));
    } catch (error) {
      console.error('Failed to fetch drivers', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Driver> => {
    try {
      const d = await ClientDriverService.getDriverById(id);
      return {
        id: d.id || '',
        name: d.name || 'Unknown',
        license: d.license_number || 'N/A',
        licenseExpiry: '2025-01-01',
        availability: (d.status === 'Active' ? 'Available' : 'Off Duty') as any,
        hoursThisWeek: 0,
        wageRate: 25,
        phone: '555-0123',
        email: 'driver@example.com'
      };
    } catch (error) {
      console.error('Failed to fetch driver', error);
      throw error;
    }
  },

  create: async (driver: Omit<Driver, 'id'>): Promise<Driver> => {
    try {
      const d = await ClientDriverService.createDriver({
        name: driver.name,
        status: driver.availability === 'Available' ? 'Active' : 'Inactive',
        license_number: driver.license
      });
      return {
        id: d.id || '',
        name: d.name || '',
        license: d.license_number || '',
        licenseExpiry: driver.licenseExpiry,
        availability: (d.status === 'Active' ? 'Available' : 'Off Duty') as any,
        hoursThisWeek: driver.hoursThisWeek,
        wageRate: driver.wageRate,
        phone: driver.phone,
        email: driver.email
      };
    } catch (error) {
      console.error('Failed to create driver', error);
      throw error;
    }
  },

  update: async (id: string, driver: Partial<Driver>): Promise<Driver> => {
    try {
      const d = await ClientDriverService.updateDriver(id, {
        name: driver.name,
        status: driver.availability === 'Available' ? 'Active' : 'Inactive',
        license_number: driver.license
      });
      return {
        id: d.id || '',
        name: d.name || '',
        license: d.license_number || '',
        licenseExpiry: driver.licenseExpiry || '2025-01-01',
        availability: (d.status === 'Active' ? 'Available' : 'Off Duty') as any,
        hoursThisWeek: driver.hoursThisWeek || 0,
        wageRate: driver.wageRate || 25,
        phone: driver.phone || '555-0123',
        email: driver.email || 'driver@example.com'
      };
    } catch (error) {
      console.error('Failed to update driver', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await ClientDriverService.deleteDriver(id);
    } catch (error) {
      console.error('Failed to delete driver', error);
      throw error;
    }
  },

  getAssignmentHistory: async (id: string): Promise<Assignment[]> => {
    // This endpoint might not exist in the generated client yet or needs to be added to openapi.json
    // For now, return empty array or mock
    return []; 
  },
};
