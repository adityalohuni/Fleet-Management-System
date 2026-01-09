import api from './api';
import { Driver, Assignment } from '../types';

export const DriverService = {
  getAll: async (): Promise<Driver[]> => {
    try {
      const { data: drivers } = await api.get<any[]>('/drivers');
      console.log('Fetched drivers from API:', drivers);
      if (!Array.isArray(drivers)) {
        console.error('Expected array from drivers endpoint, got:', typeof drivers);
        return [];
      }
      return drivers.map(d => ({
        id: d.id || '',
        name: d.name || d.email || 'Unknown',
        license: d.license_number || 'N/A',
        licenseExpiry: d.license_expiry || '2025-01-01',
        availability: (d.status === 'Available' ? 'Available' : d.status === 'OnDuty' ? 'On Duty' : d.status === 'OffDuty' ? 'Off Duty' : 'Off Duty') as any,
        hoursThisWeek: 0, // Placeholder - not tracked yet
        wageRate: d.wage_rate ? parseFloat(d.wage_rate) : 25,
        phone: d.phone || 'N/A',
        email: d.email || 'unknown@example.com'
      }));
    } catch (error) {
      console.error('Failed to fetch drivers', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Driver> => {
    try {
      const { data: d } = await api.get<any>(`/drivers/${id}`);
      return {
        id: d.id || '',
        name: d.name || d.email || 'Unknown',
        license: d.license_number || 'N/A',
        licenseExpiry: d.license_expiry || '2025-01-01',
        availability: (d.status === 'Available' ? 'Available' : d.status === 'OnDuty' ? 'On Duty' : d.status === 'OffDuty' ? 'Off Duty' : 'Off Duty') as any,
        hoursThisWeek: 0,
        wageRate: d.wage_rate ? parseFloat(d.wage_rate) : 25,
        phone: d.phone || 'N/A',
        email: d.email || 'unknown@example.com'
      };
    } catch (error) {
      console.error('Failed to fetch driver', error);
      throw error;
    }
  },

  create: async (driver: Omit<Driver, 'id'> & { user_id?: string }): Promise<Driver> => {
    try {
      const userId = driver.user_id;
      if (!userId) {
        throw new Error('User ID is required to create a driver');
      }
      
      const { data: d } = await api.post<any>('/drivers', {
        user_id: userId,
        status: driver.availability === 'Available' ? 'Available' : 'OffDuty',
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
      const { data: d } = await api.put<any>(`/drivers/${id}`, {
        status: driver.availability === 'Available' ? 'Available' : 'OffDuty',
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
      await api.delete(`/drivers/${id}`);
    } catch (error) {
      console.error('Failed to delete driver', error);
      throw error;
    }
  },

  getAssignmentHistory: async (id: string): Promise<Assignment[]> => {
    try {
      const { data: assignments } = await api.get<any[]>(`/assignments/driver/${id}`);
      if (!Array.isArray(assignments)) {
        console.error('Expected array from assignment history endpoint, got:', typeof assignments);
        return [];
      }
      // Map backend assignments to frontend Assignment type
      return assignments.map((a: any) => ({
        id: a.id || '',
        vehicleId: a.vehicle_id || '',
        driverId: a.driver_id || '',
        startDate: a.start_time || new Date().toISOString(),
        endDate: a.end_time || null,
        status: (a.status || 'Active') as any,
        notes: '',
      }));
    } catch (error) {
      console.error('Failed to fetch driver assignment history', error);
      return [];
    }
  },
};
